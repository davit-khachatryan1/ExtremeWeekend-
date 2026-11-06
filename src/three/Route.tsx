/* The glowing dotted route Koti → Camp, checkpoint beacons and two labels. */
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CHECKPOINTS } from '../config/content';
import { useLang } from '../lib/i18n';
import { scrollState } from '../lib/scrollState';
import { jeepState } from './state';
import { routeXZ, terrainHeight } from './world';

const dotsVert = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aU;
  varying float vDone;
  varying float vWave;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float done = step(aU, uProgress);
    float wave = pow(0.5 + 0.5 * sin(aU * 70.0 - uTime * 3.0), 10.0) * (1.0 - done);
    vDone = done;
    vWave = wave;
    float s = uSize * (0.8 + 0.4 * done + 0.9 * wave);
    gl_PointSize = max(2.2 * uPixelRatio, s * uPixelRatio * (240.0 / -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;
const dotsFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColorAhead;
  varying float vDone;
  varying float vWave;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float core = smoothstep(0.2, 0.0, r);
    float halo = smoothstep(0.5, 0.05, r) * 0.5;
    float k = max(vDone, vWave);
    vec3 col = mix(uColorAhead, uColor, k) * (1.0 + core * 1.2);
    float a = (core + halo) * (0.5 + 0.5 * k);
    gl_FragColor = vec4(col, a);
  }
`;

export function RouteDots({ count = 520 }: { count?: number }) {
  const gl = useThree((s) => s.gl);
  const { geo, uniforms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const us = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1);
      const [x, z] = routeXZ(u);
      pos[i * 3] = x;
      pos[i * 3 + 1] = terrainHeight(x, z) + 0.5;
      pos[i * 3 + 2] = z;
      us[i] = u;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aU', new THREE.BufferAttribute(us, 1));
    return {
      geo: g,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uSize: { value: 1.6 },
        uColor: { value: new THREE.Color('#ff9a4a') },
        uColorAhead: { value: new THREE.Color('#ffd9a8') },
      },
    };
  }, [count, gl]);

  // NOTE: materials are created with `new` so the uniform objects stay the same
  // ones we mutate below (R3F copies uniforms passed as JSX props).
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dotsVert,
        fragmentShader: dotsFrag,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );
  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
    uniforms.uProgress.value = jeepState.u;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={2} />;
}

/* Vertical light beams at every checkpoint */
const beamVert = /* glsl */ `
  varying float vY;
  void main() { vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const beamFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; varying float vY;
  void main() { gl_FragColor = vec4(uColor, (1.0 - vY) * (1.0 - vY) * uOpacity); }
`;

export function Beacons() {
  const items = useMemo(
    () =>
      CHECKPOINTS.map((cp) => {
        const [x, z] = routeXZ(cp.u);
        return { u: cp.u, pos: new THREE.Vector3(x, terrainHeight(x, z), z) };
      }),
    [],
  );
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const beams = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const group = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) group.current.visible = scrollState.mode !== 'camp';
    items.forEach((it, i) => {
      const reached = jeepState.u >= it.u - 0.004;
      const ring = rings.current[i];
      if (ring) {
        const k = (t * 0.6 + i * 0.17) % 1;
        ring.scale.setScalar(1 + k * 2.4);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (reached ? 0.9 : 0.55);
      }
      const b = beams.current[i];
      const near = Math.min(1, Math.abs(jeepState.u - it.u) / 0.05);
      if (b) b.uniforms.uOpacity.value = (reached ? 0.55 : 0.3) * (0.15 + 0.85 * near * near);
    });
  });
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group key={i} position={it.pos}>
          <mesh position={[0, 5, 0]} renderOrder={3}>
            <cylinderGeometry args={[0.08, 0.26, 10, 8, 1, true]} />
            <shaderMaterial
              ref={(m) => {
                beams.current[i] = m;
              }}
              vertexShader={beamVert}
              fragmentShader={beamFrag}
              uniforms={{ uColor: { value: new THREE.Color('#ff8a3d') }, uOpacity: { value: 0.4 } }}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            rotation-x={-Math.PI / 2}
            position={[0, 0.25, 0]}
            ref={(m) => {
              rings.current[i] = m;
            }}
          >
            <ringGeometry args={[0.8, 1.05, 32]} />
            <meshBasicMaterial color="#ffb070" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* "Koti · start" and "Camp · Atan" labels that live in the 3D world */
export function RouteLabels() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement[]>([]);
  const start = useMemo(() => {
    const [x, z] = routeXZ(0);
    return new THREE.Vector3(x, terrainHeight(x, z) + 9, z);
  }, []);
  const end = useMemo(() => {
    const [x, z] = routeXZ(1);
    return new THREE.Vector3(x, terrainHeight(x, z) + 9, z);
  }, []);
  useFrame(() => {
    // on phones/tablets the labels would sit on top of the hero text → show them once the drive starts
    const roomy = window.innerWidth >= 1024;
    const show = scrollState.mode === 'hero' && scrollState.hero < 0.9 && (roomy || scrollState.hero > 0.07);
    ref.current.forEach((el) => el && (el.style.opacity = show ? '1' : '0'));
  });
  const cls =
    'pointer-events-none select-none whitespace-nowrap rounded-full border border-white/25 bg-night/70 px-3 py-1 font-display text-[13px] uppercase tracking-wider text-offwhite backdrop-blur-sm transition-opacity duration-500';
  return (
    <>
      <Html position={start} center zIndexRange={[5, 0]}>
        <div ref={(el) => void (el && (ref.current[0] = el))} className={cls}>
          ⚑ {t(CHECKPOINTS[0].name)}
        </div>
      </Html>
      <Html position={end} center zIndexRange={[5, 0]}>
        <div ref={(el) => void (el && (ref.current[1] = el))} className={cls}>
          ⛺ {t(CHECKPOINTS[CHECKPOINTS.length - 1].name)}
        </div>
      </Html>
    </>
  );
}
