import { NUMBERS, T } from '../config/content';
import { useLang } from '../lib/i18n';
import { Icon } from '../components/Icon';
import { Counter, Reveal, SectionHead, cx } from '../components/motion';

const WHY_ICONS = ['jeep', 'puzzle', 'tent', 'users'];

export function Why() {
  const { t } = useLang();
  return (
    <section id="why" className="topo relative z-10 bg-forest px-5 pb-24 pt-28 md:px-10 md:pb-32 md:pt-36">
      {/* soft fade from the 3D hero */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-40 bg-gradient-to-b from-transparent to-forest" aria-hidden="true" />
      <div className="mx-auto max-w-[1400px]">
        <SectionHead eyebrow={t(T.why.eyebrow)} title={t(T.why.title)} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {T.why.cards.map((c, i) => (
            <Reveal key={i} delay={i * 110}>
              <article
                className={cx(
                  'wrap-safe group relative h-full overflow-hidden rounded-[28px] border border-offwhite/10 p-7 transition-[transform,background,border-color] duration-500 hover:-translate-y-1.5 hover:border-sunset/50',
                  i === 0 ? 'bg-sunset text-forest' : 'bg-forest-2 text-offwhite',
                )}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={cx(
                      'anim-wiggle flex h-14 w-14 items-center justify-center rounded-2xl',
                      i === 0 ? 'bg-forest text-sunset' : 'bg-offwhite/10 text-sunset',
                    )}
                  >
                    <Icon name={WHY_ICONS[i]} size={28} />
                  </span>
                  <span className={cx('font-display text-5xl leading-none', i === 0 ? 'text-forest/25' : 'text-offwhite/10')}>0{i + 1}</span>
                </div>
                <h3 className="mt-10 font-display text-[28px] uppercase leading-[1.02]">{t(c.title)}</h3>
                <p className={cx('mt-3 text-[15px] leading-relaxed', i === 0 ? 'text-forest/80' : 'text-offwhite/75')}>{t(c.text)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Numbers() {
  const { t } = useLang();
  return (
    <section aria-labelledby="numbers-title" className="topo-dark relative z-10 bg-offwhite px-5 py-20 text-forest md:px-10 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <h2 id="numbers-title" className="sr-only">
          {t(T.numbers.title)}
        </h2>
        <p className="mb-10 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.22em] text-sunset">
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          {t(T.numbers.eyebrow)}
        </p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
          {NUMBERS.map((n, i) => (
            <Reveal key={i} delay={i * 90} className={cx('flex flex-col-reverse justify-end border-l-2 pl-5', i === 1 ? 'border-sunset' : 'border-forest/15')}>
              <dt className="wrap-safe mt-2 text-[15px] leading-snug text-forest/70">{t(n.label)}</dt>
              <dd className="whitespace-nowrap font-display text-[clamp(44px,5.4vw,88px)] leading-none tabular-nums">
                <Counter value={n.value} prefix={n.prefix} suffix={n.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
