/* Lightweight fallback for reduced-motion / weak devices / no WebGL:
 * layered SVG mountains (gentle parallax), a jeep that follows the scroll
 * along a dotted route, and a day → night sky for the camp section.
 * If SITE.heroVideo is set, a looping video is used for the hero instead. */
import { useEffect, useMemo, useRef } from 'react';
import { SITE } from '../config/content';
import { prefersReducedMotion } from '../lib/device';
import { scrollState, useSceneMode } from '../lib/scrollState';
import { JeepIcon } from './Icon';

const ROUTE = 'M-20 640 C 140 600, 220 520, 380 540 S 620 600, 760 500 S 980 380, 1120 420 S 1340 470, 1460 360';

export function StaticScene() {
  const mode = useSceneMode();
  const sunset = useRef<HTMLDivElement>(null);
  const night = useRef<HTMLDivElement>(null);
  const stars = useRef<HTMLDivElement>(null);
  const far = useRef<SVGGElement>(null);
  const mid = useRef<SVGGElement>(null);
  const near = useRef<SVGGElement>(null);
  const camp = useRef<SVGGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const jeep = useRef<SVGGElement>(null);
  const video = SITE.heroVideo && !prefersReducedMotion() ? SITE.heroVideo : '';

  const starList = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        x: (i * 73.13) % 100,
        y: (i * 37.7) % 55,
        s: i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1.3,
        d: (i % 7) * 0.4,
      })),
    [],
  );

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let raf = 0;
    const tick = () => {
      const n = scrollState.mode === 'camp' ? scrollState.camp : 0;
      if (sunset.current) sunset.current.style.opacity = String(Math.min(1, Math.max(0, n * 2.2 - 0.1)) * (1 - Math.max(0, n - 0.6) * 2.5));
      if (night.current) night.current.style.opacity = String(Math.min(1, Math.max(0, (n - 0.4) * 2)));
      if (stars.current) stars.current.style.opacity = String(Math.min(1, Math.max(0, (n - 0.5) * 2.2)));
      if (camp.current) camp.current.style.opacity = scrollState.mode === 'camp' ? '1' : '0';
      if (!reduce) {
        const y = window.scrollY;
        const h = scrollState.mode === 'camp' ? 0 : y;
        far.current?.setAttribute('transform', `translate(0 ${-(h * 0.02) % 60})`);
        mid.current?.setAttribute('transform', `translate(0 ${-(h * 0.04) % 80})`);
        near.current?.setAttribute('transform', `translate(0 ${-(h * 0.07) % 120})`);
      }
      if (path.current && jeep.current) {
        const len = path.current.getTotalLength();
        const u = scrollState.mode === 'camp' ? 1 : Math.min(1, Math.max(0, (scrollState.hero - 0.06) / 0.84));
        const a = path.current.getPointAtLength(len * u);
        const b = path.current.getPointAtLength(Math.min(len, len * u + 3));
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        jeep.current.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang}) translate(-22 -38) scale(1.8)`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true" style={{ visibility: mode === 'none' ? 'hidden' : 'visible' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#3b7ccc] via-[#8fb8d8] to-[#cfe3ec]" />
      <div ref={sunset} className="absolute inset-0 bg-gradient-to-b from-[#2a3d6e] via-[#b5607a] to-[#f0874a] opacity-0" />
      <div ref={night} className="absolute inset-0 bg-gradient-to-b from-[#02050d] via-[#0b1426] to-[#1b2340] opacity-0" />
      <div ref={stars} className="absolute inset-0 opacity-0">
        {starList.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animation: `twinkle ${2 + s.d}s ease-in-out ${s.d}s infinite` }}
          />
        ))}
        <span className="absolute right-[18%] top-[12%] h-12 w-12 rounded-full bg-[#f4f1ea] shadow-[0_0_60px_20px_rgba(244,241,234,.25)]" />
      </div>
      {video && mode === 'hero' && (
        <video className="absolute inset-0 h-full w-full object-cover" src={video} poster={SITE.heroVideoPoster || undefined} autoPlay muted loop playsInline />
      )}
      <svg className="absolute bottom-0 left-0 h-[78%] w-full" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMax slice">
        <g ref={far}>
          <path d="M0 420 L120 300 L210 360 L340 220 L470 340 L560 270 L700 380 L820 240 L960 330 L1080 210 L1220 320 L1340 260 L1440 300 V800 H0Z" fill="#5d7a8c" opacity=".55" />
          <path d="M340 220 L370 250 L355 248 L330 262Z M1080 210 L1112 245 L1092 240 L1068 252Z" fill="#e8e5dc" opacity=".8" />
        </g>
        <g ref={mid}>
          <path d="M0 520 L160 400 L260 470 L400 360 L520 460 L660 380 L800 470 L940 370 L1080 460 L1220 390 L1440 470 V820 H0Z" fill="#2d5a36" />
        </g>
        <g ref={near}>
          <path d="M0 640 C 200 560, 320 600, 480 580 S 760 520, 900 560 S 1200 620, 1440 540 V840 H0Z" fill="#1c4628" />
          {Array.from({ length: 34 }, (_, i) => {
            const x = (i * 97) % 1440;
            const y = 600 + ((i * 53) % 80);
            return <path key={i} d={`M${x} ${y} l14 -40 l14 40Z`} fill={i % 2 ? '#14381f' : '#1f5130'} />;
          })}
          <path ref={path} d={ROUTE} fill="none" stroke="#E8772E" strokeWidth="4" strokeDasharray="1 12" strokeLinecap="round" />
          <g ref={jeep} className="text-[#E8772E]">
            <JeepIcon size={24} strokeWidth={2.2} />
          </g>
          <g ref={camp} style={{ transition: 'opacity .6s' }} opacity="0">
            <path d="M1180 470 l34 -46 l34 46Z" fill="#E8772E" />
            <path d="M1250 480 l28 -38 l28 38Z" fill="#1f3a5f" />
            <circle cx="1230" cy="492" r="40" fill="#ff8a3a" opacity=".25" />
            <path d="M1222 496 q8 -24 8 -30 q8 14 6 30Z" fill="#ffb347" className="anim-flicker" />
          </g>
        </g>
      </svg>
    </div>
  );
}
