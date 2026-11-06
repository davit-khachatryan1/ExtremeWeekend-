import { useState } from 'react';
import { SEASON, SITE, T } from '../config/content';
import { fill, useLang } from '../lib/i18n';
import { Icon } from '../components/Icon';
import { Reveal, SectionHead, cx, useInView } from '../components/motion';

function FlipCard({ i }: { i: number }) {
  const { t } = useLang();
  const r = T.quest.riddles[i];
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="flip h-[300px] outline-none"
      data-flipped={flipped}
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      aria-label={`${t(r.topic)}: ${t(r.q)}`}
      onClick={() => setFlipped(!flipped)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped(!flipped);
        }
      }}
      data-cursor="hover"
    >
      <div className="flip-inner relative h-full w-full">
        <div className="flip-face absolute inset-0 flex flex-col rounded-[26px] border border-offwhite/15 bg-gradient-to-br from-night-2 to-forest p-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-offwhite/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.15em] text-sunset">{t(r.topic)}</span>
            <span className="font-display text-4xl text-offwhite/15">?</span>
          </div>
          <p className="mt-5 text-[16px] font-medium leading-relaxed text-offwhite">{t(r.q)}</p>
          <span className="mt-auto inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-offwhite/50">
            <Icon name="sparkles" size={14} /> {t(T.quest.answer)} →
          </span>
        </div>
        <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center rounded-[26px] bg-sunset p-6 text-center text-forest">
          <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-forest/60">{t(T.quest.answer)}</span>
          <p className="mt-3 font-display text-[clamp(26px,3vw,36px)] uppercase leading-tight">{t(r.a)}</p>
        </div>
      </div>
    </div>
  );
}

function League() {
  const { t, lang } = useLang();
  const [ref, inView] = useInView<HTMLDivElement>();
  const months = T.season.monthsShort[lang].slice(SEASON.startMonth - 1, SEASON.endMonth);
  return (
    <div ref={ref} className="rounded-[26px] border border-offwhite/12 bg-offwhite/[0.04] p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl uppercase text-offwhite">{t(T.quest.rules[4].title)}</h3>
        <Icon name="trophy" size={26} className="text-sunset" />
      </div>
      <div className="relative mt-8 h-2 rounded-full bg-offwhite/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-meadow to-sunset transition-[width] duration-[2200ms] ease-[cubic-bezier(.65,0,.35,1)]"
          style={{ width: inView ? '100%' : '0%' }}
        />
        <span className="absolute -right-1 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-sunset text-forest shadow-[0_0_30px_rgba(232,119,46,.6)]">
          <Icon name="trophy" size={16} />
        </span>
      </div>
      <div className="mt-3 flex justify-between text-[12px] uppercase tracking-wider text-offwhite/50">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-offwhite/70">
        {t(T.quest.final)} · {t(SEASON.finalMonth)}
      </p>
    </div>
  );
}

function Table() {
  const { t } = useLang();
  const max = Math.max(...T.quest.teamsExample.map((x) => x.pts));
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="rounded-[26px] border border-offwhite/12 bg-offwhite/[0.04] p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl uppercase text-offwhite">{t(T.quest.tableTitle)}</h3>
        <span className="rounded-full border border-offwhite/20 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.18em] text-offwhite/50">{t(T.quest.tableExample)}</span>
      </div>
      <ol className="mt-5 space-y-3">
        {T.quest.teamsExample.map((tm, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="w-5 font-display text-xl text-offwhite/40">{i + 1}</span>
            <span className="text-2xl" aria-hidden="true">
              {tm.flag}
            </span>
            <div className="flex-1">
              <div className="flex justify-between text-[15px] text-offwhite">
                <span>{t(tm.name)}</span>
                <span className="tabular-nums text-offwhite/70">
                  {tm.pts} {t(T.quest.pts)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-offwhite/10">
                <div
                  className={cx('h-full rounded-full transition-[width] duration-[1400ms] ease-out', i === 0 ? 'bg-sunset' : 'bg-meadow')}
                  style={{ width: inView ? `${(tm.pts / max) * 100}%` : '0%', transitionDelay: `${i * 150}ms` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Quest() {
  const { t } = useLang();
  const vars = { discount: SITE.questDiscountPercent, final: t(SEASON.finalMonth) };
  return (
    <section id="quest" className="relative z-10 overflow-hidden bg-night px-5 py-24 md:px-10 md:py-32">
      {/* starry background */}
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
        {Array.from({ length: 50 }, (_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-offwhite"
            style={{
              left: `${(i * 61.7) % 100}%`,
              top: `${(i * 29.3) % 100}%`,
              width: i % 6 === 0 ? 3 : 1.5,
              height: i % 6 === 0 ? 3 : 1.5,
              animation: `twinkle ${2.5 + (i % 5) * 0.5}s ease-in-out ${(i % 7) * 0.3}s infinite`,
            }}
          />
        ))}
      </div>
      <span
        className="pointer-events-none absolute -right-10 top-10 select-none font-display text-[clamp(160px,28vw,420px)] uppercase leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(244,241,234,.08)]"
        aria-hidden="true"
      >
        Quest
      </span>
      <div className="relative mx-auto max-w-[1400px]">
        <SectionHead eyebrow={t(T.quest.eyebrow)} title={t(T.quest.title)} lead={t(T.quest.lead)} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {T.quest.rules.map((r, i) => (
            <Reveal key={i} delay={i * 90}>
              <article className="group h-full rounded-[26px] border border-offwhite/12 bg-offwhite/[0.04] p-6 transition-colors hover:border-sunset/40 hover:bg-offwhite/[0.07]">
                <span className="anim-wiggle flex h-12 w-12 items-center justify-center rounded-2xl bg-sunset text-forest" style={{ animation: `float-y ${3 + i * 0.4}s ease-in-out infinite` }}>
                  <Icon name={r.icon} size={24} />
                </span>
                <h3 className="mt-6 font-display text-[22px] uppercase leading-tight text-offwhite">{t(r.title)}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-offwhite/70">{fill(t(r.text), vars)}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Table />
          </Reveal>
          <Reveal delay={120}>
            <League />
          </Reveal>
        </div>

        <div className="mt-20 flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-display text-[clamp(32px,4.5vw,56px)] uppercase leading-none text-offwhite">{t(T.quest.cardsTitle)}</h3>
          <p className="text-[14px] text-offwhite/60">{t(T.quest.flipHint)}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {T.quest.riddles.map((_, i) => (
            <Reveal key={i} delay={i * 90}>
              <FlipCard i={i} />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-10 flex items-start gap-3 rounded-2xl bg-meadow/15 p-5 text-[15px] leading-relaxed text-offwhite/85 ring-1 ring-meadow/30">
            <Icon name="baby" size={22} className="mt-0.5 shrink-0 text-meadow-2" />
            {t(T.quest.kidsNote)}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
