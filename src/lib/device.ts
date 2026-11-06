/* Decide how heavy the visuals can be on this device.
 *  - 'high' : desktop / strong devices → full 3D
 *  - 'low'  : phones & mid devices     → lighter 3D (fewer trees/grass, lower DPR)
 *  - 'off'  : reduced motion, no WebGL, very weak devices → static illustrated fallback
 * Override for testing with ?quality=high|low|off */
export type Quality = 'high' | 'low' | 'off';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function detectQuality(): Quality {
  const q = new URLSearchParams(window.location.search).get('quality');
  if (q === 'high' || q === 'low' || q === 'off') return q;
  if (prefersReducedMotion() || !hasWebGL()) return 'off';
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory || 4;
  if (nav.connection?.saveData) return 'off';
  if (cores <= 2 || mem <= 2) return 'off';
  const small = window.matchMedia('(max-width: 820px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (small || coarse || cores <= 4) return 'low';
  return 'high';
}
