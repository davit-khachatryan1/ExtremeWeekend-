/* Low-poly UAZ-469–style jeep built from primitives (no download needed),
 * a 3-jeep convoy that drives along the route with the scroll, and dust.
 * To use a real GLTF model instead set SITE.jeepModelUrl in content.ts. */
import { Suspense, forwardRef, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SITE } from '../config/content';
import { scrollState } from '../lib/scrollState';
import { env } from './env';
import { damp, jeepState } from './state';
import { ROUTE_LENGTH, routeXZ, terrainHeight } from './world';

const WHEEL_R = 0.3;

interface JeepLook {
  body: string;
  top: string;
}

/* One jeep. Forward = +Z. Exposes wheels & lights through userData. */
const UazModel = forwardRef<THREE.Group, { look: JeepLook }>(function UazModel({ look }, ref) {
  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: look.body, roughness: 0.55, metalness: 0.15, flatShading: true }),
      top: new THREE.MeshStandardMaterial({ color: look.top, roughness: 0.95, flatShading: true }),
      dark: new THREE.MeshStandardMaterial({ color: '#1b1d1c', roughness: 0.8 }),
      glass: new THREE.MeshStandardMaterial({ color: '#25343d', roughness: 0.15, metalness: 0.6 }),
      tire: new THREE.MeshStandardMaterial({ color: '#161616', roughness: 1, flatShading: true }),
      hub: new THREE.MeshStandardMaterial({ color: '#8b8f86', roughness: 0.5, metalness: 0.4 }),
      head: new THREE.MeshStandardMaterial({ color: '#fff4d0', emissive: '#ffe2a0', emissiveIntensity: 0.4 }),
      tail: new THREE.MeshStandardMaterial({ color: '#7a1010', emissive: '#ff2a1a', emissiveIntensity: 0.3 }),
      can: new THREE.MeshStandardMaterial({ color: '#3f5a2a', roughness: 0.7, flatShading: true }),
    }),
    [look.body, look.top],
  );
  const wheels = useRef<THREE.Group[]>([]);
  const body = useRef<THREE.Group>(null!);
  const W = (x: number, z: number, i: number) => (
    <group
      key={i}
      position={[x, WHEEL_R, z]}
      ref={(g) => {
        if (g) wheels.current[i] = g;
      }}
    >
      <mesh rotation-z={Math.PI / 2} material={mats.tire}>
        <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.24, 10]} />
      </mesh>
      <mesh rotation-z={Math.PI / 2} material={mats.hub} position={[x > 0 ? 0.125 : -0.125, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.02, 8]} />
      </mesh>
    </group>
  );

  return (
    <group
      ref={(g) => {
        if (!g) return;
        g.userData.wheels = wheels.current;
        g.userData.body = body.current;
        g.userData.mats = mats;
        if (typeof ref === 'function') ref(g);
        else if (ref) ref.current = g;
      }}
    >
      {W(-0.5, 0.72, 0)}
      {W(0.5, 0.72, 1)}
      {W(-0.5, -0.68, 2)}
      {W(0.5, -0.68, 3)}
      <group ref={body}>
        {/* chassis & lower body */}
        <mesh position={[0, 0.6, 0]} material={mats.body}>
          <boxGeometry args={[0.98, 0.44, 2.05]} />
        </mesh>
        {/* hood */}
        <mesh position={[0, 0.86, 0.68]} material={mats.body}>
          <boxGeometry args={[0.92, 0.12, 0.66]} />
        </mesh>
        {/* canvas top */}
        <mesh position={[0, 1.13, -0.36]} material={mats.top}>
          <boxGeometry args={[0.96, 0.56, 1.3]} />
        </mesh>
        {/* windshield frame + glass */}
        <mesh position={[0, 1.05, 0.31]} rotation-x={-0.12} material={mats.glass}>
          <boxGeometry args={[0.9, 0.42, 0.05]} />
        </mesh>
        {/* side windows */}
        <mesh position={[0.485, 1.16, -0.15]} material={mats.glass}>
          <boxGeometry args={[0.02, 0.26, 0.5]} />
        </mesh>
        <mesh position={[-0.485, 1.16, -0.15]} material={mats.glass}>
          <boxGeometry args={[0.02, 0.26, 0.5]} />
        </mesh>
        {/* grille */}
        <mesh position={[0, 0.7, 1.035]} material={mats.dark}>
          <boxGeometry args={[0.62, 0.3, 0.04]} />
        </mesh>
        {/* headlights */}
        {[-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x, 0.74, 1.04]} rotation-x={Math.PI / 2} material={mats.head}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 10]} />
          </mesh>
        ))}
        {/* tail lights */}
        {[-0.4, 0.4].map((x) => (
          <mesh key={x} position={[x, 0.66, -1.03]} material={mats.tail}>
            <boxGeometry args={[0.1, 0.08, 0.03]} />
          </mesh>
        ))}
        {/* bumpers */}
        <mesh position={[0, 0.42, 1.1]} material={mats.dark}>
          <boxGeometry args={[1.12, 0.1, 0.1]} />
        </mesh>
        <mesh position={[0, 0.42, -1.08]} material={mats.dark}>
          <boxGeometry args={[1.08, 0.1, 0.1]} />
        </mesh>
        {/* fenders */}
        {[0.7, -0.68].map((z) => (
          <mesh key={z} position={[0, 0.74, z]} material={mats.dark}>
            <boxGeometry args={[1.14, 0.06, 0.62]} />
          </mesh>
        ))}
        {/* spare wheel */}
        <mesh position={[0, 0.88, -1.12]} rotation-x={Math.PI / 2} material={mats.tire}>
          <cylinderGeometry args={[0.27, 0.27, 0.18, 10]} />
        </mesh>
        {/* roof rack + jerrycans */}
        <mesh position={[0, 1.43, -0.36]} material={mats.dark}>
          <boxGeometry args={[0.9, 0.04, 1.1]} />
        </mesh>
        <mesh position={[0.2, 1.53, -0.5]} material={mats.can}>
          <boxGeometry args={[0.3, 0.18, 0.42]} />
        </mesh>
        <mesh position={[-0.22, 1.52, -0.2]} material={mats.body}>
          <boxGeometry args={[0.32, 0.16, 0.3]} />
        </mesh>
        {/* snorkel */}
        <mesh position={[0.52, 1.1, 0.42]} material={mats.dark}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
        </mesh>
      </group>
    </group>
  );
});

