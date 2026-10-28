"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  buildHorizon,
  horizon,
  HORIZON,
  horizonLayout,
  horizonRotation,
  pointerLight,
  stepHorizon,
} from "@/lib/horizon";

/* ------------------------------------------------------------------
   The footer's horizon in the orb's own dots: the same shading (a dot
   shows once the light beats its dither threshold), colours, size and
   soft round points, on a sphere so big only its crown clears the edge.
   The pointer is a light you shine across it (and parts and warms the
   dots near it), a tap sends a ripple across it, and the first time the
   footer shows its dots gather in from a loose cloud, like the hero's.
   ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  uniform vec2 uRes;
  uniform float uDpr;
  uniform vec2 uCenter;
  uniform float uRadius;
  uniform mat3 uRot;
  uniform vec3 uLight;
  uniform vec3 uPointer;
  uniform vec4 uRipple;
  uniform float uDot;
  uniform float uIntro;

  attribute vec4 aSeed; // dither threshold, size, gather order, phase

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float rl = length(position);
    vec3 n = position / rl;

    // a ripple runs out from a tap at the hero's pace (in px, so it reads the same on this bigger sphere)
    float wave = 0.0;
    if (uRipple.w >= 0.0) {
      float ang = acos(clamp(dot(n, uRipple.xyz), -1.0, 1.0));
      float front = uRipple.w * 860.0 / uRadius;
      wave = exp(-pow((ang - front) / (80.0 / uRadius), 2.0)) * (1.0 - smoothstep(1.0, 2.4, uRipple.w));
    }

    vec3 nv = uRot * n;
    vec3 v = nv * (rl + wave * 22.0 / uRadius);
    vec2 p = uCenter + vec2(v.x, -v.y) * uRadius;

    // the dots gather in from a loose cloud below, a little apart, quick at first and
    // settling (the hero's intro curve), so something is moving from the first frame
    float gather = 1.0 - pow(1.0 - clamp((uIntro - aSeed.z * 0.3) / 0.7, 0.0, 1.0), 3.0);
    float drift = aSeed.w * 6.2832;
    p += (vec2(cos(drift), sin(drift) * 0.55) * (70.0 + aSeed.y * 240.0) + vec2(0.0, 150.0)) * (1.0 - gather);

    // the pointer parts the dots and warms them
    vec2 dp = p - uPointer.xy;
    float dist = length(dp);
    float near = uPointer.z * (1.0 - smoothstep(0.0, 130.0, dist));
    p += dp / max(dist, 1.0) * near * 28.0;

    float light = pow(max(dot(nv, uLight), 0.0), 0.9);
    float facing = smoothstep(-0.3, 0.25, nv.z);
    float energy = light + wave * 0.85 + near * 0.55;
    float show = smoothstep(aSeed.x - 0.07, aSeed.x + 0.07, energy * 1.06 + 0.05);
    // a sparse grain stays in the shadow so the whole crown reads
    show = max(show, step(aSeed.x, 0.06) * 0.5) * facing;

    vec3 grain = vec3(0.36, 0.29, 0.25);
    vec3 ember = vec3(1.0, 0.42, 0.21);
    vec3 amber = vec3(1.0, 0.71, 0.15);
    vec3 hot = vec3(1.0, 0.93, 0.84);
    vec3 col = mix(grain, ember, smoothstep(0.04, 0.42, energy));
    col = mix(col, amber, smoothstep(0.58, 0.98, energy));
    col = mix(col, hot, smoothstep(0.95, 1.3, energy) * aSeed.y);

    float size = uDot * (0.72 + aSeed.y * 0.62) * (0.88 + 0.28 * light);
    float alpha = show * (0.32 + 0.68 * smoothstep(0.0, 0.75, energy)) * gather;

    gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
    gl_PointSize = max(1.0, size * uDpr);
    vColor = col;
    vAlpha = alpha;
  }
`;

// the hero's dot: soft round point
const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.18, length(c)) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

function Crown({ count }: { count: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const rot = useMemo(() => new THREE.Matrix3(), []);
  const s = useRef({
    force: 0,
    px: -9999,
    py: -9999,
    light: new THREE.Vector3(...HORIZON.light),
    aim: new THREE.Vector3(),
  });

  const geometry = useMemo(() => {
    const { pos, seed } = buildHorizon(count);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uCenter: { value: new THREE.Vector2() },
      uRadius: { value: 1 },
      uRot: { value: rot },
      uLight: { value: new THREE.Vector3(...HORIZON.light) },
      uPointer: { value: new THREE.Vector3(-9999, -9999, 0) },
      uRipple: { value: new THREE.Vector4(0, 1, 0, -1) },
      uDot: { value: 2.1 },
      uIntro: { value: 0 },
    }),
    [rot],
  );

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) return;
    const dt = Math.min(delta, 1 / 20);
    const st = s.current;
    const { size, gl } = state;
    stepHorizon(dt);

    // pointer: smoothed, as on the orb
    const k = 1 - Math.exp(-dt * 8);
    st.force += ((horizon.pointer.over ? 1 : 0) - st.force) * (1 - Math.exp(-dt * 5));
    if (horizon.pointer.over) {
      st.px += (horizon.pointer.x - st.px) * (st.px < -9000 ? 1 : k);
      st.py += (horizon.pointer.y - st.py) * (st.py < -9000 ? 1 : k);
    }

    const L = horizonLayout(size.width, size.height);
    // the light swings to the pointer while it's over the footer, and back to rest after
    st.aim.set(...(horizon.pointer.over ? pointerLight(st.px, st.py, L) : HORIZON.light));
    st.light.lerp(st.aim, 1 - Math.exp(-dt * 3)).normalize();
    const u = mat.uniforms;
    u.uRes.value.set(size.width, size.height);
    u.uDpr.value = gl.getPixelRatio();
    u.uCenter.value.set(L.x, L.y);
    u.uRadius.value = L.r;
    u.uLight.value.copy(st.light);
    rot.set(...horizonRotation(horizon.yaw));
    u.uPointer.value.set(st.px, st.py, st.force);
    u.uRipple.value.set(horizon.ripple.x, horizon.ripple.y, horizon.ripple.z, horizon.ripple.t);
    u.uIntro.value = horizon.intro;
    u.uDot.value = size.width < 760 ? 2.0 : 2.1;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export type HorizonSceneProps = {
  count: number;
  active: boolean;
};

export default function HorizonScene({ count, active }: HorizonSceneProps) {
  return (
    <Canvas
      className="!pointer-events-none"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      orthographic
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Crown count={count} />
    </Canvas>
  );
}
