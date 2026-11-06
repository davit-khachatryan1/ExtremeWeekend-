/* HERO — tall scroll section. While you scroll, the 3D convoy drives
 * Koti → Camp and a HUD shows the current checkpoint, time on road and altitude. */
import { useEffect, useRef, useState } from 'react';
import { CHECKPOINTS, T } from '../config/content';
import { useLang } from '../lib/i18n';
import { minPrice, price } from '../lib/format';
import { gsap, ScrollTrigger, scrollToTarget } from '../lib/smooth';
import { scrollState, setSceneMode } from '../lib/scrollState';
import { prefersReducedMotion } from '../lib/device';
import { Icon } from '../components/Icon';
import { Cta, SplitReveal, cx } from '../components/motion';
import { SoundBars } from '../components/Header';
import { setAmbientSound, useSoundOn } from '../lib/audio';

const uFromHero = (p: number) => Math.min(1, Math.max(0, (p - 0.06) / 0.84));

function altitudeAt(u: number) {
  for (let i = 0; i < CHECKPOINTS.length - 1; i++) {
    const a = CHECKPOINTS[i], b = CHECKPOINTS[i + 1];
    if (u <= b.u) return a.alt + ((b.alt - a.alt) * (u - a.u)) / (b.u - a.u || 1);
  }
  return CHECKPOINTS[CHECKPOINTS.length - 1].alt;
}

