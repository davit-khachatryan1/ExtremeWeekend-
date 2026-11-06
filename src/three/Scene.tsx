/* The single fixed WebGL canvas behind the page. Lazy-loaded (separate chunk).
 * It renders only while the hero or the camp section is on screen. */
import { useRef, useState } from 'react';
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
  low: { seg: 150, trees: 1200, grass: 5500, stars: 1800, clouds: 15, dpr: 1.3, aa: false },
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

export default function Scene({ quality, onReady }: { quality: 'high' | 'low'; onReady: () => void }) {
  const mode = useSceneMode();
  const q = QUALITY[quality];
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, q.dpr));
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        frameloop={mode === 'none' ? 'never' : 'always'}
        gl={{ antialias: q.aa, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 50, near: 0.3, far: 1600, position: [-200, 60, 200] }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <fog attach="fog" args={['#c2d7df', 70, 470]} />
        <EnvUpdater />
        <SkyDome />
        <Stars count={q.stars} />
        <Clouds count={q.clouds} />
        <Terrain segments={q.seg} />
        <Forest count={q.trees} />
        <Grass count={q.grass} />
        <RouteDots />
        <Beacons />
        <RouteLabels />
        <Village />
        <Camp />
        <Convoy />
        <CameraRig />
        <ReadySignal onReady={onReady} />
      </Canvas>
    </div>
  );
}
