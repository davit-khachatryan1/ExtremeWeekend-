/* Low-poly terrain (vertex-coloured, flat-shaded), instanced forests and
 * wind-swayed grass. All generated from world.ts — no texture downloads. */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  CAMP, HALF, WORLD_SIZE, forestLine, inClearing, mulberry32, nearestOnRoute, routeXZ, terrainHeight,
} from './world';

/* ---------------------------------------------------------------- terrain */
const COL = {
  forest: new THREE.Color('#1c4628'),
  forest2: new THREE.Color('#29573a'),
  meadow: new THREE.Color('#5b8c3a'),
  meadow2: new THREE.Color('#86a94e'),
  rock: new THREE.Color('#6d5f4f'),
  rock2: new THREE.Color('#8f8273'),
  snow: new THREE.Color('#e8e5dc'),
  mud: new THREE.Color('#5a4330'),
  mud2: new THREE.Color('#3f2f22'),
};

export function Terrain({ segments }: { segments: number }) {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const dist = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const near = nearestOnRoute(x, z);
      dist[i] = near.d;
      pos.setY(i, terrainHeight(x, z, near));
    }
    g.computeVertexNormals();
    const nrm = g.attributes.normal as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const rnd = mulberry32(5);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const slope = 1 - nrm.getY(i);
      const fl = forestLine(x, z);
      const v = rnd();
      if (y < fl) c.copy(COL.forest).lerp(COL.forest2, v);
      else c.copy(COL.meadow).lerp(COL.meadow2, v * 0.8);
      // soft forest → meadow edge
      const edge = THREE.MathUtils.smoothstep(y, fl - 2, fl + 3);
      if (edge > 0 && edge < 1) c.lerp(COL.meadow, edge * 0.5);
      if (slope > 0.32) c.lerp(COL.rock, THREE.MathUtils.smoothstep(slope, 0.32, 0.55));
      if (y > 70) c.lerp(COL.rock2, THREE.MathUtils.smoothstep(y, 70, 82));
      if (y > 86 && slope < 0.5) c.lerp(COL.snow, THREE.MathUtils.smoothstep(y, 86, 94));
      // the road
      const d = dist[i];
      if (d < 3.6) c.lerp(v > 0.5 ? COL.mud : COL.mud2, 1 - THREE.MathUtils.smoothstep(d, 1.6, 3.6));
      // fade colour slightly toward the world edge (merges with fog)
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [segments]);

  return (
    <mesh geometry={geom} receiveShadow={false}>
      <meshStandardMaterial vertexColors flatShading roughness={0.96} metalness={0} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- trees */
function pineGeometry() {
  const a = new THREE.ConeGeometry(1.1, 2.3, 6, 1);
  a.translate(0, 1.75, 0);
  const b = new THREE.ConeGeometry(0.78, 1.8, 6, 1);
  b.translate(0, 2.85, 0);
  const t = new THREE.CylinderGeometry(0.14, 0.18, 0.9, 5);
  t.translate(0, 0.45, 0);
  [a, b].forEach((g) => paint(g, 1, 1, 1));
  paint(t, 0.45, 0.33, 0.25);
  return mergeGeometries([a, b, t])!;
}
function broadGeometry() {
  const a = new THREE.IcosahedronGeometry(1.25, 0);
  a.scale(1, 0.95, 1);
  a.translate(0, 2.15, 0);
  const t = new THREE.CylinderGeometry(0.14, 0.2, 1.3, 5);
  t.translate(0, 0.65, 0);
  paint(a, 1, 1, 1);
  paint(t, 0.45, 0.33, 0.25);
  return mergeGeometries([a, t.toNonIndexed()])!;
}
function paint(g: THREE.BufferGeometry, r: number, gg: number, b: number) {
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = r;
    arr[i * 3 + 1] = gg;
    arr[i * 3 + 2] = b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
}

export function Forest({ count }: { count: number }) {
  const { pines, broads, pineGeo, broadGeo } = useMemo(() => {
    const rnd = mulberry32(42);
    const pinesM: THREE.Matrix4[] = [];
    const broadsM: THREE.Matrix4[] = [];
    const pc: THREE.Color[] = [];
    const bc: THREE.Color[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    let tries = 0;
    while (pinesM.length + broadsM.length < count && tries++ < count * 12) {
      // bias samples toward the road corridor so the drive goes "through forests"
      let x: number, z: number;
      if (rnd() < 0.55) {
        const [rx, rz] = routeXZ(rnd() * 0.75);
        x = rx + (rnd() - 0.5) * 90;
        z = rz + (rnd() - 0.5) * 90;
      } else {
        x = (rnd() * 2 - 1) * HALF * 0.97;
        z = (rnd() * 2 - 1) * HALF * 0.97;
      }
      const near = nearestOnRoute(x, z);
      if (near.d < 4.2 || inClearing(x, z, 5)) continue;
      const h = terrainHeight(x, z, near);
      const fl = forestLine(x, z);
      if (h > fl + 4) continue;
      if (h > fl && rnd() > 0.25) continue;
      const hx = terrainHeight(x + 1.5, z, near) - h;
      const hz = terrainHeight(x, z + 1.5, near) - h;
      if (Math.hypot(hx, hz) > 2.1) continue;
      const scale = 0.75 + rnd() * 0.8;
      q.setFromAxisAngle(up, rnd() * Math.PI * 2);
      s.set(scale, scale * (0.85 + rnd() * 0.4), scale);
      p.set(x, h - 0.25, z);
      m.compose(p, q, s);
      const broad = h < fl - 9 ? rnd() < 0.7 : rnd() < 0.12;
      const col = new THREE.Color().setHSL(broad ? 0.25 + rnd() * 0.06 : 0.36 + rnd() * 0.05, 0.42 + rnd() * 0.2, broad ? 0.22 + rnd() * 0.1 : 0.16 + rnd() * 0.07);
      if (broad) {
        broadsM.push(m.clone());
        bc.push(col);
      } else {
        pinesM.push(m.clone());
        pc.push(col);
      }
    }
    return { pines: { m: pinesM, c: pc }, broads: { m: broadsM, c: bc }, pineGeo: pineGeometry(), broadGeo: broadGeometry() };
  }, [count]);

  const pineRef = useRef<THREE.InstancedMesh>(null!);
  const broadRef = useRef<THREE.InstancedMesh>(null!);
  const init = (mesh: THREE.InstancedMesh | null, set: { m: THREE.Matrix4[]; c: THREE.Color[] }) => {
    if (!mesh || mesh.userData.done) return;
    set.m.forEach((mm, i) => {
      mesh.setMatrixAt(i, mm);
      mesh.setColorAt(i, set.c[i]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    mesh.userData.done = true;
  };

  return (
    <>
      <instancedMesh
        ref={(r) => {
          pineRef.current = r!;
          init(r, pines);
        }}
        args={[pineGeo, undefined, pines.m.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={(r) => {
          broadRef.current = r!;
          init(r, broads);
        }}
        args={[broadGeo, undefined, broads.m.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </instancedMesh>
    </>
  );
}

/* ---------------------------------------------------------------- grass */
function bladeGeometry() {
  const H = 0.62, W = 0.075, SEG = 3;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const base = new THREE.Color('#2f5a22');
  const tip = new THREE.Color('#b9cf6a');
  const c = new THREE.Color();
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG;
    const w = W * (1 - t * 0.92);
    pos.push(-w, t * H, 0, w, t * H, 0);
    c.copy(base).lerp(tip, t);
    col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    if (i < SEG) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function Grass({ count }: { count: number }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const { geo, mats } = useMemo(() => {
    const rnd = mulberry32(77);
    const list: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    let tries = 0;
    while (list.length < count && tries++ < count * 6) {
      let x: number, z: number;
      const r = rnd();
      if (r < 0.62) {
        // camp meadow
        const a = rnd() * Math.PI * 2;
        const rr = 4 + Math.sqrt(rnd()) * 44;
        x = CAMP.x + Math.cos(a) * rr;
        z = CAMP.z + Math.sin(a) * rr;
      } else {
        // along the upper road through the alpine meadows
        const [rx, rz] = routeXZ(0.58 + rnd() * 0.42);
        x = rx + (rnd() - 0.5) * 30;
        z = rz + (rnd() - 0.5) * 30;
      }
      const near = nearestOnRoute(x, z);
      if (near.d < 2.6) continue;
      const h = terrainHeight(x, z, near);
      if (h < forestLine(x, z) - 1) continue;
      e.set((rnd() - 0.5) * 0.35, rnd() * Math.PI, (rnd() - 0.5) * 0.35);
      q.setFromEuler(e);
      const sc = 0.45 + rnd() * 0.5;
      s.set(sc, sc * (0.8 + rnd() * 0.6), sc);
      p.set(x, h - 0.05, z);
      m.compose(p, q, s);
      list.push(m.clone());
    }
    return { geo: bladeGeometry(), mats: list };
  }, [count]);

  const material = useMemo(() => {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <begin_vertex>',
          `vec3 transformed = vec3(position);
          #ifdef USE_INSTANCING
            vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          #else
            vec3 ip = vec3(0.0);
          #endif
          float k = position.y / 0.62;
          float gust = sin(uTime * 0.7 + ip.x * 0.05) * 0.5 + 0.5;
          float w = sin(uTime * 1.9 + ip.x * 0.37 + ip.z * 0.23) * (0.55 + gust * 0.6) + sin(uTime * 3.3 + ip.z * 1.1) * 0.15;
          transformed.x += w * k * k * 0.2;
          transformed.z += w * k * k * 0.1;`,
        );
    };
    return mat;
  }, [uniforms]);

  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
  });

  return (
    <instancedMesh
      args={[geo, material, mats.length]}
      frustumCulled={false}
      ref={(r) => {
        if (!r || r.userData.done) return;
        mats.forEach((mm, i) => r.setMatrixAt(i, mm));
        r.instanceMatrix.needsUpdate = true;
        r.userData.done = true;
      }}
    />
  );
}