/* Optional GLTF jeep (SITE.jeepModelUrl) */
function GltfJeep({ url }: { url: string }) {
  const { scene } = useGLTF(url, true);
  const clone = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={clone} />;
}

/* ------------------------------------------------------------------ dust */
const DUST = 160;
function useDust() {
  return useMemo(() => {
    const pos = new Float32Array(DUST * 3);
    const life = new Float32Array(DUST); // 0 = dead … 1 = new
    const vel = new Float32Array(DUST * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
    let next = 0;
    const emit = (p: THREE.Vector3, back: THREE.Vector3) => {
      const i = next;
      next = (next + 1) % DUST;
      pos[i * 3] = p.x + (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 1] = p.y + 0.15;
      pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.6;
      vel[i * 3] = back.x * 1.2 + (Math.random() - 0.5) * 0.8;
      vel[i * 3 + 1] = 0.5 + Math.random() * 0.7;
      vel[i * 3 + 2] = back.z * 1.2 + (Math.random() - 0.5) * 0.8;
      life[i] = 1;
    };
    const update = (dt: number) => {
      for (let i = 0; i < DUST; i++) {
        if (life[i] <= 0) continue;
        life[i] = Math.max(0, life[i] - dt * 0.75);
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        vel[i * 3 + 1] *= 0.985;
      }
      g.attributes.position.needsUpdate = true;
      g.attributes.aLife.needsUpdate = true;
    };
    return { geo: g, emit, update };
  }, []);
}
const dustMat = new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color('#b59a76') }, uDark: { value: 0 } },
  vertexShader: /* glsl */ `
    attribute float aLife; varying float vLife;
    void main(){ vLife = aLife; vec4 mv = modelViewMatrix * vec4(position,1.0);
      gl_PointSize = (aLife > 0.0 ? (1.0 - aLife) * 60.0 + 14.0 : 0.0) * (8.0 / -mv.z);
      gl_Position = projectionMatrix * mv; }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor; uniform float uDark; varying float vLife;
    void main(){ float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard;
      float a = smoothstep(0.5, 0.0, r) * vLife * 0.45;
      gl_FragColor = vec4(uColor * (1.0 - uDark * 0.75), a); }`,
  transparent: true,
  depthWrite: false,
});

/* ---------------------------------------------------------------- convoy */
const LOOKS: JeepLook[] = [
  { body: '#e8772e', top: '#33402a' }, // brand orange leader
  { body: '#5b6b3a', top: '#2a2f22' }, // olive UAZ
  { body: '#e9e4d6', top: '#3b4a5a' }, // white/blue
];
const GAP = 10 / ROUTE_LENGTH;

const _f = new THREE.Vector3();
const _b = new THREE.Vector3();
const _l = new THREE.Vector3();
const _r = new THREE.Vector3();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();

/** Route point; u < 0 continues straight back into the village (parked jeeps). */
function roadPoint(u: number): [number, number] {
  if (u >= 0) return routeXZ(u);
  const [x0, z0] = routeXZ(0);
  const [x1, z1] = routeXZ(0.012);
  const l = Math.hypot(x1 - x0, z1 - z0) || 1;
  const d = u * ROUTE_LENGTH;
  return [x0 + ((x1 - x0) / l) * d, z0 + ((z1 - z0) / l) * d];
}

