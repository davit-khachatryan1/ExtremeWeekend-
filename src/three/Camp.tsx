/* The mountain camp in Lori (tents, dining canopy, toilet, solar shower, campfire with
 * sparks, fairy lights, flag) and the start village Koti. */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { env } from './env';
import { ParkedJeep } from './Jeep';
import { CAMP, KOTI, mulberry32, nearestOnRoute, routeXZ, terrainHeight } from './world';

const h = (x: number, z: number) => terrainHeight(x, z);
export const FIRE = new THREE.Vector3(CAMP.x, h(CAMP.x, CAMP.z), CAMP.z);

/* ---------------------------------------------------------------- campfire */
const flameVert = /* glsl */ `
  uniform float uTime; uniform float uSeed; varying vec2 vUv;
  void main(){
    vUv = uv;
    vec3 p = position;
    float k = uv.y;
    p.x += sin(uTime * 9.0 + uSeed + p.y * 6.0) * 0.08 * k;
    p.z += cos(uTime * 7.0 + uSeed * 2.0 + p.y * 5.0) * 0.08 * k;
    p.y *= 1.0 + sin(uTime * 11.0 + uSeed) * 0.12;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;
const flameFrag = /* glsl */ `
  uniform float uIntensity; varying vec2 vUv;
  void main(){
    vec3 core = vec3(1.0, 0.92, 0.55);
    vec3 mid = vec3(1.0, 0.5, 0.12);
    vec3 tip = vec3(0.85, 0.15, 0.05);
    vec3 c = mix(core, mid, smoothstep(0.0, 0.45, vUv.y));
    c = mix(c, tip, smoothstep(0.45, 1.0, vUv.y));
    float a = (1.0 - smoothstep(0.55, 1.0, vUv.y)) * uIntensity;
    gl_FragColor = vec4(c * 1.6, a);
  }`;

const sparkVert = /* glsl */ `
  uniform float uTime; attribute float aSeed; varying float vA;
  void main(){
    float life = fract(uTime * (0.25 + aSeed * 0.3) + aSeed * 7.0);
    vec3 p = position;
    p.y += life * (3.5 + aSeed * 3.0);
    p.x += sin(life * 6.0 + aSeed * 20.0) * 0.5 * life;
    p.z += cos(life * 5.0 + aSeed * 13.0) * 0.5 * life;
    vA = (1.0 - life) * smoothstep(0.0, 0.08, life);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.0 + aSeed * 3.0) * (12.0 / -mv.z) * 3.0;
    gl_Position = projectionMatrix * mv;
  }`;
const sparkFrag = /* glsl */ `
  uniform float uIntensity; varying float vA;
  void main(){ float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard;
    gl_FragColor = vec4(1.0, 0.62, 0.25, smoothstep(0.5, 0.0, r) * vA * uIntensity); }`;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,200,120,1)');
  grd.addColorStop(0.3, 'rgba(255,130,50,0.45)');
  grd.addColorStop(1, 'rgba(255,90,20,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Campfire() {
  const light = useRef<THREE.PointLight>(null!);
  const glow = useRef<THREE.Sprite>(null!);
  const flames = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const uniforms = { uTime: { value: 0 }, uSeed: { value: i * 2.3 }, uIntensity: { value: 1 } };
        return {
          uniforms,
          mat: new THREE.ShaderMaterial({
            vertexShader: flameVert,
            fragmentShader: flameFrag,
            uniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          }),
          scale: [1 - i * 0.22, 1 - i * 0.18, 1 - i * 0.22] as [number, number, number],
          rot: i * 1.1,
        };
      }),
    [],
  );
  const sparks = useMemo(() => {
    const n = 90;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = 0.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const uniforms = { uTime: { value: 0 }, uIntensity: { value: 1 } };
    const mat = new THREE.ShaderMaterial({
      vertexShader: sparkVert,
      fragmentShader: sparkFrag,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo: g, uniforms, mat };
  }, []);
  const glowMap = useMemo(glowTexture, []);
  const stones = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      out.push([Math.cos(a) * 0.95, 0.12, Math.sin(a) * 0.95]);
    }
    return out;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flick = 0.75 + Math.sin(t * 13) * 0.08 + Math.sin(t * 23.7) * 0.07 + Math.sin(t * 5.3) * 0.1;
    flames.forEach((f) => (f.uniforms.uTime.value = t));
    sparks.uniforms.uTime.value = t;
    sparks.uniforms.uIntensity.value = 0.4 + env.lights;
    if (light.current) light.current.intensity = (6 + env.lights * 70) * flick;
    if (glow.current) {
      const s = (3 + env.lights * 5) * (0.9 + flick * 0.15);
      glow.current.scale.set(s, s, 1);
      (glow.current.material as THREE.SpriteMaterial).opacity = 0.25 + env.lights * 0.6;
    }
  });

  return (
    <group position={FIRE}>
      {stones.map((p, i) => (
        <mesh key={i} position={p} rotation={[i, i * 2, 0]}>
          <dodecahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#77736b" flatShading roughness={1} />
        </mesh>
      ))}
      {[0, 1.05, 2.1].map((r, i) => (
        <mesh key={i} position={[0, 0.18, 0]} rotation={[0, r, Math.PI / 2 - 0.35]}>
          <cylinderGeometry args={[0.09, 0.11, 1.2, 6]} />
          <meshStandardMaterial color="#4a3020" flatShading roughness={1} />
        </mesh>
      ))}
      {flames.map((f, i) => (
        <mesh key={i} position={[0, 0.25 + 0.5 * f.scale[1], 0]} scale={f.scale} rotation-y={f.rot} material={f.mat}>
          <coneGeometry args={[0.38, 1.25, 8, 6, true]} />
        </mesh>
      ))}
      <points geometry={sparks.geo} material={sparks.mat} frustumCulled={false} />
      <sprite ref={glow} position={[0, 0.9, 0]}>
        <spriteMaterial map={glowMap} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight ref={light} position={[0, 1.4, 0]} color="#ff8a3a" distance={34} decay={1.6} />
      {/* log benches */}
      {[0.4, 2.0, 3.6, 5.0].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * 2.6, 0.22, Math.sin(a) * 2.6]} rotation={[0, -a, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.22, 1.7, 7]} />
          <meshStandardMaterial color="#6b4a30" flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- tents */
function tentGeometry() {
  // triangular prism (A-frame) 2.2 long, 1.6 wide, 1.3 high
  const L = 1.1, W = 0.8, H = 1.3;
  const v = [
    -W, 0, -L, W, 0, -L, 0, H, -L,
    -W, 0, L, W, 0, L, 0, H, L,
  ];
  const idx = [0, 2, 1, 3, 4, 5, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 4];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.setIndex(idx);
  const ng = g.toNonIndexed();
  ng.computeVertexNormals();
  return ng;
}

function Tent({ pos, rot, color }: { pos: [number, number, number]; rot: number; color: string }) {
  const geo = useMemo(tentGeometry, []);
  return (
    <group position={pos} rotation-y={rot}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} flatShading roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.38, 1.105]}>
        <planeGeometry args={[0.5, 0.7]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- fairy lights */
function FairyLights({ from, to, sag = 0.8, count = 14 }: { from: THREE.Vector3; to: THREE.Vector3; sag?: number; count?: number }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffd38a' }), []);
  const pts = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const p = from.clone().lerp(to, t);
      p.y -= Math.sin(t * Math.PI) * sag;
      out.push(p);
    }
    return out;
  }, [from, to, sag, count]);
  useFrame(() => {
    const k = 0.15 + env.lights * 0.85;
    mat.color.setRGB(1 * k + 0.2, 0.83 * k + 0.15, 0.54 * k + 0.1);
  });
  return (
    <group>
      {pts.map((p, i) => (
        <mesh key={i} position={p} material={mat}>
          <sphereGeometry args={[0.07, 6, 4]} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- flag */
function Flag({ pos }: { pos: [number, number, number] }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(1.6, 1, 12, 4), []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  useFrame(({ clock }) => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    const t = clock.elapsedTime;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      const k = (x + 0.8) / 1.6;
      p.setZ(i, Math.sin(x * 3 - t * 5) * 0.12 * k);
    }
    p.needsUpdate = true;
  });
  return (
    <group position={pos}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 5, 6]} />
        <meshStandardMaterial color="#d8d4c8" />
      </mesh>
      <mesh geometry={geo} position={[0.82, 4.4, 0]}>
        <meshStandardMaterial color="#e8772e" side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- camp */
export function Camp() {
  const layout = useMemo(() => {
    const local = (dx: number, dz: number): [number, number, number] => {
      const x = CAMP.x + dx, z = CAMP.z + dz;
      return [x, h(x, z), z];
    };
    const tentColors = ['#e8772e', '#2f6b3a', '#1f3a5f', '#d9b23a', '#b84a2a', '#4a7a8c', '#e8772e'];
    const tents = tentColors.map((c, i) => {
      const a = -0.6 + (i / (tentColors.length - 1)) * 3.6 + Math.PI;
      const r = 8 + (i % 2) * 2.4;
      const dx = Math.cos(a) * r, dz = Math.sin(a) * r;
      return { pos: local(dx, dz), rot: Math.atan2(-dx, -dz), color: c };
    });
    return {
      tents,
      canopy: local(9, 5),
      toilet: local(15, -6),
      shower: local(16.5, -2.5),
      flag: local(-4, -6),
      jeeps: [
        { pos: local(-9, 9), rot: 0.6, look: 1 },
        { pos: local(-12, 6.5), rot: 0.7, look: 2 },
      ],
      lightA: new THREE.Vector3(...local(9 - 3, 5 + 2)).add(new THREE.Vector3(0, 2.6, 0)),
      lightB: new THREE.Vector3(...local(-4, -6)).add(new THREE.Vector3(0, 3.6, 0)),
      lightC: new THREE.Vector3(...local(-9, 3)).add(new THREE.Vector3(0, 2.2, 0)),
    };
  }, []);

  const c = layout.canopy;
  return (
    <group>
      <Campfire />
      {layout.tents.map((t, i) => (
        <Tent key={i} pos={t.pos} rot={t.rot} color={t.color} />
      ))}
      {/* dining canopy */}
      <group position={c} rotation-y={0.4}>
        {[
          [-3, -2],
          [3, -2],
          [-3, 2],
          [3, 2],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.2, z]}>
            <cylinderGeometry args={[0.06, 0.06, 2.4, 6]} />
            <meshStandardMaterial color="#8a8578" />
          </mesh>
        ))}
        <mesh position={[0, 2.55, 0]} rotation-x={0.08}>
          <boxGeometry args={[6.6, 0.06, 4.6]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[4.4, 0.08, 1.1]} />
          <meshStandardMaterial color="#8b6a46" flatShading />
        </mesh>
        {[-0.95, 0.95].map((z) => (
          <mesh key={z} position={[0, 0.42, z]}>
            <boxGeometry args={[4.2, 0.06, 0.32]} />
            <meshStandardMaterial color="#7a5a3a" flatShading />
          </mesh>
        ))}
      </group>
      {/* toilet cabin */}
      <group position={layout.toilet} rotation-y={-0.5}>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[1.2, 2.2, 1.2]} />
          <meshStandardMaterial color="#7d5a3a" flatShading />
        </mesh>
        <mesh position={[0, 2.3, 0]} rotation-y={Math.PI / 4}>
          <coneGeometry args={[1.0, 0.5, 4]} />
          <meshStandardMaterial color="#3f2f22" flatShading />
        </mesh>
      </group>
      {/* solar shower */}
      <group position={layout.shower} rotation-y={-0.5}>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[1.1, 2.1, 1.1]} />
          <meshStandardMaterial color="#3b6f8a" flatShading />
        </mesh>
        <mesh position={[0, 2.25, 0]} rotation-x={-0.35}>
          <boxGeometry args={[1.2, 0.08, 1.0]} />
          <meshStandardMaterial color="#10161f" metalness={0.6} roughness={0.25} />
        </mesh>
      </group>
      <Flag pos={layout.flag} />
      {layout.jeeps.map((j, i) => (
        <ParkedJeep key={i} position={j.pos} rotation={j.rot} look={j.look} />
      ))}
      <FairyLights from={layout.lightA} to={layout.lightB} />
      <FairyLights from={layout.lightB} to={layout.lightC} sag={0.6} count={10} />
    </group>
  );
}

/* ---------------------------------------------------------------- Koti village */
export function Village() {
  const houses = useMemo(() => {
    const rnd = mulberry32(9);
    const out: { pos: [number, number, number]; rot: number; w: number; d: number; hh: number; roof: string }[] = [];
    let tries = 0;
    while (out.length < 14 && tries++ < 400) {
      const a = rnd() * Math.PI * 2;
      const r = 7 + rnd() * 20;
      const x = KOTI.x + Math.cos(a) * r, z = KOTI.z + Math.sin(a) * r;
      if (nearestOnRoute(x, z).d < 4) continue;
      if (out.some((o) => Math.hypot(o.pos[0] - x, o.pos[2] - z) < 4.2)) continue;
      out.push({
        pos: [x, h(x, z), z],
        rot: rnd() * Math.PI,
        w: 2 + rnd() * 1.4,
        d: 2.2 + rnd() * 1.6,
        hh: 1.5 + rnd() * 0.7,
        roof: rnd() > 0.5 ? '#9a3b26' : '#5a4636',
      });
    }
    return out;
  }, []);
  // start arch across the road
  const arch = useMemo(() => {
    const [x, z] = routeXZ(0.012);
    const [x2, z2] = routeXZ(0.02);
    return { pos: [x, h(x, z), z] as [number, number, number], rot: Math.atan2(x2 - x, z2 - z) };
  }, []);
  const banner = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.fillStyle = '#e8772e';
    g.fillRect(0, 0, 512, 96);
    g.fillStyle = '#0f2a1d';
    g.font = 'bold 54px Oswald Variable, Arial Narrow, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('WEEKEND EXTREME · START', 256, 52);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  return (
    <group>
      {houses.map((o, i) => (
        <group key={i} position={o.pos} rotation-y={o.rot}>
          <mesh position={[0, o.hh / 2, 0]}>
            <boxGeometry args={[o.w, o.hh, o.d]} />
            <meshStandardMaterial color="#ebe4d3" flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, o.hh + 0.55, 0]} rotation-y={Math.PI / 4} scale={[o.w * 0.78, 1, o.d * 0.78]}>
            <coneGeometry args={[1, 1.1, 4]} />
            <meshStandardMaterial color={o.roof} flatShading roughness={0.9} />
          </mesh>
        </group>
      ))}
      <group position={arch.pos} rotation-y={arch.rot}>
        {[-2.4, 2.4].map((x) => (
          <mesh key={x} position={[x, 1.8, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 3.6, 6]} />
            <meshStandardMaterial color="#3a2a1e" />
          </mesh>
        ))}
        <mesh position={[0, 3.3, 0]} rotation-y={Math.PI}>
          <planeGeometry args={[5, 0.94]} />
          <meshBasicMaterial map={banner} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
