import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { detectQuality, prefersReducedMotion } from './lib/device';
import { useLang } from './lib/i18n';
import { ScrollTrigger, initSmoothScroll, scrollToTarget, startScroll, stopScroll } from './lib/smooth';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { Cursor } from './components/Cursor';
import { StaticScene } from './components/StaticScene';
import { StickyBook } from './components/StickyBook';
import { Hero } from './sections/Hero';
import { Numbers, Why } from './sections/Why';
import { RouteSection } from './sections/RouteMap';
import { Itinerary } from './sections/Itinerary';
import { Quest } from './sections/Quest';
import { CampSection } from './sections/Camp';
import { Packages } from './sections/Packages';
import { Bring, Families, Included, Safety, Season } from './sections/Info';
import { Gallery, Reviews } from './sections/Gallery';
import { Faq } from './sections/Faq';
import { Booking } from './sections/Booking';
import { Footer } from './sections/Footer';

/* The 3D scene is a separate, lazily loaded chunk. */
let chunkLoaded: (() => void) | null = null;
const Scene = lazy(() =>
  import('./three/Scene').then((m) => {
    chunkLoaded?.();
    return m;
  }),
);

export default function App() {
  const quality = useMemo(detectQuality, []);
  const [progress, setProgress] = useState(0.05);
  const [ready, setReady] = useState(false); // loader can finish
  const [gone, setGone] = useState(false); // loader removed

  // loading steps: fonts → 3D chunk → first frame (or straight to done for the fallback)
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    initSmoothScroll(!prefersReducedMotion());
    stopScroll();
    chunkLoaded = () => setProgress((p) => Math.max(p, 0.7));
    document.fonts?.ready.then(() => setProgress((p) => Math.max(p, quality === 'off' ? 1 : 0.4)));
    if (quality === 'off') {
      const id = window.setTimeout(() => setReady(true), 600);
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
  }, []);

  const onLoaderGone = useCallback(() => {
    setGone(true);
    startScroll();
    ScrollTrigger.refresh();
    const hash = window.location.hash;
    if (hash && hash.length > 1) window.setTimeout(() => scrollToTarget(hash), 120);
  }, []);

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
      {quality === 'off' ? (
        <StaticScene />
      ) : (
        <Suspense fallback={null}>
          <Scene quality={quality} onReady={onSceneReady} />
        </Suspense>
      )}
      <Cursor />
      <Header />
      <main id="main" ref={main} className="relative z-10">
        <Hero started={gone} />
        <Why />
        <Numbers />
        <RouteSection />
        <Itinerary />
        <Quest />
        <CampSection />
        <Packages />
        <Included />
        <Bring />
        <Season />
        <Families />
        <Safety />
        <Gallery />
        <Reviews />
        <Faq />
        <Booking />
      </main>
      <Footer />
      <StickyBook ready={gone} />
    </div>
  );
}
