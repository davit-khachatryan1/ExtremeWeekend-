/* The single fixed WebGL canvas behind the page. Lazy-loaded (separate chunk).
 * It renders only while the hero or the camp section is on screen. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useSceneMode } from '../lib/scrollState';
import { Camp, Village } from './Camp';
import { CameraRig, EnvUpdater } from './CameraRig';
import { Convoy } from './Jeep';
import { Beacons, RouteDots, RouteLabels } from './Route';
import { Clouds, SkyDome, Stars } from './Sky';
import { Forest, Grass, Terrain } from './Terrain';

const QUALITY = {
  high: { seg: 230, trees: 2800, grass: 15000, stars: 3800, clouds: 27, dpr: 1.75, aa: true },
  low: { seg: 128, trees: 950, grass: 3800, stars: 1400, clouds: 12, dpr: 1.25, aa: false },
};

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current > 2) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

/** Adds the heavy parts of the world one per step, so building it never blocks
 * the page for long. */
function useStage(last: number) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= last) return;
    const id = window.setTimeout(() => setStage((s) => s + 1), 16);
    return () => clearTimeout(id);
  }, [stage, last]);
  return stage;
}

function World({ q, onReady }: { q: (typeof QUALITY)['high']; onReady: () => void }) {
  const stage = useStage(5);
  return (
    <>
      <EnvUpdater />
      <SkyDome />
      <CameraRig />
      <Terrain segments={q.seg} />
      {stage >= 1 && <Forest count={q.trees} />}
      {stage >= 2 && <Grass count={q.grass} />}
      {stage >= 3 && (
        <>
          <RouteDots />
          <Beacons />
          <RouteLabels />
          <Village />
        </>
      )}
      {stage >= 4 && (
        <>
          <Camp />
          <Convoy />
        </>
      )}
      {stage >= 5 && (
        <>
          <Stars count={q.stars} />
          <Clouds count={q.clouds} />
          <ReadySignal onReady={onReady} />
        </>
      )}
    </>
  );
}

export default function Scene({ quality, onReady }: { quality: 'high' | 'low'; onReady: () => void }) {
  const mode = useSceneMode();
  const q = QUALITY[quality];
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, q.dpr));
  // fades in over the illustrated landscape on phones (on desktop the loader covers it)
  const [shown, setShown] = useState(false);
  const ready = useCallback(() => {
    setShown(true);
    onReady();
  }, [onReady]);
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000"
      style={{ opacity: shown ? 1 : 0 }}
      aria-hidden="true"
    >
      <Canvas
        dpr={dpr}
        frameloop={mode === 'none' ? 'never' : 'always'}
        gl={{ antialias: q.aa, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 50, near: 0.3, far: 1600, position: [-200, 60, 200] }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <fog attach="fog" args={['#c2d7df', 70, 470]} />
        <World q={q} onReady={ready} />
      </Canvas>
    </div>
  );
}
