/* Shared, mutable scroll/scene state. Written by ScrollTriggers in the DOM
 * sections, read every frame by the 3D scene (no React re-renders). */
import { useSyncExternalStore } from 'react';

export type SceneMode = 'hero' | 'camp' | 'none';

export const scrollState = {
  /** 0 → 1 while scrolling through the hero journey */
  hero: 0,
  /** 0 → 1 while scrolling through the camp (day → night) */
  camp: 0,
  mode: 'hero' as SceneMode,
  /** normalized pointer position -1 … 1 */
  pointerX: 0,
  pointerY: 0,
};

/* Tiny store so React components can subscribe to the scene mode only. */
const listeners = new Set<() => void>();
export function setSceneMode(mode: SceneMode) {
  if (scrollState.mode === mode) return;
  scrollState.mode = mode;
  listeners.forEach((l) => l());
}
export function useSceneMode() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => scrollState.mode,
  );
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      scrollState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
}
