"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { nebula } from "@/lib/nebula-store";

/* ------------------------------------------------------------------
   Particle field — the design's 2D nebula rebuilt in 3D:
   cloud (irregular lobes, dense core) · flowing filaments · bright
   embers · faint background stars. Everything warm, additive.
   ------------------------------------------------------------------ */

type RGB = [number, number, number];

const PALETTE: Array<{ c: RGB; w: number }> = [
  { c: [255, 241, 221], w: 0.05 }, // white-hot
  { c: [255, 199, 77], w: 0.2 }, // gold
  { c: [255, 150, 60], w: 0.24 }, // warm orange
  { c: [255, 107, 53], w: 0.26 }, // ember #FF6B35
  { c: [230, 66, 28], w: 0.16 }, // ember red
  { c: [205, 52, 30], w: 0.06 }, // deep ember
  { c: [140, 46, 40], w: 0.03 }, // maroon
];

function weighted(arr: typeof PALETTE) {
  const total = arr.reduce((s, p) => s + p.w, 0);
  let roll = Math.random() * total;
  for (const p of arr) {
    roll -= p.w;
    if (roll <= 0) return p.c;
  }
  return arr[arr.length - 1].c;
}

function pickColor(r: number) {
  if (r < 0.22) return weighted(PALETTE.slice(0, 4));
  if (r < 0.6) return weighted(PALETTE.slice(1, 5));
  return weighted(PALETTE.slice(3, 7));
}

const angularDensity = (a: number) =>
  0.55 +
  0.26 * Math.sin(3 * a + 0.7) +
  0.18 * Math.sin(5 * a + 2.1) +
  0.12 * Math.sin(7 * a + 4.0) +
  0.1 * Math.sin(2 * a + 1.0);

// cheap gaussian
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

const KIND = { cloud: 0, filament: 1, ember: 2, star: 3 } as const;

