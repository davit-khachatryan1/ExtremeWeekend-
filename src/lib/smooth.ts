/* Lenis smooth scroll wired into GSAP ScrollTrigger. */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll(enabled: boolean) {
  if (!enabled || lenis) return lenis;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function getLenis() {
  return lenis;
}

/** Smoothly scroll to a selector (e.g. '#booking') or element. */
export function scrollToTarget(target: string | HTMLElement, offset = -64) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.6 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }
}

export function stopScroll() {
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
}
export function startScroll() {
  lenis?.start();
  document.documentElement.style.overflow = '';
}

export { gsap, ScrollTrigger };
