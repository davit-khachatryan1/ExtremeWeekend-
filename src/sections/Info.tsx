/* Included / not included · What to bring · Season & dates · Families · Safety */
import { useEffect, useRef, useState } from 'react';
import { SEASON, T } from '../config/content';
import { useLang } from '../lib/i18n';
import { upcomingDepartures, useBooking } from '../lib/booking';
import { scrollToTarget } from '../lib/smooth';
import { prefersReducedMotion } from '../lib/device';
import { Icon, JeepIcon } from '../components/Icon';
import { Reveal, SectionHead, cx } from '../components/motion';

/* ------------------------------------------------------------ included */
export function Included() {
  const { t } = useLang();
  return (
    <section aria-labelledby="included-title" className="topo relative z-10 bg-forest px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead eyebrow={t(T.included.eyebrow)} title={t(T.included.title)} />
        <span id="included-title" className="sr-only">
          {t(T.included.title)}
        </span>
        <div className="mt-14 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="rounded-[30px] bg-forest-2 p-7 md:p-9">
            <h3 className="flex items-center gap-3 font-display text-3xl uppercase text-offwhite">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-meadow text-forest">
                <Icon name="check" size={22} strokeWidth={2.6} />
              </span>
              {t(T.included.yesTitle)}
            </h3>
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {T.included.yes.map((x, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-snug text-offwhite/85">
                  <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 shrink-0 text-meadow-2" />
                  {t(x)}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="rounded-[30px] border border-offwhite/12 p-7 md:p-9">
            <h3 className="flex items-center gap-3 font-display text-3xl uppercase text-offwhite">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-offwhite/10 text-offwhite/70">
                <Icon name="x" size={22} strokeWidth={2.4} />
              </span>
              {t(T.included.noTitle)}
            </h3>
            <ul className="mt-6 space-y-3">
              {T.included.no.map((x, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-snug text-offwhite/70">
                  <Icon name="x" size={18} strokeWidth={2.2} className="mt-0.5 shrink-0 text-sunset" />
                  {t(x)}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ what to bring */
export function Bring() {
  const { t } = useLang();
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem('we-packing');
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return T.bring.items.map(() => false);
  });
  useEffect(() => {
    try {
      localStorage.setItem('we-packing', JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked]);
  const done = checked.filter(Boolean).length;
  return (
    <section aria-labelledby="bring-title" className="relative z-10 bg-forest px-5 pb-24 md:px-10 md:pb-32">
      <div className="mx-auto grid max-w-[1400px] gap-10 rounded-[36px] bg-offwhite p-6 text-forest md:p-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHead eyebrow={t(T.bring.eyebrow)} title={t(T.bring.title)} tone="dark" />
          <span id="bring-title" className="sr-only">
            {t(T.bring.title)}
          </span>
          <p className="mt-6 text-forest/70">{t(T.bring.hint)}</p>
          <div className="mt-6 flex items-center gap-4">
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#0F2A1D" strokeOpacity=".1" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#E8772E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="100"
                  strokeDashoffset={100 - (done / checked.length) * 100}
                  style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-xl tabular-nums">
                {done}/{checked.length}
              </span>
            </div>
            <span className="text-[15px] text-forest/70">{t(T.bring.packed)}</span>
          </div>
        </div>
        <ul className="grid content-start gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {T.bring.items.map((it, i) => (
            <li key={i}>
              <label
                className={cx(
                  'flex h-full cursor-pointer items-center gap-3.5 rounded-2xl border p-4 text-[15px] leading-snug transition-colors',
                  checked[i] ? 'border-meadow bg-meadow/10' : 'border-forest/10 bg-white hover:border-forest/30',
                )}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked[i]}
                  onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                />
                <span
                  className={cx(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-sunset',
                    checked[i] ? 'border-meadow bg-meadow' : 'border-forest/25',
                  )}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#F4F1EA" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      pathLength={1}
                      strokeDasharray="1"
                      strokeDashoffset={checked[i] ? 0 : 1}
                      style={{ transition: 'stroke-dashoffset .35s ease-out' }}
                    />
                  </svg>
                </span>
                <Icon name={it.icon} size={20} className="shrink-0 text-forest/50" />
                <span className={cx(checked[i] && 'text-forest/60 line-through decoration-meadow/60')}>{t(it.label)}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ season & dates */
export function Season() {
  const { t, lang } = useLang();
  const b = useBooking();
  const deps = upcomingDepartures();
  const months = T.season.months[lang];
  const wd = T.season.weekdays[lang];
  const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]}`;
  const first = deps[0]?.day;
  const offSeason = first && first.getTime() - Date.now() > 1000 * 60 * 60 * 24 * 30;
  return (
    <section id="dates" className="topo-dark relative z-10 bg-sand px-5 py-24 text-forest md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead eyebrow={t(T.season.eyebrow)} title={t(T.season.title)} lead={t(T.season.lead)} tone="dark" />

        {/* season band */}
        <Reveal className="mt-12">
          <div className="grid grid-cols-12 gap-1" aria-hidden="true">
            {T.season.monthsShort[lang].map((m, i) => {
              const on = i + 1 >= SEASON.startMonth && i + 1 <= SEASON.endMonth;
              return (
                <div key={m} className="text-center">
                  <div className={cx('h-3 rounded-full', on ? 'bg-sunset' : 'bg-forest/10')} />
                  <span className={cx('mt-2 block text-[10px] uppercase tracking-normal sm:text-[11px] sm:tracking-wider', on ? 'font-semibold text-forest' : 'text-forest/40')}>{m}</span>
                </div>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-3xl uppercase">{t(T.season.upcoming)}</h3>
              {offSeason && first && (
                <span className="rounded-full bg-forest px-3 py-1 text-[13px] text-offwhite">
                  {t(T.season.nextSeason)}: {fmt(first)} {first.getFullYear()}
                </span>
              )}
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {deps.map((d, i) => {
                const sun = new Date(d.day);
                sun.setDate(sun.getDate() + 1);
                const full = d.seatsLeft <= 0;
                const few = d.seatsLeft > 0 && d.seatsLeft <= 6;
                const selected = b.date === d.date;
                return (
                  <Reveal key={d.date} delay={(i % 4) * 60} as="li">
                    <button
                      type="button"
                      disabled={full}
                      onClick={() => {
                        b.set({ date: d.date });
                        scrollToTarget('#booking');
                      }}
                      className={cx(
                        'flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-[border-color,transform] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60',
                        selected ? 'border-sunset ring-2 ring-sunset' : 'border-forest/10 hover:border-forest/35',
                      )}
                    >
                      <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-forest py-2 text-offwhite">
                        <span className="text-[11px] uppercase tracking-wider text-offwhite/60">{T.season.monthsShort[lang][d.day.getMonth()]}</span>
                        <span className="font-display text-2xl leading-none">{d.day.getDate()}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold leading-snug">
                          {sun.getMonth() === d.day.getMonth() ? `${d.day.getDate()}–${fmt(sun)}` : `${fmt(d.day)} – ${fmt(sun)}`}
                        </span>
                        <span className="block text-[13px] text-forest/55">
                          {wd[6]}–{wd[0]} · {t(T.season.tourDays)}
                        </span>
                      </span>
                      <span
                        className={cx(
                          'shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold',
                          full ? 'bg-forest/10 text-forest/60' : few ? 'bg-sunset text-forest' : 'bg-meadow/20 text-forest',
                        )}
                      >
                        {full ? t(T.season.full) : `${d.seatsLeft} ${t(T.season.seatsLeft)}`}
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </ul>
          </div>
          <div className="grid content-start gap-4">
            {[
              { icon: 'users', title: T.season.noMin, text: T.season.noMinText, tone: 'bg-forest text-offwhite' },
              { icon: 'rain', title: T.season.weather, text: T.season.weatherText, tone: 'bg-white' },
              { icon: 'calendar', title: T.season.custom, text: T.season.customText, tone: 'bg-white' },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 100} className={cx('rounded-[24px] p-6', c.tone)}>
                <Icon name={c.icon} size={28} className="text-sunset" />
                <h4 className="mt-3 font-display text-2xl uppercase leading-tight">{t(c.title)}</h4>
                <p className={cx('mt-1.5 text-[15px] leading-relaxed', i === 0 ? 'text-offwhite/75' : 'text-forest/70')}>{t(c.text)}</p>
                {i === 2 && (
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-sunset hover:underline"
                    onClick={() => {
                      b.set({ date: 'custom' });
                      scrollToTarget('#booking');
                    }}
                  >
                    {t(T.booking.customDate)} <Icon name="arrow" size={15} />
                  </button>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ families (parallax layers) */
function ParallaxScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-depth]'));
    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; // -1 … 1
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.depth || '0');
        l.style.transform = `translate3d(0, ${p * d * 120}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((e) => {
      cancelAnimationFrame(raf);
      if (e[0].isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-gradient-to-b from-[#f3d6ad] via-[#f0a46b] to-[#e8772e]" aria-hidden="true">
      <div data-depth="0.15" className="absolute inset-x-0 top-[10%] flex justify-end pr-[16%]">
        <span className="h-24 w-24 rounded-full bg-[#fff1d6] opacity-80 shadow-[0_0_80px_30px_rgba(255,241,214,.5)]" />
      </div>
      <svg data-depth="0.25" className="absolute inset-x-0 bottom-[18%] w-full" viewBox="0 0 800 300" preserveAspectRatio="none">
        <path d="M0 300 L0 180 L110 70 L190 150 L300 40 L420 160 L520 90 L640 170 L740 100 L800 140 L800 300Z" fill="#7a5a6e" opacity=".55" />
      </svg>
      <svg data-depth="0.45" className="absolute inset-x-0 bottom-[6%] w-full" viewBox="0 0 800 300" preserveAspectRatio="none">
        <path d="M0 300 L0 200 L140 120 L260 190 L380 110 L520 200 L660 130 L800 190 L800 300Z" fill="#2d5a36" />
      </svg>
      <div data-depth="0.7" className="absolute inset-x-0 -bottom-6">
        <svg className="w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
          <path d="M0 200 L0 90 C 200 40, 380 110, 520 70 S 720 40, 800 60 L800 200Z" fill="#0F2A1D" />
        </svg>
        {/* jeep + family silhouettes */}
        <div className="absolute bottom-[38%] left-[12%] text-[#0F2A1D]">
          <div className="text-forest" style={{ filter: 'drop-shadow(0 0 0 #0F2A1D)' }}>
            <JeepIcon size={130} strokeWidth={1.6} />
          </div>
        </div>
        <svg className="absolute bottom-[40%] right-[16%] h-[34%]" viewBox="0 0 120 100" fill="#0F2A1D">
          <circle cx="22" cy="18" r="8" />
          <path d="M12 30h20l4 34h-8l-2 34h-8l-2-34h-8z" />
          <circle cx="58" cy="14" r="8" />
          <path d="M48 26h20l4 38h-8l-2 34h-8l-2-34h-8z" />
          <circle cx="92" cy="50" r="6" />
          <path d="M84 60h16l3 22h-6l-1 16h-8l-1-16h-6z" />
        </svg>
      </div>
    </div>
  );
}

export function Families() {
  const { t } = useLang();
  return (
    <section aria-labelledby="families-title" className="relative z-10 bg-offwhite px-5 py-24 text-forest md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <ParallaxScene />
        </Reveal>
        <div>
          <SectionHead eyebrow={t(T.families.eyebrow)} title={t(T.families.title)} lead={t(T.families.text)} tone="dark" />
          <span id="families-title" className="sr-only">
            {t(T.families.title)}
          </span>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {T.families.points.map((p, i) => (
              <li key={i} className="inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2.5 text-[15px]">
                <Icon name={['hike', 'puzzle', 'star'][i]} size={17} className="text-sunset" /> {t(p)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ safety */
export function Safety() {
  const { t } = useLang();
  return (
    <section aria-labelledby="safety-title" className="relative z-10 bg-forest-2 px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead eyebrow={t(T.safety.eyebrow)} title={t(T.safety.title)} />
        <span id="safety-title" className="sr-only">
          {t(T.safety.title)}
        </span>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {T.safety.items.map((s, i) => (
            <Reveal key={i} delay={i * 90} className="wrap-safe group rounded-[26px] border border-offwhite/10 bg-forest p-6 transition-colors hover:border-meadow/50">
              <span className="anim-wiggle flex h-12 w-12 items-center justify-center rounded-2xl bg-meadow/20 text-meadow-2">
                <Icon name={s.icon} size={24} />
              </span>
              <h3 className="mt-6 font-display text-[20px] uppercase leading-tight text-offwhite">{t(s.title)}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-offwhite/65">{t(s.text)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
