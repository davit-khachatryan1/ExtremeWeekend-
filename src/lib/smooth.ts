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

/** Smoothly scroll to a selector (e.g. '#booking') or element. The section
 * lands just below the fixed header: both Lenis and the native fallback honour
 * the CSS `scroll-padding-top` on <html>; `offset` adds extra space (negative = higher gap). */
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.6 });
  } else {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - pad + offset;
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