function buildField(count: number) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const kind = new Float32Array(count);
  const seed = new Float32Array(count);
  const alpha = new Float32Array(count);
  const arm = new Float32Array(count * 4);

  const nFil = Math.floor(count * 0.17);
  const nEmber = Math.floor(count * 0.018);
  const nStar = Math.floor(count * 0.06);
  const nCloud = count - nFil - nEmber - nStar;

  // filament arms, biased toward the dense lobes
  const arms: Array<[number, number, number]> = [];
  for (let f = 0; f < 16; f++) {
    const base = (f / 16) * Math.PI * 2 + Math.random() * 0.3;
    if (angularDensity(base) < 0.5 && Math.random() < 0.6) continue;
    arms.push([base, 0.7 + Math.random() * 0.7, (Math.random() - 0.5) * 0.6]);
  }

  let i = 0;
  const put = (x: number, y: number, z: number, c: RGB, s: number, k: number, a: number) => {
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    col[i * 3] = c[0] / 255;
    col[i * 3 + 1] = c[1] / 255;
    col[i * 3 + 2] = c[2] / 255;
    size[i] = s;
    kind[i] = k;
    seed[i] = Math.random();
    alpha[i] = a;
    i++;
  };

  // 1) cloud — rejection-sampled irregular lobes, dense toward the core
  let guard = 0;
  while (i < nCloud && guard < nCloud * 6) {
    guard++;
    const a = Math.random() * Math.PI * 2;
    if (Math.random() > angularDensity(a)) continue;
    let rr = Math.pow(Math.random(), 1.9);
    if (Math.random() < 0.04) rr = 0.85 + Math.random() * 0.55;
    const x = Math.cos(a) * rr + (Math.random() - 0.5) * 0.05;
    const y = Math.sin(a) * rr * 0.92 + (Math.random() - 0.5) * 0.05;
    const z = gauss() * (0.12 + 0.3 * rr);
    const s = Math.random() < 0.86 ? 1 : Math.random() < 0.7 ? 1.6 : 2.4;
    const al = Math.max(0.06, Math.min(0.95, (1 - rr * 0.72) * (0.32 + Math.random() * 0.6)));
    put(x, y, z, pickColor(rr), s, KIND.cloud, al);
  }
  // 2) filaments — positions are computed in the shader (they flow outward)
  for (let n = 0; n < nFil && arms.length; n++) {
    const [base, len, curve] = arms[n % arms.length];
    const c = pickColor(0.45 + Math.random() * 0.5);
    put(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      gauss() * 0.08,
      c,
      Math.random() < 0.85 ? 1 : 1.6,
      KIND.filament,
      0.35 + Math.random() * 0.5,
    );
    const j = i - 1;
    arm[j * 4] = base;
    arm[j * 4 + 1] = len;
    arm[j * 4 + 2] = curve;
    arm[j * 4 + 3] = Math.random();
  }
  // 3) embers — big soft glows near the core
  for (let n = 0; n < nEmber; n++) {
    const a = Math.random() * Math.PI * 2;
    const rr = Math.pow(Math.random(), 1.3) * 0.5;
    put(
      Math.cos(a) * rr,
      Math.sin(a) * rr * 0.92,
      gauss() * 0.15,
      pickColor(rr),
      7 + Math.random() * 9,
      KIND.ember,
      0.55 + Math.random() * 0.4,
    );
  }
  // 4) faint background stars across a wide, deep field
  for (let n = 0; n < nStar; n++) {
    const c: RGB = Math.random() < 0.5 ? [255, 199, 77] : [255, 160, 120];
    put(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 4.2,
      -0.5 - Math.random() * 2.5,
      c,
      1 + Math.random(),
      KIND.star,
      0.15 + Math.random() * 0.35,
    );
  }
  const used = i;
  return { pos, col, size, kind, seed, alpha, arm, used };
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform float uDust;
  uniform float uIntro;
  uniform float uIntensity;
  uniform float uDefocus;
  uniform vec2 uMouse;
  uniform float uMouseForce;

  attribute vec3 aColor;
  attribute float aSize;
  attribute float aKind;
  attribute float aSeed;
  attribute float aAlpha;
  attribute vec4 aArm;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vCore;
  varying float vSoft;

  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  void main() {
    vec3 p = position;
    float fade = 1.0;

    if (aKind > 0.5 && aKind < 1.5) {
      // filament: stream outward along a curved arm, fading in and out
      float t = fract(aArm.w + uTime * (0.012 + aSeed * 0.01));
      float a = aArm.x + aArm.z * t * t;
      float r = aArm.y * t;
      vec2 spread = position.xy * ((1.0 - t) * 0.05 + 0.012);
      p = vec3(cos(a) * r + spread.x, sin(a) * r * 0.92 + spread.y, position.z * (1.0 - t));
      fade = sin(t * 3.14159);
    }

    if (aKind < 2.5) {
      // slow differential swirl (inner faster) + a little turbulence
      float r = length(p.xy);
      p.xy = rot(uTime * (0.012 + 0.018 / (0.35 + r))) * p.xy;
      p.x += sin(uTime * 0.45 + aSeed * 6.283 + p.y * 3.0) * 0.012;
      p.y += cos(uTime * 0.38 + aSeed * 4.0 + p.x * 3.0) * 0.012;
    }

    // intro: the field gathers in from a wider, fainter spread
    float intro = 1.0 - pow(1.0 - uIntro, 3.0);
    p.xy *= mix(1.9 + aSeed * 0.8, 1.0, intro);

    // the cursor parts the cloud
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    p.xy += (d / max(dist, 1e-4)) * uMouseForce * smoothstep(0.3, 0.0, dist) * 0.06;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float twinkle = 1.0;
    if (aKind > 1.5) twinkle = 0.45 + 0.55 * abs(sin(uTime * (0.6 + aSeed * 1.6) + aSeed * 30.0));

    // crisp dust specks + soft ember glows; as the camera pushes in the points
    // swell into bokeh but keep their energy, so the core never blows out
    float ember = aKind > 1.5 && aKind < 2.5 ? 1.0 : 0.0;
    float base = aSize * mix(uDust, uScale, ember) * uPixelRatio;
    float size = clamp(base * (1.0 + uDefocus * 1.2) * (8.0 / -mv.z), 1.0, 140.0);
    gl_PointSize = size;
    float growth = max(1.0, size / max(base, 0.001));

    vColor = aColor;
    vCore = ember;
    vSoft = clamp(uDefocus * 1.6, 0.0, 1.0);
    vAlpha = aAlpha * fade * twinkle * uIntensity * intro / growth;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vCore;
  varying float vSoft;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    // embers: wide halo · dust: crisp speck that softens into bokeh up close
    float speck = smoothstep(0.25, 0.02, d2);
    float a = vCore > 0.5 ? exp(-d2 * 9.0) * 0.9 : mix(speck, exp(-d2 * 18.0), vSoft);
    a *= vAlpha;
    if (a < 0.003) discard;
    vec3 hot = mix(vColor, vec3(1.0, 0.95, 0.86), vCore * exp(-d2 * 60.0));
    gl_FragColor = vec4(hot * a, a);
  }
