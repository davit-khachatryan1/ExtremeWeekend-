import { useState } from 'react';
import { T, type L } from '../config/content';
import { useLang } from '../lib/i18n';
import { Icon } from '../components/Icon';
import { Reveal, SectionHead, cx, useInView } from '../components/motion';

type Item = { time: string | L; icon: string; title: L; text: L; hot?: boolean };

function Day({ n, items, delay = 0 }: { n: number; items: Item[]; delay?: number }) {
  const { t } = useLang();
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <Reveal delay={delay} className="relative">
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-display text-[64px] leading-none text-sunset">{String(n).padStart(2, '0')}</span>
        <span className="font-display text-2xl uppercase text-offwhite/70">{t(T.itinerary.day)}</span>
      </div>
      <div ref={ref} className="relative pl-8">
        {/* line that draws itself */}
        <span
          className="absolute left-[11px] top-2 bottom-2 w-[2px] origin-top bg-gradient-to-b from-sunset via-meadow to-offwhite/20 transition-transform duration-[1600ms] ease-[cubic-bezier(.65,0,.35,1)]"
          style={{ transform: `scaleY(${inView ? 1 : 0})` }}
          aria-hidden="true"
        />
        <ol className="space-y-5">
          {items.map((it, i) => (
            <li
              key={i}
              className={cx(
                'relative transition-[opacity,translate] duration-700',
                inView ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
              )}
              style={{ transitionDelay: `${200 + i * 110}ms` }}
            >
              <span
                className={cx(
                  'absolute -left-8 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2',
                  it.hot ? 'border-sunset bg-sunset text-forest' : 'border-offwhite/40 bg-forest text-offwhite/80',
                )}
                aria-hidden="true"
              >
                <Icon name={it.icon} size={12} strokeWidth={2.2} />
              </span>
              <div className={cx('rounded-2xl p-4 transition-colors', it.hot ? 'bg-sunset/12 ring-1 ring-sunset/40' : 'bg-offwhite/[0.04] hover:bg-offwhite/[0.07]')}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sunset tabular-nums">
                  {typeof it.time === 'string' ? it.time : t(it.time)}
                </p>
                <h4 className="mt-1 text-[17px] font-semibold leading-snug text-offwhite">{t(it.title)}</h4>
                <p className="mt-1 text-[14px] leading-relaxed text-offwhite/65">{t(it.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

export function Itinerary() {
  const { t } = useLang();
  const [three, setThree] = useState(false);
  const days: Item[][] = three
    ? [T.itinerary.day1, T.itinerary.dayExtra, T.itinerary.dayLast]
    : [T.itinerary.day1, T.itinerary.dayLast];
  return (
    <section id="program" className="relative z-10 bg-forest-2 px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={t(T.itinerary.eyebrow)} title={t(T.itinerary.title)} />
          <div role="tablist" aria-label={t(T.itinerary.eyebrow)} className="flex rounded-full border border-offwhite/20 p-1">
            {[false, true].map((v) => (
              <button
                key={String(v)}
                role="tab"
                type="button"
                aria-selected={three === v}
                onClick={() => setThree(v)}
                className={cx(
                  'rounded-full px-6 py-2.5 font-display text-lg uppercase transition-colors',
                  three === v ? 'bg-sunset text-forest' : 'text-offwhite/80 hover:text-offwhite',
                )}
              >
                {v ? t(T.itinerary.tab3) : t(T.itinerary.tab2)}
              </button>
            ))}
          </div>
        </div>
        <div key={String(three)} className={cx('mt-14 grid gap-12', three ? 'lg:grid-cols-3' : 'md:grid-cols-2')}>
          {days.map((d, i) => (
            <Day key={i} n={i + 1} items={d} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}
