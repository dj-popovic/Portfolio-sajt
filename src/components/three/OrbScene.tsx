"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { buildOrb, orb, ORB, orbLayout, orbRotation, stepOrb, viewportSize } from "@/lib/orb";

/* ------------------------------------------------------------------
   The orb, drawn in screen pixels so it can line up with the DOM: the
   hit area in the hero and, on scroll, the ★ tile the thread runs into.
   Lit from the upper right; a dot shows once the light beats its dither
   threshold, so the lit cap is dense and the shadow is a sparse grain.
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
  uniform float uMorph;
  uniform vec2 uP0;
  uniform vec2 uP1;
  uniform vec2 uP2;
  uniform vec2 uP3;
  uniform float uTime;
  uniform float uIntro;
  uniform float uDot;
  uniform vec4 uBurst; // origin (px), age in seconds (< 0: none), reach (px)

  attribute vec4 aSeed; // dither threshold, size, unravel order, phase

  varying vec3 vColor;
  varying float vAlpha;

  vec2 bez(float t) {
    float u = 1.0 - t;
    return u * u * u * uP0 + 3.0 * u * u * t * uP1 + 3.0 * u * t * t * uP2 + t * t * t * uP3;
  }
  vec2 bezTangent(float t) {
    float u = 1.0 - t;
    return 3.0 * u * u * (uP1 - uP0) + 6.0 * u * t * (uP2 - uP1) + 3.0 * t * t * (uP3 - uP2);
  }

  void main() {
    float rl = length(position);
    vec3 n = position / rl;

    // a ripple rides the surface: it lives in object space, so it turns with the orb
    float wave = 0.0;
    if (uRipple.w >= 0.0) {
      float ang = acos(clamp(dot(n, uRipple.xyz), -1.0, 1.0));
      float front = uRipple.w * 2.3;
      wave = exp(-pow((ang - front) / 0.2, 2.0)) * (1.0 - smoothstep(0.7, 1.7, uRipple.w));
    }

    vec3 nv = uRot * n;
    vec3 v = nv * (rl + wave * 0.07);
    vec2 p = uCenter + vec2(v.x, -v.y) * uRadius;

    // the pointer parts the dots and warms them
    vec2 dp = p - uPointer.xy;
    float dist = length(dp);
    float near = uPointer.z * (1.0 - smoothstep(0.0, uRadius * 0.32, dist));
    p += dp / max(dist, 1.0) * near * uRadius * 0.075;

    float light = pow(max(dot(nv, uLight), 0.0), 0.9);
    float facing = smoothstep(-0.3, 0.25, nv.z);
    float energy = light + wave * 0.85 + near * 0.55;
    float show = smoothstep(aSeed.x - 0.07, aSeed.x + 0.07, energy * 1.06 + 0.05);
    // a sparse grain stays in the shadow so the whole silhouette reads
    show = max(show, step(aSeed.x, 0.06) * 0.5) * facing;

    vec3 grain = vec3(0.36, 0.29, 0.25);
    vec3 ember = vec3(1.0, 0.42, 0.21);
    vec3 amber = vec3(1.0, 0.71, 0.15);
    vec3 hot = vec3(1.0, 0.93, 0.84);
    vec3 col = mix(grain, ember, smoothstep(0.04, 0.42, energy));
    col = mix(col, amber, smoothstep(0.58, 0.98, energy));
    col = mix(col, hot, smoothstep(0.95, 1.3, energy) * aSeed.y);

    float size = uDot * (0.72 + aSeed.y * 0.62) * (0.88 + 0.28 * light);
    float alpha = show * (0.32 + 0.68 * smoothstep(0.0, 0.75, energy));

    // scroll: the sphere unravels from the bottom into a thread that runs into the tile
    float q = clamp((uMorph - aSeed.z * 0.62) / 0.38, 0.0, 1.0);
    if (q > 0.0) {
      float t = pow(q, 1.35);
      vec2 tan = normalize(bezTangent(t) + vec2(1e-4));
      vec2 nrm = vec2(-tan.y, tan.x);
      float spread = mix(uRadius * 0.055, 0.8, t);
      float sway = sin(t * 13.0 - uTime * 2.4 + aSeed.w * 6.283) * 5.0 * (1.0 - t);
      vec2 on = bez(t) + nrm * ((aSeed.w - 0.5) * 2.0 * spread + sway);
      float join = smoothstep(0.0, 0.24, q);
      p = mix(p, on, join);
      float thread = 0.24 + 0.5 * aSeed.y;
      alpha = mix(alpha, thread, join) * (1.0 - smoothstep(0.88, 1.0, q));
      col = mix(col, mix(ember, amber, aSeed.y * aSeed.y), join);
      size = mix(size, uDot * (0.65 + aSeed.y * 0.55), join);
    }

    // the dots the tile took in burst out as the About panel opens, then cool and fade
    if (uBurst.z >= 0.0 && q >= 1.0) {
      float bt = uBurst.z;
      float ang = aSeed.w * 6.2832 + aSeed.x * 1.3;
      float spd = 0.12 + 0.88 * pow(fract(aSeed.x * 7.13 + aSeed.y * 3.7), 1.9);
      p = uBurst.xy + vec2(cos(ang), sin(ang)) * (1.0 - exp(-bt * 2.6)) * spd * uBurst.w;
      p.y -= bt * bt * 16.0 * aSeed.y;
      float life = 1.0 - smoothstep(0.15, 1.1 + aSeed.y * 0.6, bt);
      alpha = step(aSeed.y, 0.62) * (0.4 + 0.6 * aSeed.x) * life * smoothstep(0.0, 0.03, bt);
      col = mix(hot, mix(amber, ember, smoothstep(0.15, 0.9, bt)), smoothstep(0.0, 0.18, bt));
      size = uDot * (0.9 + aSeed.x * 1.2) * (1.0 - 0.35 * smoothstep(0.0, 1.4, bt));
    }

    // first load: the dots gather in from a loose cloud
    float intro = 1.0 - pow(1.0 - uIntro, 3.0);
    float a = aSeed.w * 6.283;
    p += vec2(cos(a), sin(a)) * uRadius * (0.3 + aSeed.y * 0.9) * (1.0 - intro);
    alpha *= intro;

    gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
    gl_PointSize = max(1.0, size * uDpr);
    vColor = col;
    vAlpha = alpha;
  }
`;

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

// soft glows are screen-space quads (big point sprites get clamped on some GPUs)
const quadVertex = /* glsl */ `
  uniform vec2 uRes;
  uniform vec2 uAt;
  uniform float uHalf;
  varying vec2 vUv;
  void main() {
    vUv = position.xy;
    vec2 p = uAt + vec2(position.x, -position.y) * uHalf;
    gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
  }
`;
// the orb's body: a faint lit volume behind the dots, so it reads as a sphere, not a cloud
const bodyFragment = /* glsl */ `
  uniform vec3 uLight;
  uniform float uFade;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv * 1.18;
    float r2 = dot(c, c);
    float inside = 1.0 - smoothstep(0.9, 1.0, r2);
    vec3 n = vec3(c, sqrt(max(0.0, 1.0 - r2)));
    float lam = max(dot(n, uLight), 0.0);
    float body = inside * (0.02 + 0.1 * pow(lam, 1.7));
    float halo = (1.0 - inside) * exp(-(r2 - 1.0) * 5.0) * 0.035;
    float a = (body + halo) * uFade;
    if (a < 0.003) discard;
    gl_FragColor = vec4(mix(vec3(1.0, 0.4, 0.2), vec3(1.0, 0.64, 0.28), lam), a);
  }
`;
// a glow that hugs a rounded rectangle: the ★ tile while it charges, then the
// About panel's edge as it opens. Computed per pixel, so it fades to nothing
// with no box around it.
const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
const rimFragment = /* glsl */ `
  uniform vec2 uRes;
  uniform vec4 uRect;
  uniform float uCorner;
  uniform float uSpread;
  uniform float uGlow;
  varying vec2 vUv;
  float roundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    vec2 px = vec2((vUv.x * 0.5 + 0.5) * uRes.x, (0.5 - vUv.y * 0.5) * uRes.y);
    vec2 hb = uRect.zw * 0.5;
    float d = max(roundRect(px - uRect.xy - hb, hb, min(uCorner, min(hb.x, hb.y))), 0.0);
    float rim = exp(-d / (uSpread * 0.2));
    float a = (exp(-d / uSpread) * 0.5 + rim * 0.55) * uGlow;
    if (a < 0.003) discard;
    gl_FragColor = vec4(mix(vec3(1.0, 0.36, 0.15), vec3(1.0, 0.8, 0.45), rim), a);
  }
`;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Orb({ count }: { count: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const body = useRef<THREE.ShaderMaterial>(null);
  const rot = useMemo(() => new THREE.Matrix3(), []);
  const rim = useRef<THREE.Mesh>(null);
  const rimMat = useRef<THREE.ShaderMaterial>(null);
  const s = useRef({ time: 0, start: -1, force: 0, px: -9999, py: -9999, glow: 0, open: 0, burst: -1 });

  const geometry = useMemo(() => {
    const { pos, seed } = buildOrb(count);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    return g;
  }, [count]);

  const quad = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uCenter: { value: new THREE.Vector2() },
      uRadius: { value: 1 },
      uRot: { value: rot },
      uLight: { value: new THREE.Vector3(...ORB.light) },
      uPointer: { value: new THREE.Vector3(-9999, -9999, 0) },
      uRipple: { value: new THREE.Vector4(0, 0, 1, -1) },
      uMorph: { value: 0 },
      uP0: { value: new THREE.Vector2() },
      uP1: { value: new THREE.Vector2() },
      uP2: { value: new THREE.Vector2() },
      uP3: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uDot: { value: 1.9 },
      uBurst: { value: new THREE.Vector4(0, 0, -1, 1) },
    }),
    [rot],
  );
  const bodyUniforms = useMemo(
    () => ({
      uRes: uniforms.uRes,
      uAt: uniforms.uCenter,
      uHalf: { value: 1 },
      uLight: uniforms.uLight,
      uFade: { value: 1 },
    }),
    [uniforms],
  );
  const rimUniforms = useMemo(
    () => ({
      uRes: uniforms.uRes,
      uRect: { value: new THREE.Vector4() },
      uCorner: { value: 26 },
      uSpread: { value: 26 },
      uGlow: { value: 0 },
    }),
    [uniforms],
  );

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) return;
    const dt = Math.min(delta, 1 / 20);
    const st = s.current;
    const { size, gl, clock } = state;
    stepOrb(dt);

    // own clock: after a pause (an open demo window) the thread resumes where it was
    st.time += dt;
    // the intro runs on the wall clock, so a slow first second can't stretch it
    if (st.start < 0) st.start = clock.elapsedTime;
    const intro = Math.min(1, (clock.elapsedTime - st.start) / 2.2);

    const view = viewportSize();
    const L = orbLayout(view.w, view.h);
    const m = orb.morph;
    // the orb rises a little as it unravels
    const cx = L.x;
    const cy = L.y - smoothstep(0, 1, m) * view.h * 0.26;

    // pointer: smoothed, and only while the orb is whole
    const live = orb.pointer.over && !orb.dragging && m < 0.04 ? 1 : 0;
    const k = 1 - Math.exp(-dt * 8);
    st.force += (live - st.force) * (1 - Math.exp(-dt * 5));
    if (orb.pointer.over) {
      st.px += (orb.pointer.x - st.px) * (st.px < -9000 ? 1 : k);
      st.py += (orb.pointer.y - st.py) * (st.py < -9000 ? 1 : k);
    }

    // where the thread ends: the tile's centre, or the top of the About panel
    let tx = view.w * 0.5;
    let ty = view.h * 1.8;
    const aim = orb.aim;
    if (aim && m > 0) {
      const r = aim.el.getBoundingClientRect();
      tx = r.left + r.width / 2;
      ty = aim.edge === "top" ? r.top + 4 : r.top + r.height / 2;
    }
    const p0x = cx;
    const p0y = cy + L.r * 0.9;
    const reach = Math.max(90, Math.abs(ty - p0y) * 0.45);

    const u = mat.uniforms;
    u.uRes.value.set(size.width, size.height);
    u.uDpr.value = gl.getPixelRatio();
    u.uCenter.value.set(cx, cy);
    u.uRadius.value = L.r;
    rot.set(...orbRotation(orb.yaw, orb.pitch));
    u.uPointer.value.set(st.px, st.py, st.force);
    u.uRipple.value.set(orb.ripple.x, orb.ripple.y, orb.ripple.z, orb.ripple.t);
    u.uMorph.value = m;
    u.uP0.value.set(p0x, p0y);
    u.uP1.value.set(p0x, p0y + reach);
    u.uP2.value.set(tx, ty - reach);
    u.uP3.value.set(tx, ty);
    u.uTime.value = st.time;
    u.uIntro.value = intro;
    u.uDot.value = view.w < 760 ? 2.0 : 2.1;

    const bu = body.current?.uniforms;
    if (bu) {
      bu.uHalf.value = L.r * 1.18;
      bu.uFade.value = intro * (1 - smoothstep(0, 0.55, m));
    }

    // the tile glows as the last dots arrive and holds it; as the panel opens
    // the glow rides its edge, and on the pinned stage the dots burst out
    const pn = orb.panel;
    const charge = smoothstep(0.62, 1, m);
    let glowTo = 0;
    const ru = rimMat.current?.uniforms;
    if (!ru) return;
    if (pn.live && pn.open > 0.001) {
      ru.uRect.value.set(pn.x, pn.y, pn.w, pn.h);
      ru.uCorner.value = pn.r;
      ru.uSpread.value = 26 + 64 * pn.open;
      glowTo = pn.stage
        ? charge * (1 - smoothstep(0.3, 0.8, pn.open))
        : smoothstep(0.02, 0.2, pn.open) * (1 - smoothstep(0.5, 0.95, pn.open)) * 0.75;
    } else if (aim && aim.edge === "center" && m > 0) {
      ru.uRect.value.set(tx - 44, ty - 44, 88, 88);
      ru.uCorner.value = 26;
      ru.uSpread.value = 26;
      glowTo = charge;
    }
    st.glow += (glowTo - st.glow) * (1 - Math.exp(-dt * 10));
    ru.uGlow.value = st.glow * 0.8;
    if (rim.current) rim.current.visible = st.glow > 0.004;

    if (pn.stage && pn.live) {
      if (pn.open > 0.02 && st.open <= 0.02 && m > 0.999) st.burst = 0;
      if (pn.open <= 0.005) st.burst = -1;
    }
    st.open = pn.open;
    if (st.burst >= 0) st.burst = st.burst > 2.2 ? 2.2 : st.burst + dt;
    u.uBurst.value.set(pn.x + pn.w / 2, pn.y + pn.h / 2, st.burst, Math.hypot(view.w, view.h) * 0.55);
  });

  return (
    <>
      <mesh geometry={quad} frustumCulled={false}>
        <shaderMaterial
          ref={body}
          vertexShader={quadVertex}
          fragmentShader={bodyFragment}
          uniforms={bodyUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={rim} geometry={quad} frustumCulled={false} visible={false}>
        <shaderMaterial
          ref={rimMat}
          vertexShader={screenVertex}
          fragmentShader={rimFragment}
          uniforms={rimUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
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
    </>
  );
}

export type OrbSceneProps = {
  count: number;
  active: boolean;
  onReady?: () => void;
};

export default function OrbScene({ count, active, onReady }: OrbSceneProps) {
  return (
    <Canvas
      className="!pointer-events-none"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      orthographic
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady?.();
      }}
    >
      <Orb count={count} />
    </Canvas>
  );
}