`;

function Field({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const startedAt = useRef<number | null>(null);
  const smooth = useRef({ mx: 0, my: 0, force: 0, intensity: 0, hero: 0, time: 0 });

  const geometry = useMemo(() => {
    const f = buildField(count);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(f.pos.subarray(0, f.used * 3), 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(f.col.subarray(0, f.used * 3), 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(f.size.subarray(0, f.used), 1));
    g.setAttribute("aKind", new THREE.BufferAttribute(f.kind.subarray(0, f.used), 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(f.seed.subarray(0, f.used), 1));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(f.alpha.subarray(0, f.used), 1));
    g.setAttribute("aArm", new THREE.BufferAttribute(f.arm.subarray(0, f.used * 4), 4));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uScale: { value: 3.2 },
      uDust: { value: 1.9 },
      uIntro: { value: 0 },
      uIntensity: { value: 0 },
      uDefocus: { value: 0 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uMouseForce: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    const mat = points.current?.material as THREE.ShaderMaterial | undefined;
    if (!g || !mat) return;
    const { size, viewport, camera, gl, clock } = state;
    const u = mat.uniforms;
    const t = clock.elapsedTime;
    if (startedAt.current === null) startedAt.current = t;
    const s = smooth.current;
    const k = 1 - Math.exp(-delta * 4); // frame-rate independent smoothing

    // composition from the design: centre-right, a touch above the middle
    const narrow = size.width < 760;
    const cx = (narrow ? 0.6 : 0.64) - 0.5;
    const cy = 0.5 - (narrow ? 0.4 : 0.46);
    const radiusPx = Math.min(size.width, size.height) * (narrow ? 0.5 : 0.46);
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
    const worldPerPx = vp.width / size.width;
    g.position.set(cx * vp.width, cy * vp.height, 0);
    g.scale.setScalar(radiusPx * worldPerPx);

    // scroll: push the camera into the core, the field melts into soft bokeh
    s.hero += (nebula.hero - s.hero) * k;
    const e = Math.pow(s.hero, 1.5); // eases in: drift, then fly into the core
    s.intensity += (nebula.intensity - s.intensity) * (1 - Math.exp(-delta * 2.5));

    // pointer: gentle parallax + the cloud parts around the cursor
    const p = nebula.pointer;
    s.mx += (p.x - s.mx) * k;
    s.my += (p.y - s.my) * k;
    s.force += ((p.active ? 1 : 0) * (1 - e) - s.force) * (1 - Math.exp(-delta * 3));

    camera.position.set(
      g.position.x * e * 0.85 + s.mx * 0.22 * (1 - e),
      g.position.y * e * 0.85 + s.my * 0.14 * (1 - e),
      8 - 4.8 * e,
    );
    camera.lookAt(g.position.x * e * 0.85, g.position.y * e * 0.85, -4);

    // pointer → nebula-local coordinates on the z=0 plane
    const wx = (s.mx * vp.width) / 2;
    const wy = (s.my * vp.height) / 2;
    u.uMouse.value.set((wx - g.position.x) / g.scale.x, (wy - g.position.y) / g.scale.y);
    u.uMouseForce.value = s.force;

    g.rotation.set(-0.18 + s.my * 0.05, 0.12 + s.mx * 0.08, 0);

    // own clock: after a pause (Contact, an open demo window) the flow resumes
    // where it stopped instead of jumping ahead by the time it slept
    s.time += Math.min(delta, 1 / 20);
    u.uTime.value = s.time;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uIntro.value = Math.min(1, (t - startedAt.current) / 2.4);
    u.uIntensity.value = s.intensity;
    u.uDefocus.value = e;
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export type NebulaSceneProps = {
  count: number;
  active: boolean;
  onReady?: () => void;
};

export default function NebulaScene({ count, active, onReady }: NebulaSceneProps) {
  return (
    <Canvas
      className="!pointer-events-none"
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.6]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
      camera={{ fov: 40, near: 0.05, far: 50, position: [0, 0, 8] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onReady?.();
      }}
    >
      <Field count={count} />
    </Canvas>
  );
}
