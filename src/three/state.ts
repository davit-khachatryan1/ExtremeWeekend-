/* Live 3D state shared between the convoy and the camera rig. */
import { Vector3 } from 'three';

export const jeepState = {
  /** leader position along the route, 0 … 1 */
  u: 0,
  position: new Vector3(),
  forward: new Vector3(0, 0, 1),
  speed: 0,
};

/** exponential damping helper (frame-rate independent) */
export const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
