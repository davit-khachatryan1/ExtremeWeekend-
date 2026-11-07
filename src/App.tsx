import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { detectQuality, prefersReducedMotion } from './lib/device';
import { useLang } from './lib/i18n';
import { ScrollTrigger, initSmoothScroll, scrollToTarget, startScroll, stopScroll } from './lib/smooth';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { Cursor } from './components/Cursor';
import { StaticScene } from './components/StaticScene';
import { Hero } from './sections/Hero';

/* Below-the-hero sections: separate file, requested right after the first paint. */
const BelowFold = lazy(() => import('./sections/BelowFold'));
const Tail = lazy(() => import('./sections/BelowFold').then((m) => ({ default: m.Tail })));

/* The 3D scene is a separate, lazily loaded chunk. */
let chunkLoaded: (() => void) | null = null;
const Scene = lazy(() =>
  import('./three/Scene').then((m) => {
    chunkLoaded?.();
    return m;
  }),
);

/** Scroll to an element as soon as it exists (sections load in a second file). */
function scrollWhenReady(selector: string) {
  const t0 = performance.now();
  const tryIt = () => {
    if (document.querySelector(selector)) scrollToTarget(selector);
    else if (performance.now() - t0 < 5000) window.setTimeout(tryIt, 100);
  };
  window.setTimeout(tryIt, 120);
}

export default function App() {
  const quality = useMemo(detectQuality, []);
  const [progress, setProgress] = useState(0.05);
  const [ready, setReady] = useState(false); // loader can finish
  const [gone, setGone] = useState(false); // loader removed
  // Desktop builds the 3D behind the loader. Phones show the page first (with the
  // illustrated landscape) and fade the 3D in once it is ready.
  const [load3D, setLoad3D] = useState(quality === 'high');
  const [sceneReady, setSceneReady] = useState(false);
  const [staticBg, setStaticBg] = useState(quality !== 'high');

  // loading steps: fonts → 3D chunk → first frame (or straight to done for the fallback)
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    initSmoothScroll(!prefersReducedMotion());
    stopScroll();
    chunkLoaded = () => setProgress((p) => Math.max(p, 0.7));
    document.fonts?.ready.then(() => setProgress((p) => Math.max(p, quality === 'off' ? 1 : 0.4)));
    if (quality !== 'high') {
      // phones & fallback: the loader only waits for the fonts (max 2.5 s)
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        setProgress(1);
        setReady(true);
      };
      document.fonts?.ready.then(finish);
      const id = window.setTimeout(finish, 2500);
      return () => clearTimeout(id);
    }
    // creep forward while the scene builds; never hang longer than 9 s
    const creep = window.setInterval(() => setProgress((p) => Math.min(0.92, p + 0.015)), 120);
    const max = window.setTimeout(() => setReady(true), 9000);
    return () => {
      clearInterval(creep);
      clearTimeout(max);
    };
  }, [quality]);

  const onSceneReady = useCallback(() => {
    setProgress(1);
    setReady(true);
    setSceneReady(true);
  }, []);

  const onLoaderGone = useCallback(() => {
    setGone(true);
    startScroll();
    ScrollTrigger.refresh();
    const hash = window.location.hash;
    if (hash && hash.length > 1) scrollWhenReady(hash);
  }, []);

  // phones: build the 3D when the visitor first touches/scrolls (or after 5 s),
  // so the first screen stays fast and responsive
  useEffect(() => {
    if (quality !== 'low' || !gone) return;
    const events = ['pointerdown', 'touchstart', 'wheel', 'keydown'] as const;
    let id = 0;
    const start = () => {
      cleanup();
      setLoad3D(true);
    };
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, start));
      clearTimeout(id);
    };
    events.forEach((e) => window.addEventListener(e, start, { passive: true }));
    id = window.setTimeout(start, 5000);
    return cleanup;
  }, [quality, gone]);

  // remove the illustrated landscape once the 3D has faded in over it
  useEffect(() => {
    if (!sceneReady || quality === 'off') return;
    const id = window.setTimeout(() => setStaticBg(false), 1200);
    return () => clearTimeout(id);
  }, [sceneReady, quality]);

  // Keep scroll positions (hero drive, camp day→night, pinned gallery) in sync
  // with the layout: fonts/images loading, language switches, opened tabs,
  // accordions and cards all change the page height after the first measure.
  const main = useRef<HTMLElement>(null);
  const { lang } = useLang();
  useEffect(() => {
    const r = () => ScrollTrigger.refresh();
    window.addEventListener('load', r);
    document.fonts?.ready.then(r);
    let timer = 0;
    let lastHeight = 0;
    const ro = new ResizeObserver((entries) => {
      const h = Math.round(entries[0].contentRect.height);
      if (Math.abs(h - lastHeight) < 2) return;
      lastHeight = h;
      clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    });
    if (main.current) ro.observe(main.current);
    return () => {
      window.removeEventListener('load', r);
      ro.disconnect();
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    // text reflows right after a language switch; measure once it has settled
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [lang]);

  return (
    <div className="grain">
      {!gone && <Loader progress={progress} done={ready} onGone={onLoaderGone} />}
      {staticBg && <StaticScene />}
      {quality !== 'off' && load3D && (
        <Suspense fallback={null}>
          <Scene quality={quality} onReady={onSceneReady} />
        </Suspense>
      )}
      <Cursor />
      <Header />
      <main id="main" ref={main} className="relative z-10">
        <Hero started={gone} />
        <Suspense fallback={<div className="min-h-[100vh] bg-forest" />}>
          <BelowFold />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Tail ready={gone} />
      </Suspense>
    </div>
  );
}
