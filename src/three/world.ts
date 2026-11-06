/* =============================================================================
 *  THE WORLD — one stylized landscape shared by the 3D hero AND the 2D route map.
 *  Pure math (no three.js import) so the map can use it without loading 3D.
 *
 *  Coordinates: x → east, z → south, y → up. 1 unit ≈ a few metres (diorama scale).
 *  The route runs from Koti village (north-west corner) to the camp (south-east).
 * ============================================================================= */
import { createNoise2D } from 'simplex-noise';

export const WORLD_SIZE = 440;
export const HALF = WORLD_SIZE / 2;

/* --- seeded random -------------------------------------------------------- */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const noise = createNoise2D(mulberry32(1987));
const noise2 = createNoise2D(mulberry32(2024));

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/* --- route (Catmull-Rom spline through control points, arc-length sampled) --- */
const CTRL: [number, number][] = [
  [-158, 150], // Koti village — START
  [-136, 128],
  [-118, 96],
  [-96, 70],
  [-62, 58],
  [-36, 40],
  [-20, 8],
  [-2, -18],
  [26, -30],
  [56, -34],
  [82, -56],
  [100, -88],
  [124, -116], // mountain CAMP (Lori) — END
];

const SAMPLES = 260;
const RX = new Float32Array(SAMPLES);
const RZ = new Float32Array(SAMPLES);
const RL = new Float32Array(SAMPLES); // cumulative length

