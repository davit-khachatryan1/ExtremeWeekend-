/* Day → sunset → night palette. `night` 0 = bright day, 1 = deep starry night.
 * Every frame EnvUpdater writes the interpolated values into `env`, and the
 * sky, lights, fog, stars, campfire and headlights read from it. */
import { Color, Vector3 } from 'three';

interface Key {
  n: number;
  top: string;
  hor: string;
  fog: string;
  sun: string;
  sunI: number;
  hemiSky: string;
  hemiGround: string;
  hemiI: number;
  elev: number; // sun elevation (sin)
  stars: number;
  cloud: string;
  cloudA: number;
}

const KEYS: Key[] = [
  { n: 0, top: '#3b7ccc', hor: '#cfe3ec', fog: '#c2d7df', sun: '#fff1d6', sunI: 2.7, hemiSky: '#cfe6ff', hemiGround: '#4d5a2c', hemiI: 1.0, elev: 0.72, stars: 0, cloud: '#ffffff', cloudA: 0.85 },
  { n: 0.22, top: '#4673b4', hor: '#f3d6ad', fog: '#d8c9ac', sun: '#ffd49c', sunI: 2.3, hemiSky: '#ffe2bf', hemiGround: '#4d4a2c', hemiI: 0.85, elev: 0.3, stars: 0, cloud: '#fff1df', cloudA: 0.85 },
  { n: 0.48, top: '#2a3d6e', hor: '#f0874a', fog: '#b9775a', sun: '#ff8d4a', sunI: 1.4, hemiSky: '#ffb08a', hemiGround: '#3a2c26', hemiI: 0.6, elev: 0.03, stars: 0.08, cloud: '#ffb48a', cloudA: 0.8 },
  { n: 0.7, top: '#0f1834', hor: '#3d2d4c', fog: '#272641', sun: '#b48aff', sunI: 0.45, hemiSky: '#5a5d9c', hemiGround: '#1d1a24', hemiI: 0.4, elev: -0.12, stars: 0.65, cloud: '#544a6e', cloudA: 0.45 },
  { n: 1, top: '#02050d', hor: '#0b1426', fog: '#0a1222', sun: '#9fb4ff', sunI: 0.5, hemiSky: '#3a4a80', hemiGround: '#0b0f18', hemiI: 0.32, elev: -0.35, stars: 1, cloud: '#1c2440', cloudA: 0.3 },
];

/** azimuth the sun sets toward (x, z) — camp camera looks this way */
export const SUN_AZIMUTH = new Vector3(-0.74, 0, 0.67).normalize();
/** the moon hangs high in the same part of the sky */
export const MOON_DIR = new Vector3(-0.62, 0.66, 0.3).normalize();

const C = (h: string) => new Color(h);
const cache = KEYS.map((k) => ({
  ...k,
  cTop: C(k.top),
  cHor: C(k.hor),
  cFog: C(k.fog),
  cSun: C(k.sun),
  cHs: C(k.hemiSky),
  cHg: C(k.hemiGround),
  cCloud: C(k.cloud),
}));

export const env = {
  night: 0,
  top: new Color(),
  horizon: new Color(),
  fog: new Color(),
  sunColor: new Color(),
  sunIntensity: 1,
  hemiSky: new Color(),
  hemiGround: new Color(),
  hemiIntensity: 1,
  /** direction TO the sun (unit) */
  sunDir: new Vector3(),
  /** direction the main light comes from (sun by day, moon at night) */
  lightDir: new Vector3(),
  stars: 0,
  cloud: new Color(),
  cloudOpacity: 1,
  /** 0..1 how much artificial light (campfire, headlights, fairy lights) matters */
  lights: 0,
};

const tmp = new Vector3();
export function computeEnv(n: number) {
  env.night = n;
  let i = 0;
  while (i < cache.length - 2 && n > cache[i + 1].n) i++;
  const a = cache[i];
  const b = cache[i + 1];
  const t = Math.min(1, Math.max(0, (n - a.n) / (b.n - a.n)));
  env.top.copy(a.cTop).lerp(b.cTop, t);
  env.horizon.copy(a.cHor).lerp(b.cHor, t);
  env.fog.copy(a.cFog).lerp(b.cFog, t);
  env.sunColor.copy(a.cSun).lerp(b.cSun, t);
  env.sunIntensity = a.sunI + (b.sunI - a.sunI) * t;
  env.hemiSky.copy(a.cHs).lerp(b.cHs, t);
  env.hemiGround.copy(a.cHg).lerp(b.cHg, t);
  env.hemiIntensity = a.hemiI + (b.hemiI - a.hemiI) * t;
  env.stars = a.stars + (b.stars - a.stars) * t;
  env.cloud.copy(a.cCloud).lerp(b.cCloud, t);
  env.cloudOpacity = a.cloudA + (b.cloudA - a.cloudA) * t;
  const elev = a.elev + (b.elev - a.elev) * t;
  const horiz = Math.sqrt(Math.max(0, 1 - elev * elev));
  env.sunDir.set(SUN_AZIMUTH.x * horiz, elev, SUN_AZIMUTH.z * horiz).normalize();
  // light switches from the sun to the moon after sunset
  const m = Math.min(1, Math.max(0, (n - 0.55) / 0.25));
  tmp.copy(env.sunDir);
  if (tmp.y < 0.05) tmp.y = 0.05;
  env.lightDir.copy(tmp).lerp(MOON_DIR, m).normalize();
  env.lights = Math.min(1, Math.max(0, (n - 0.35) / 0.45));
}
computeEnv(0);
