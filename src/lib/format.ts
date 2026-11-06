import { PACKAGES, T, type Lang } from '../config/content';

/** 30000 → "30 000" (thin no-break spaces keep numbers together) */
export function num(n: number) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function price(n: number, lang: Lang) {
  return `${num(n)} ${T.common.amd[lang]}`;
}

export function minPrice() {
  return Math.min(...PACKAGES.filter((p) => p.price != null).map((p) => p.price as number));
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