(function buildRoute() {
  const pts: [number, number][] = [];
  const n = CTRL.length;
  const P = (i: number) => CTRL[Math.max(0, Math.min(n - 1, i))];
  const STEPS = 40;
  for (let i = 0; i < n - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let s = 0; s < STEPS; s++) {
      const t = s / STEPS, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  pts.push(CTRL[n - 1]);
  // cumulative length of dense polyline
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = cum[cum.length - 1];
  // resample evenly
  let j = 0;
  for (let k = 0; k < SAMPLES; k++) {
    const target = (k / (SAMPLES - 1)) * total;
    while (j < cum.length - 2 && cum[j + 1] < target) j++;
    const seg = cum[j + 1] - cum[j] || 1;
    const a = (target - cum[j]) / seg;
    RX[k] = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * a;
    RZ[k] = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * a;
    RL[k] = target;
  }
})();

export const ROUTE_LENGTH = RL[SAMPLES - 1];

/** Point on the route (x,z) for u ∈ [0,1] */
export function routeXZ(u: number): [number, number] {
  const f = clamp(u) * (SAMPLES - 1);
  const i = Math.min(SAMPLES - 2, Math.floor(f));
  const a = f - i;
  return [RX[i] + (RX[i + 1] - RX[i]) * a, RZ[i] + (RZ[i + 1] - RZ[i]) * a];
}

/** Road elevation profile: low in Koti, climbing through forest to the pass, then meadows. */
export function routeElevation(u: number) {
  const climb = 4 + 36 * smooth(0.04, 0.66, u);
  const pass = 4.5 * Math.exp(-(((u - 0.64) / 0.07) ** 2));
  const plateau = -2.5 * smooth(0.7, 0.95, u);
  const wobble = 1.4 * Math.sin(u * 37) * (1 - u) * smooth(0.05, 0.2, u);
  return climb + pass + plateau + wobble;
}

/** Nearest route parameter + distance for a world point (segment projection). */
export function nearestOnRoute(x: number, z: number) {
  let best = Infinity;
  let bestU = 0;
  for (let i = 0; i < SAMPLES - 1; i++) {
    const ax = RX[i], az = RZ[i];
    const dx = RX[i + 1] - ax, dz = RZ[i + 1] - az;
    const len2 = dx * dx + dz * dz || 1;
    let t = ((x - ax) * dx + (z - az) * dz) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = ax + dx * t - x, pz = az + dz * t - z;
    const d2 = px * px + pz * pz;
    if (d2 < best) {
      best = d2;
      bestU = (i + t) / (SAMPLES - 1);
    }
  }
  return { d: Math.sqrt(best), u: bestU };
}

/* --- key places ----------------------------------------------------------- */
const [kx, kz] = routeXZ(0);
const [ex, ez] = routeXZ(1);
const [ex2, ez2] = routeXZ(0.985);
const endDir = (() => {
  const l = Math.hypot(ex - ex2, ez - ez2) || 1;
  return [(ex - ex2) / l, (ez - ez2) / l];
})();
export const KOTI = { x: kx - 6, z: kz + 6, r: 22 };
/** camp centre sits a little past the end of the road */
export const CAMP = { x: ex + endDir[0] * 12, z: ez + endDir[1] * 12, r: 30 };
export const CAMP_Y = routeElevation(1);
export const KOTI_Y = routeElevation(0);

/* --- terrain -------------------------------------------------------------- */
function fbm(x: number, z: number, oct = 5) {
  let a = 0.5, f = 1, s = 0, n = 0;
  for (let i = 0; i < oct; i++) {
    s += a * noise(x * f, z * f);
    n += a;
    a *= 0.5;
    f *= 2.03;
  }
  return s / n;
}
function ridged(x: number, z: number, oct = 4) {
  let a = 0.5, f = 1, s = 0, n = 0;
  for (let i = 0; i < oct; i++) {
    const r = 1 - Math.abs(noise2(x * f, z * f));
    s += a * r * r;
    n += a;
    a *= 0.5;
    f *= 2.1;
  }
  return s / n;
}

/** Mountains before the valley is carved. */
export function rawHeight(x: number, z: number) {
  // diagonal axis: Koti (-1) → camp (+1)
  const s = (x - z) / 290;
  const base = 6 + 40 * smooth(-1.05, 0.5, s);
  const m = fbm(x * 0.0062, z * 0.0062) * 0.5 + 0.5;
  const r = ridged(x * 0.0105 + 3.1, z * 0.0105 - 1.7);
  // big ranges on both sides of the diagonal valley
  const side = Math.abs((x + z) / 300);
  const ranges = 18 + 34 * smooth(0.08, 0.9, side);
  return base + m * ranges + r * r * 34 - 12;
}

/** Final terrain height: raw mountains + carved road valley + flat village/camp. */
export function terrainHeight(x: number, z: number, near = nearestOnRoute(x, z)) {
  const raw = rawHeight(x, z);
  const { d, u } = near;
  const ry = routeElevation(u);
  // valley carving — the road sits on a gentle shelf
  const w = smooth(2.2, 30, d);
  // valley walls: away from the road the ground rises at least a little
  const wall = ry + 10 * smooth(3, 46, d) + 3 * noise2(x * 0.03, z * 0.03) * smooth(6, 30, d);
  // fade the wall out far from the road (avoids cliffs where two road branches meet)
  const far = Math.max(raw, wall) + (raw - Math.max(raw, wall)) * smooth(30, 62, d);
  let h = ry + (far - ry) * w;
  // keep valley walls from dropping far below the road right next to it
  if (d < 12) h = Math.max(h, ry - 1.5 * smooth(2.2, 12, d));
  // flat village (Koti) and camp meadow
  const dk = Math.hypot(x - KOTI.x, z - KOTI.z);
  h = h + (KOTI_Y - h) * (1 - smooth(KOTI.r * 0.5, KOTI.r, dk));
  const dc = Math.hypot(x - CAMP.x, z - CAMP.z);
  h = h + (CAMP_Y - 0.3 - h) * (1 - smooth(CAMP.r * 0.55, CAMP.r, dc));
  // gentle micro-relief + ruts on the road (jeeps bounce)
  h += 0.35 * noise(x * 0.35, z * 0.35) * (1 - w * 0.6);
  return h;
}

/** Height + distance-to-road in one go (used for colouring / placement). */
export function sampleWorld(x: number, z: number) {
  const near = nearestOnRoute(x, z);
  return { h: terrainHeight(x, z, near), d: near.d, u: near.u };
}

/** Is the world point inside the camp or village clearings? */
export function inClearing(x: number, z: number, pad = 0) {
  return (
    Math.hypot(x - KOTI.x, z - KOTI.z) < KOTI.r * 0.75 + pad || Math.hypot(x - CAMP.x, z - CAMP.z) < CAMP.r * 0.7 + pad
  );
}

/** Forest line rises with a little noise. */
export const forestLine = (x: number, z: number) => 27 + 6 * noise(x * 0.02, z * 0.02);
