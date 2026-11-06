/* Loading screen: a winding mountain road is the progress bar and a little
 * jeep drives along it. */
import { useEffect, useRef, useState } from 'react';
import { T } from '../config/content';
import { useLang } from '../lib/i18n';
import { JeepIcon } from './Icon';

const ROAD = 'M20 150 C 70 150, 80 95, 130 100 S 190 150, 240 120 S 300 50, 350 70 S 420 110, 460 40';

export function Loader({ progress, done, onGone }: { progress: number; done: boolean; onGone: () => void }) {
  const { t } = useLang();
  const path = useRef<SVGPathElement>(null);
  const jeep = useRef<SVGGElement>(null);
  const shown = useRef(0);
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const target = useRef(progress);
  target.current = done ? 1 : progress;

  useEffect(() => {
    let raf = 0;
    const len = path.current?.getTotalLength() ?? 1;
    const tick = () => {
      shown.current += (target.current - shown.current) * 0.08;
      if (target.current - shown.current < 0.002) shown.current = target.current;
      const p = shown.current;
      if (path.current) path.current.style.strokeDashoffset = String(len * (1 - p));
      if (path.current && jeep.current) {
        const a = path.current.getPointAtLength(len * p);
        const b = path.current.getPointAtLength(Math.min(len, len * p + 2));
        const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        jeep.current.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang}) translate(-14 -24)`);
      }
      setPct(Math.round(p * 100));
      if (p >= 1 && done) {
        setLeaving(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  // safety net: never block the page if animation frames are paused (background tab)
  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setLeaving(true), 2200);
    return () => clearTimeout(id);
  }, [done]);

  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(onGone, 900);
    return () => clearTimeout(id);
  }, [leaving, onGone]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-forest transition-[clip-path,opacity] duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)] ${
        leaving ? '[clip-path:inset(0_0_100%_0)]' : '[clip-path:inset(0_0_0_0)]'
      }`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={t(T.loader.text)}
    >
      <div className="topo absolute inset-0 opacity-60" aria-hidden="true" />
      <p className="relative font-display text-[clamp(40px,9vw,88px)] uppercase leading-none text-offwhite">
        Weekend <span className="text-sunset">Extreme</span>
      </p>
      <svg viewBox="0 0 480 190" className="relative mt-6 w-[min(88vw,560px)]" aria-hidden="true">
        <path d="M0 190 L60 110 L110 150 L180 60 L250 140 L320 40 L400 120 L480 70 V190Z" fill="#153626" />
        <path d={ROAD} fill="none" stroke="#2a4a35" strokeWidth="10" strokeLinecap="round" />
        <path d={ROAD} fill="none" stroke="#F4F1EA" strokeOpacity=".25" strokeWidth="1.5" strokeDasharray="4 8" />
        <path ref={path} d={ROAD} fill="none" stroke="#E8772E" strokeWidth="5" strokeLinecap="round" strokeDasharray="2000" strokeDashoffset="2000" />
        <circle cx="460" cy="40" r="6" fill="#E8772E" />
        <path d="M460 40 v-22 l12 5 -12 5" fill="none" stroke="#F4F1EA" strokeWidth="2" />
        <g ref={jeep} className="text-offwhite">
          <g transform="scale(1.15)">
            <JeepIcon size={24} />
          </g>
        </g>
      </svg>
      <p className="relative mt-4 text-sm tracking-[0.2em] text-offwhite/70 uppercase">
        {t(T.loader.text)} <span className="tabular-nums text-sunset">{pct}%</span>
      </p>
    </div>
  );
}
