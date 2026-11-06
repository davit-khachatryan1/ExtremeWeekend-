/* Gradient sky dome with sun, moon and a procedural Milky Way, a star field
 * and drifting cloud / valley-fog sprites. Everything follows `env`. */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MOON_DIR, env } from './env';
import { mulberry32, routeXZ, terrainHeight } from './world';

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const skyFrag = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSunColor; uniform vec3 uSunDir; uniform vec3 uMoonDir;
  uniform float uNight; uniform float uStars;
  varying vec3 vDir;
  float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float vnoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x), mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x), mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z); }
  float fbm(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p *= 2.07; a *= 0.5; } return s; }
  void main(){
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.5, h));
    // below horizon: slightly darker haze
    col = mix(col, uHorizon * 0.8, smoothstep(0.0, -0.3, h));
    // sun disc + glow
    float sd = max(dot(d, uSunDir), 0.0);
    float sunVis = smoothstep(-0.12, 0.02, uSunDir.y);
    col += uSunColor * (pow(sd, 900.0) * 6.0 + pow(sd, 18.0) * 0.45 + pow(sd, 3.0) * 0.12) * sunVis;
    // milky way band
    vec3 bandN = normalize(vec3(0.66, 0.3, 0.69));
    float band = exp(-pow(dot(d, bandN) / 0.2, 2.0));
    float n = fbm(d * 7.0);
    float dust = smoothstep(0.45, 0.75, fbm(d * 13.0 + 4.0));
    vec3 mw = vec3(0.45, 0.55, 1.0) * band * (0.1 + 0.9 * n * n) * (1.0 - dust * 0.7);
    mw += vec3(0.95, 0.8, 0.65) * pow(band, 3.0) * n * 0.35;
    col += mw * uStars * 0.26 * smoothstep(-0.05, 0.3, h);
    // moon
    float md = max(dot(d, uMoonDir), 0.0);
    col += vec3(0.95, 0.96, 1.0) * (smoothstep(0.99955, 0.99975, md) * 1.6 + pow(md, 60.0) * 0.12) * uStars;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

export function SkyDome() {
  const ref = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSunColor: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3() },
      uMoonDir: { value: MOON_DIR.clone() },
      uNight: { value: 0 },
      uStars: { value: 0 },
    }),
    [],
  );
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        uniforms,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [uniforms],
  );
  useFrame(({ camera }) => {
    ref.current.position.copy(camera.position);
    uniforms.uTop.value.copy(env.top);
    uniforms.uHorizon.value.copy(env.horizon);
    uniforms.uSunColor.value.copy(env.sunColor);
    uniforms.uSunDir.value.copy(env.sunDir);
    uniforms.uNight.value = env.night;
    uniforms.uStars.value = env.stars;
  });
  return (
    <mesh ref={ref} renderOrder={-10} frustumCulled={false} material={mat}>
      <sphereGeometry args={[1000, 48, 24]} />
    </mesh>
  );
}

const starVert = /* glsl */ `
  attribute float aSize; attribute float aPhase; uniform float uTime; uniform float uPixelRatio; varying float vTw;
  void main(){
    vTw = 0.6 + 0.4 * sin(uTime * (1.0 + aPhase * 2.0) + aPhase * 40.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }`;
const starFrag = /* glsl */ `
  uniform float uOpacity; varying float vTw;
  void main(){ float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.0, r) * vTw * uOpacity;
    gl_FragColor = vec4(vec3(0.92, 0.95, 1.0), a); }`;

export function Stars({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const { geo, uniforms, mat } = useMemo(() => {
    const rnd = mulberry32(11);
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const bandN = new THREE.Vector3(0.66, 0.3, 0.69).normalize();
    const v = new THREE.Vector3();
    let i = 0;
    while (i < count) {
      v.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
      if (v.lengthSq() > 1 || v.lengthSq() < 0.01) continue;
      v.normalize();
      if (v.y < -0.05) continue;
      // denser along the milky way
      const inBand = Math.abs(v.dot(bandN)) < 0.2;
      if (!inBand && rnd() < 0.45) continue;
      v.multiplyScalar(900);
      pos.set([v.x, v.y, v.z], i * 3);
      const big = rnd();
      size[i] = big > 0.985 ? 3.6 : big > 0.9 ? 2.4 : 1.2 + rnd() * 0.9;
      phase[i] = rnd();
      i++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    const uniforms = { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } };
    const mat = new THREE.ShaderMaterial({
      vertexShader: starVert,
      fragmentShader: starFrag,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    return { geo: g, uniforms, mat };
  }, [count]);
  useFrame(({ camera, clock }) => {
    ref.current.position.copy(camera.position);
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uOpacity.value = env.stars;
    ref.current.visible = env.stars > 0.01;
  });
  return (
    <points ref={ref} geometry={geo} material={mat} frustumCulled={false} renderOrder={-9} />
  );
}

function cloudTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const rnd = mulberry32(3);
  for (let i = 0; i < 26; i++) {
    const x = 50 + rnd() * 156;
    const y = 90 + rnd() * 80 - Math.abs(x - 128) * 0.25;
    const r = 26 + rnd() * 44;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(255,255,255,0.55)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Clouds({ count }: { count: number }) {
  const map = useMemo(cloudTexture, []);
  const items = useMemo(() => {
    const rnd = mulberry32(21);
    const out: { pos: THREE.Vector3; scale: number; speed: number; low: boolean; mat: THREE.SpriteMaterial }[] = [];
    for (let i = 0; i < count; i++) {
      const low = i % 3 === 0;
      let x: number, y: number, z: number;
      if (low) {
        // valley fog banks along the forest part of the road
        const [rx, rz] = routeXZ(0.12 + rnd() * 0.5);
        x = rx + (rnd() - 0.5) * 60;
        z = rz + (rnd() - 0.5) * 60;
        y = terrainHeight(x, z) + 5 + rnd() * 6;
      } else {
        x = (rnd() - 0.5) * 520;
        z = (rnd() - 0.5) * 520;
        y = 80 + rnd() * 50;
      }
      out.push({
        pos: new THREE.Vector3(x, y, z),
        scale: low ? 26 + rnd() * 22 : 50 + rnd() * 60,
        speed: (low ? 0.6 : 1.6) + rnd() * 1.4,
        low,
        mat: new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity: 0.8, fog: true }),
      });
    }
    return out;
  }, [count, map]);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame((_, dt) => {
    items.forEach((it, i) => {
      const s = refs.current[i];
      if (!s) return;
      s.position.x += it.speed * dt;
      if (s.position.x > 300) s.position.x = -300;
      it.mat.color.copy(env.cloud);
      it.mat.opacity = env.cloudOpacity * (it.low ? 0.55 : 0.9);
    });
  });
  return (
    <group>
      {items.map((it, i) => (
        <sprite
          key={i}
          ref={(s) => void (refs.current[i] = s)}
          position={it.pos}
          scale={[it.scale, it.scale * 0.5, 1]}
          material={it.mat}
        />
      ))}
    </group>
  );
}