export function Hero({ started }: { started: boolean }) {
  const { t, lang } = useLang();
  const section = useRef<HTMLElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const timeEl = useRef<HTMLSpanElement>(null);
  const altEl = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const [cp, setCp] = useState(0);
  const cpRef = useRef(0);
  const soundOn = useSoundOn();

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => {
        const p = s.progress;
        scrollState.hero = p;
        const u = uFromHero(p);
        // which checkpoint have we passed?
        let idx = 0;
        CHECKPOINTS.forEach((c, i) => {
          if (u >= c.u - 0.02) idx = i;
        });
        if (idx !== cpRef.current) {
          cpRef.current = idx;
          setCp(idx);
        }
        if (bar.current) bar.current.style.transform = `scaleX(${u})`;
        const mins = Math.round(u * 120);
        if (timeEl.current)
          timeEl.current.textContent = `${Math.floor(mins / 60)} ${t(T.hero.hour)} ${String(mins % 60).padStart(2, '0')} ${t(T.hero.min)}`;
        if (altEl.current) altEl.current.textContent = `${Math.round(altitudeAt(u) / 10) * 10}`;
        // intro fades out, HUD fades in
        const fade = Math.min(1, p / 0.07);
        if (intro.current) {
          intro.current.style.opacity = String(1 - fade);
          intro.current.style.transform = reduce ? '' : `translateY(${-fade * 60}px)`;
          intro.current.style.pointerEvents = fade > 0.6 ? 'none' : 'auto';
        }
        if (hint.current) hint.current.style.opacity = String(1 - Math.min(1, p / 0.03));
        if (hud.current) {
          const inA = Math.min(1, Math.max(0, (p - 0.06) / 0.04));
          const out = 1 - Math.min(1, Math.max(0, (p - 0.95) / 0.05));
          hud.current.style.opacity = String(inA * out);
          // the invisible HUD must not block the hero buttons underneath it
          hud.current.style.pointerEvents = inA * out > 0.5 ? 'auto' : 'none';
          hud.current.style.transform = `translateY(${(1 - inA) * 24}px)`;
        }
      },
      onToggle: (s) => {
        if (s.isActive) setSceneMode('hero');
      },
      onLeave: () => setSceneMode('none'),
      onEnterBack: () => setSceneMode('hero'),
    });
    return () => st.kill();
  }, [t]);

  // entrance animation for badges/buttons after the loader
  useEffect(() => {
    if (!started || !intro.current || prefersReducedMotion()) return;
    const items = intro.current.querySelectorAll('[data-in]');
    gsap.fromTo(items, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.07, delay: 0.35 });
  }, [started]);

  const current = CHECKPOINTS[cp];
  return (
    <section id="top" ref={section} className="relative h-[430vh]" aria-label="Weekend Extreme">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* readability gradients over the 3D scene */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/10 to-night/40" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-night/55 via-night/10 to-transparent md:w-2/3" aria-hidden="true" />

        <div ref={intro} className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-24 pt-24 md:px-10 md:pb-16 lg:justify-center lg:pb-0 [@media(max-height:560px)]:justify-end [@media(max-height:560px)]:pb-5 [@media(max-height:560px)]:pt-20">
          <p data-in className="mb-5 inline-flex w-fit items-center gap-2 rounded-full [@media(max-height:560px)]:mb-3 [@media(max-height:460px)]:hidden border border-offwhite/25 bg-night/35 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-offwhite backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sunset" aria-hidden="true" />
            {t(T.hero.eyebrow)}
          </p>
          {started ? (
            <SplitReveal
              as="h1"
              text="Weekend Extreme"
              immediate
              stagger={0.035}
              className="font-display text-[clamp(min(64px,17svh),min(13.5vw,19svh),210px)] uppercase leading-[0.84] tracking-[-0.01em] text-offwhite drop-shadow-[0_6px_30px_rgba(0,0,0,.35)]"
            />
          ) : (
            <h1 className="font-display text-[clamp(min(64px,17svh),min(13.5vw,19svh),210px)] uppercase leading-[0.84] tracking-[-0.01em] text-offwhite">Weekend Extreme</h1>
          )}
          <p data-in className="mt-5 max-w-2xl text-[clamp(18px,2.3vw,28px)] font-medium [@media(max-height:560px)]:mt-3 [@media(max-height:560px)]:text-base leading-snug text-offwhite drop-shadow-[0_2px_12px_rgba(0,0,0,.5)]">
            {t(T.hero.tagline)}
          </p>
          <div data-in className="mt-8 flex flex-wrap gap-3 [@media(max-height:560px)]:mt-4">
            <Cta onClick={() => scrollToTarget('#booking')}>
              {t(T.hero.book)} <Icon name="arrow" size={18} />
            </Cta>
            <Cta variant="ghost" onClick={() => scrollToTarget('#route')}>
              <Icon name="pin" size={18} /> {t(T.hero.route)}
            </Cta>
          </div>
          <ul data-in className="mt-8 flex max-w-3xl flex-wrap gap-2 [@media(max-height:560px)]:hidden" aria-label="Highlights">
            {T.hero.badges.map((b, i) => (
              <li key={i} className="rounded-full border border-offwhite/20 bg-night/40 px-3 py-1.5 text-[13px] text-offwhite/90 backdrop-blur">
                {t(b)}
              </li>
            ))}
            <li className="rounded-full bg-sunset px-3 py-1.5 text-[13px] font-semibold text-forest">
              {t(T.hero.from)} {price(minPrice(), lang)}
            </li>
          </ul>
        </div>

        {/* scroll hint */}
        <div ref={hint} className="absolute bottom-6 right-5 z-10 hidden items-center gap-3 text-[12px] uppercase tracking-[0.2em] text-offwhite/80 md:flex md:right-10 [@media(max-height:560px)]:!hidden" aria-hidden="true">
          {t(T.hero.scroll)}
          <span className="relative flex h-9 w-5 justify-center rounded-full border border-offwhite/50 pt-1.5">
            <span className="h-2 w-1 rounded-full bg-sunset" style={{ animation: 'scroll-dot 1.6s ease-in-out infinite' }} />
          </span>
        </div>

        {/* journey HUD */}
        <div
          ref={hud}
          className="pointer-events-none absolute inset-x-4 bottom-20 z-10 opacity-0 md:inset-x-auto md:bottom-10 md:left-10 md:w-[440px]"
          aria-live="polite"
        >
          <div className="rounded-3xl border border-offwhite/15 bg-night/60 p-5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 text-[12px] uppercase tracking-[0.2em] text-offwhite/60">
              <span>
                {t(T.hero.hudTitle)} · <span className="tabular-nums text-sunset">{cp + 1}/{CHECKPOINTS.length}</span>
              </span>
              <button
                type="button"
                onClick={() => setAmbientSound(!soundOn)}
                aria-pressed={soundOn}
                className={cx(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] transition-colors',
                  soundOn ? 'border-sunset/60 bg-sunset/15 text-offwhite' : 'border-offwhite/25 text-offwhite/80 hover:border-offwhite/60 hover:text-offwhite',
                )}
              >
                {soundOn ? <SoundBars /> : <Icon name="soundOff" size={14} />}
                {t(T.hero.engineSound)}
              </button>
            </div>
            <h2 key={`${cp}-${lang}`} className="mt-2 font-display text-[clamp(28px,4vw,40px)] uppercase leading-none text-offwhite">
              {t(current.name)}
            </h2>
            <p className="mt-2 min-h-[3.2em] text-[14px] leading-relaxed text-offwhite/80">{t(current.text)}</p>
            <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-offwhite/15">
              <div ref={bar} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-gradient-to-r from-meadow to-sunset" />
            </div>
            <div className="relative mt-1 h-3" aria-hidden="true">
              {CHECKPOINTS.map((c, i) => (
                <span
                  key={i}
                  className={cx('absolute top-0 h-2 w-2 -translate-x-1/2 rounded-full border-2 transition-colors', i <= cp ? 'border-sunset bg-sunset' : 'border-offwhite/40 bg-night')}
                  style={{ left: `${c.u * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-6 text-[13px] text-offwhite/70">
              <span className="flex items-center gap-1.5">
                <Icon name="clock" size={15} /> <span ref={timeEl} className="tabular-nums text-offwhite">0 {t(T.hero.hour)} 00 {t(T.hero.min)}</span> {t(T.hero.hudTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="mountain" size={15} /> <span ref={altEl} className="tabular-nums text-offwhite">{CHECKPOINTS[0].alt}</span> {t(T.route.m)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
