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
/* Which 3D-backed sections are on screen. The scene mode is derived from both
 * at once, so it never depends on the order ScrollTrigger fires callbacks in
 * (e.g. when jumping straight from the camp back to the hero). */
const onScreen = { hero: true, camp: false };
export function setSectionOnScreen(section: 'hero' | 'camp', on: boolean) {
  onScreen[section] = on;
  setSceneMode(onScreen.hero ? 'hero' : onScreen.camp ? 'camp' : 'none');
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