function placeOnRoad(group: THREE.Object3D, u: number, smoothing: number) {
  const e = 0.0035;
  const [x, z] = roadPoint(u);
  const [ax, az] = roadPoint(Math.min(u - e, 1 - 2 * e));
  const [bx, bz] = roadPoint(Math.min(u + e, 1));
  _z.set(bx - ax, 0, bz - az).normalize();
  _x.set(_z.z, 0, -_z.x); // model +X = its left side (forward is +Z, up is +Y)
  // wheel contact heights → pitch & roll
  const hf = terrainHeight(x + _z.x * 0.7, z + _z.z * 0.7);
  const hb = terrainHeight(x - _z.x * 0.7, z - _z.z * 0.7);
  const hl = terrainHeight(x + _x.x * 0.5, z + _x.z * 0.5);
  const hr = terrainHeight(x - _x.x * 0.5, z - _x.z * 0.5);
  _f.set(x + _z.x * 0.7, hf, z + _z.z * 0.7);
  _b.set(x - _z.x * 0.7, hb, z - _z.z * 0.7);
  _l.set(x + _x.x * 0.5, hl, z + _x.z * 0.5);
  _r.set(x - _x.x * 0.5, hr, z - _x.z * 0.5);
  _z.subVectors(_f, _b).normalize();
  _x.subVectors(_l, _r).normalize(); // left → +x in three's basis
  _y.crossVectors(_z, _x).normalize();
  _x.crossVectors(_y, _z).normalize();
  _m.makeBasis(_x, _y, _z);
  _q.setFromRotationMatrix(_m);
  group.quaternion.slerp(_q, smoothing);
  group.position.set(x, (hf + hb + hl + hr) / 4 - 0.02, z);
  return _z;
}

export function Convoy() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const us = useRef([0, 0, 0]);
  const lastMode = useRef(scrollState.mode);
  const travel = useRef([0, 0, 0]);
  const dust = useDust();
  const emitAcc = useRef(0);
  const back = useMemo(() => new THREE.Vector3(), []);
  const rear = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const mode = scrollState.mode;
    const target = mode === 'camp' ? 1 : Math.min(1, Math.max(0, (scrollState.hero - 0.06) / 0.84));
    const snap = mode !== lastMode.current;
    lastMode.current = mode;
    const prev = us.current[0];
    const leaderU = snap ? target : damp(prev, target, 1.6, dt);
    const speed = (Math.abs(leaderU - prev) * ROUTE_LENGTH) / Math.max(dt, 1e-3);
    jeepState.speed = speed;
    for (let i = 0; i < LOOKS.length; i++) {
      const g = refs.current[i];
      if (!g) continue;
      const u = Math.min(1, leaderU - i * GAP);
      const du = Math.abs(u - us.current[i]);
      us.current[i] = u;
      const fwd = placeOnRoad(g, u, snap ? 1 : 1 - Math.exp(-dt * 10));
      // wheel spin + suspension bounce
      const dist = du * ROUTE_LENGTH;
      travel.current[i] += dist;
      const model = g.children[0] as THREE.Group | undefined;
      const wheels = model?.userData.wheels as THREE.Group[] | undefined;
      wheels?.forEach((w) => (w.rotation.x += dist / WHEEL_R));
      const body = model?.userData.body as THREE.Group | undefined;
      if (body) {
        const k = Math.min(1, speed / 6);
        const tr = travel.current[i];
        body.position.y = Math.sin(tr * 3.1 + i) * 0.035 * k + Math.sin(state.clock.elapsedTime * 18 + i) * 0.006;
        body.rotation.z = Math.sin(tr * 2.2 + i * 2) * 0.03 * k;
      }
      // headlights glow at night
      const mats = model?.userData.mats as Record<string, THREE.MeshStandardMaterial> | undefined;
      if (mats) {
        mats.head.emissiveIntensity = 0.4 + env.lights * 3;
        mats.tail.emissiveIntensity = 0.3 + env.lights * 1.5;
      }
      if (i === 0) {
        jeepState.u = u;
        jeepState.position.copy(g.position);
        jeepState.forward.copy(fwd);
      }
      // dust from the rear wheels when moving
      if (speed > 0.8 && dust) {
        emitAcc.current += dt * Math.min(40, speed * 5);
        while (emitAcc.current > 1) {
          emitAcc.current -= 1;
          back.copy(fwd).multiplyScalar(-1);
          rear.copy(g.position).addScaledVector(fwd, -0.8);
          dust.emit(rear, back);
        }
      }
    }
    dust.update(dt);
    dustMat.uniforms.uDark.value = env.night;
  });

  const url = SITE.jeepModelUrl;
  return (
    <group>
      {LOOKS.map((look, i) => (
        <group key={i} ref={(g) => void (refs.current[i] = g)}>
          {url && i === 0 ? (
            <Suspense fallback={<UazModel look={look} />}>
              <GltfJeep url={url} />
            </Suspense>
          ) : (
            <UazModel look={look} />
          )}
        </group>
      ))}
      <points geometry={dust.geo} material={dustMat} frustumCulled={false} />
    </group>
  );
}

/** A parked jeep for the camp / village (static). */
export function ParkedJeep({ position, rotation = 0, look = 1 }: { position: [number, number, number]; rotation?: number; look?: number }) {
  return (
    <group position={position} rotation-y={rotation}>
      <UazModel look={LOOKS[look % LOOKS.length]} />
    </group>
  );
}
