/* Camera choreography + day/night updater.
 *  hero : establishing shot over Koti → chase cam behind the convoy → reveal of the camp
 *  camp : slow orbit around the campfire that tilts up to the stars as night falls */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '../lib/scrollState';
import { FIRE } from './Camp';
import { SUN_AZIMUTH, computeEnv, env } from './env';
import { damp, jeepState } from './state';
import { KOTI, KOTI_Y, routeElevation, routeXZ, smooth, terrainHeight } from './world';

const [s1x, s1z] = routeXZ(0.2);
const OV_POS = new THREE.Vector3(KOTI.x - 30, KOTI_Y + 44, KOTI.z + 36);
const OV_TARGET = new THREE.Vector3(s1x, routeElevation(0.2) + 2, s1z);
const AWAY = new THREE.Vector3(-SUN_AZIMUTH.x, 0, -SUN_AZIMUTH.z); // camera side, looking toward the sunset
const END_POS = FIRE.clone().addScaledVector(AWAY, 30).add(new THREE.Vector3(0, 12, 0));
const END_TARGET = FIRE.clone().addScaledVector(SUN_AZIMUTH, 18).add(new THREE.Vector3(0, 2, 0));

const pos = new THREE.Vector3();
const target = new THREE.Vector3();
const chasePos = new THREE.Vector3();
const chaseTarget = new THREE.Vector3();
const fwd = new THREE.Vector3();
const right = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const curPos = useRef(new THREE.Vector3().copy(OV_POS));
  const curTarget = useRef(new THREE.Vector3().copy(OV_TARGET));
  const lastMode = useRef<string>('');

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const mode = scrollState.mode;
    const snap = mode !== lastMode.current;
    lastMode.current = mode;
    const t = state.clock.elapsedTime;

    if (mode === 'camp') {
      const p = scrollState.camp;
      const k = smooth(0, 0.6, p);
      const ang = Math.atan2(AWAY.z, AWAY.x) + (p - 0.4) * 0.7 + Math.sin(t * 0.06) * 0.04;
      const radius = 26 - 12 * k;
      pos.set(FIRE.x + Math.cos(ang) * radius, FIRE.y + 11 - 7.4 * k, FIRE.z + Math.sin(ang) * radius);
      const up = smooth(0.4, 1, p);
      target.copy(FIRE).add(new THREE.Vector3(0, 1.4 + up * 6.5, 0)).addScaledVector(SUN_AZIMUTH, up * 8);
    } else {
      const p = scrollState.hero;
      const u = jeepState.u;
      // smoothed heading from a wider window of the road
      const [ax, az] = routeXZ(Math.max(0, u - 0.012));
      const [bx, bz] = routeXZ(Math.min(1, u + 0.02));
      fwd.set(bx - ax, 0, bz - az).normalize();
      right.crossVectors(fwd, UP).normalize();
      chasePos.copy(jeepState.position).addScaledVector(fwd, -9.5).addScaledVector(right, 3).add(new THREE.Vector3(0, 4.4, 0));
      chaseTarget.copy(jeepState.position).addScaledVector(fwd, 7).add(new THREE.Vector3(0, 0.6, 0));
      const a = smooth(0.0, 0.13, p);
      const b = smooth(0.88, 1.0, p);
      pos.copy(OV_POS).lerp(chasePos, a).lerp(END_POS, b);
      target.copy(OV_TARGET).lerp(chaseTarget, a).lerp(END_TARGET, b);
      // gentle hover at the very start
      pos.y += Math.sin(t * 0.4) * 0.6 * (1 - a);
    }

    // pointer parallax (desktop)
    right.subVectors(target, pos).cross(UP).normalize();
    pos.addScaledVector(right, scrollState.pointerX * 0.8);
    pos.y += -scrollState.pointerY * 0.5;

    if (snap) {
      curPos.current.copy(pos);
      curTarget.current.copy(target);
    } else {
      const l = mode === 'camp' ? 2.2 : 3.2;
      curPos.current.set(
        damp(curPos.current.x, pos.x, l, dt),
        damp(curPos.current.y, pos.y, l, dt),
        damp(curPos.current.z, pos.z, l, dt),
      );
      curTarget.current.set(
        damp(curTarget.current.x, target.x, l + 1, dt),
        damp(curTarget.current.y, target.y, l + 1, dt),
        damp(curTarget.current.z, target.z, l + 1, dt),
      );
    }
    // never go underground
    const ground = terrainHeight(curPos.current.x, curPos.current.z) + 1.6;
    if (curPos.current.y < ground) curPos.current.y = ground;
    camera.position.copy(curPos.current);
    camera.lookAt(curTarget.current);
  });
  return null;
}

/* Interpolates the day → night look and applies it to lights + fog. */
export function EnvUpdater() {
  const sun = useRef<THREE.DirectionalLight>(null!);
  const hemi = useRef<THREE.HemisphereLight>(null!);
  const scene = useThree((s) => s.scene);
  const night = useRef(0);
  const lastMode = useRef('');
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const mode = scrollState.mode;
    const goal =
      mode === 'camp'
        ? 0.12 + 0.88 * smooth(0.06, 0.82, scrollState.camp)
        : 0.02 + 0.2 * smooth(0.62, 1, scrollState.hero);
    const snap = mode !== lastMode.current;
    lastMode.current = mode;
    night.current = snap ? goal : damp(night.current, goal, 3, dt);
    computeEnv(night.current);
    if (scene.fog) {
      (scene.fog as THREE.Fog).color.copy(env.fog);
      (scene.fog as THREE.Fog).far = mode === 'camp' ? 330 : 470;
    }
    if (sun.current) {
      sun.current.color.copy(env.sunColor);
      sun.current.intensity = env.sunIntensity;
      sun.current.position.copy(env.lightDir).multiplyScalar(200);
    }
    if (hemi.current) {
      hemi.current.color.copy(env.hemiSky);
      hemi.current.groundColor.copy(env.hemiGround);
      hemi.current.intensity = env.hemiIntensity;
    }
  });
  return (
    <>
      <directionalLight ref={sun} intensity={2.5} position={[-150, 150, -100]} />
      <hemisphereLight ref={hemi} args={['#cfe6ff', '#4d5a2c', 1]} />
    </>
  );
}
