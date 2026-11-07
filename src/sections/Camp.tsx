/* CAMP — transparent section over the 3D scene. Scrolling through it turns
 * the sky from day to a starry night with a glowing campfire. */
import { useEffect, useRef } from 'react';
import { ADDONS, T } from '../config/content';
import { useLang } from '../lib/i18n';
import { price } from '../lib/format';
import { ScrollTrigger } from '../lib/smooth';
import { scrollState, setSectionOnScreen } from '../lib/scrollState';
import { Icon } from '../components/Icon';
import { Reveal, SplitReveal } from '../components/motion';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Reveal className={`rounded-[28px] border border-offwhite/15 bg-night/55 p-6 shadow-2xl backdrop-blur-md md:p-8 ${className}`}>{children}</Reveal>
  );
}

export function CampSection() {
  const { t, lang } = useLang();
  const section = useRef<HTMLElement>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const fillBar = useRef<HTMLSpanElement>(null);
  const tent = ADDONS.find((a) => a.id === 'tent')!;

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (s) => {
        // map to the part of the section that is actually on screen
        const p = Math.min(1, Math.max(0, (s.progress - 0.12) / 0.76));
        scrollState.camp = p;
        if (knob.current) knob.current.style.left = `${p * 100}%`;
        if (fillBar.current) fillBar.current.style.transform = `scaleX(${p})`;
      },
      onToggle: (s) => setSectionOnScreen('camp', s.isActive),
      onRefresh: (s) => setSectionOnScreen('camp', s.isActive),
    });
    return () => st.kill();
  }, []);

  return (
    <section id="camp" ref={section} className="relative z-10 min-h-[320vh] px-5 md:px-10">
      {/* edges blend into neighbouring sections */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-night to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-night to-transparent" aria-hidden="true" />

      {/* sticky day → night indicator */}
      <div className="sticky top-20 z-20 mx-auto flex max-w-[1400px] justify-end pt-6 md:top-24">
        <div className="flex w-[230px] items-center gap-3 rounded-full border border-offwhite/15 bg-night/60 px-4 py-2.5 text-offwhite backdrop-blur-md" aria-hidden="true">
          <Icon name="sun" size={16} className="text-sunset" />
          <span className="relative h-1 flex-1 rounded-full bg-offwhite/20">
            <span ref={fillBar} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-gradient-to-r from-sunset via-[#b5607a] to-[#6b7bd6]" />
            <span ref={knob} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-offwhite shadow" style={{ left: 0 }} />
          </span>
          <Icon name="moon" size={16} className="text-[#b9c4ff]" />
        </div>
      </div>

      <div className="relative mx-auto max-w-[1400px] pb-[40vh] pt-[14vh]">
        <div className="max-w-xl">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.22em] text-sunset">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              {t(T.camp.eyebrow)}
            </p>
          </Reveal>
          <SplitReveal
            text={t(T.camp.title)}
            className="font-display text-[clamp(44px,7.5vw,104px)] uppercase leading-[0.9] text-offwhite drop-shadow-[0_4px_24px_rgba(0,0,0,.5)]"
          />
          <Reveal delay={150}>
            <p className="mt-5 text-lg leading-relaxed text-offwhite drop-shadow-[0_2px_10px_rgba(0,0,0,.7)]">{t(T.camp.lead)}</p>
          </Reveal>
        </div>

        <div className="mt-[34vh] grid max-w-xl gap-[16vh]">
          <Card>
            <h3 className="font-display text-3xl uppercase text-offwhite">{t(T.camp.facilitiesTitle)}</h3>
            <ul className="mt-5 grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
              {T.camp.facilities.map((f, i) => (
                <li key={i} className="wrap-safe flex min-w-0 items-center gap-3 rounded-2xl bg-offwhite/[0.06] p-3.5 text-[15px] leading-snug text-offwhite">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sunset/90 text-forest">
                    <Icon name={f.icon} size={20} />
                  </span>
                  {t(f.label)}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="md:ml-[18%]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-3xl uppercase text-offwhite">{t(T.camp.sleepTitle)}</h3>
              <Icon name="tent" size={30} className="text-sunset" />
            </div>
            <p className="mt-3 leading-relaxed text-offwhite/80">{t(T.camp.sleepText)}</p>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-sunset px-5 py-4 text-forest">
              <span className="font-semibold">{t(T.camp.rentLabel)}</span>
              <span className="font-display text-2xl">{price(tent.price, lang)}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-3xl uppercase text-offwhite">{t(T.camp.foodTitle)}</h3>
              <Icon name="food" size={30} className="text-sunset" />
            </div>
            <p className="mt-3 leading-relaxed text-offwhite/80">{t(T.camp.foodText)}</p>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-offwhite/15 p-4">
              <Icon name="noAlcohol" size={26} className="shrink-0 text-sunset" />
              <div>
                <p className="font-semibold text-offwhite">{t(T.camp.alcohol)}</p>
                <p className="text-[14px] text-offwhite/65">{t(T.camp.alcoholText)}</p>
              </div>
            </div>
          </Card>

          <Card className="md:ml-[18%]">
            <h3 className="font-display text-3xl uppercase text-offwhite">{t(T.camp.eveningTitle)}</h3>
            <ol className="mt-5 grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
              {T.camp.evening.map((e, i) => (
                <li key={i} className="wrap-safe flex min-w-0 items-center gap-3 rounded-2xl bg-offwhite/[0.06] p-3.5 text-[15px] leading-snug text-offwhite">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-offwhite/10">
                    <Icon name={['food', 'fire', 'star', 'trophy'][i]} size={21} className={i === 1 ? 'anim-flicker text-sunset' : 'text-sunset'} />
                  </span>
                  {t(e)}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </section>
  );
}
