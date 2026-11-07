import { ADDONS, PACKAGES, SITE, T, type AddonId } from '../config/content';
import { fill, useLang } from '../lib/i18n';
import { price } from '../lib/format';
import { computeTotal, useBooking } from '../lib/booking';
import { scrollToTarget } from '../lib/smooth';
import { Icon } from '../components/Icon';
import { Cta, Reveal, SectionHead, cx } from '../components/motion';
import { Money } from '../components/Money';

const PKG_ICON: Record<string, string> = { '2day': 'jeep', owncar: 'car', selfdrive: 'gps', '3day': 'tent', corporate: 'building', tbilisi: 'flag' };
const ADDON_ICON: Record<AddonId, string> = { tent: 'tent', horse: 'horse', drone: 'drone' };

function Stepper({ value, onChange, min = 0, max = 50, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center rounded-full border border-forest/15 bg-white" role="group" aria-label={label}>
      <button type="button" aria-label="−" onClick={() => onChange(Math.max(min, value - 1))} className="flex h-10 w-10 items-center justify-center rounded-full text-forest hover:bg-forest/5 disabled:opacity-30" disabled={value <= min}>
        <Icon name="minus" size={16} />
      </button>
      <output className="w-8 text-center font-display text-xl tabular-nums text-forest" aria-live="polite">
        {value}
      </output>
      <button type="button" aria-label="+" onClick={() => onChange(Math.min(max, value + 1))} className="flex h-10 w-10 items-center justify-center rounded-full text-forest hover:bg-forest/5 disabled:opacity-30" disabled={value >= max}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

function Calculator() {
  const { t, lang } = useLang();
  const b = useBooking();
  const { total, deposit, base, addons } = computeTotal(b);
  return (
    <Reveal className="mt-16 overflow-hidden rounded-[32px] bg-white shadow-[0_40px_80px_-50px_rgba(15,42,29,.5)] lg:grid lg:grid-cols-[1.3fr_1fr]">
      <div className="p-6 md:p-10">
        <h3 className="flex items-center gap-3 font-display text-[clamp(30px,3.5vw,44px)] uppercase leading-none text-forest">
          <Icon name="card" size={30} className="text-sunset" /> {t(T.packages.calcTitle)}
        </h3>
        <fieldset className="mt-8">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.18em] text-forest/60">{t(T.packages.calcPackage)}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {PACKAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={b.packageId === p.id}
                onClick={() => b.set({ packageId: p.id })}
                className={cx(
                  'rounded-full border px-4 py-2 text-[14px] font-medium transition-colors',
                  b.packageId === p.id ? 'border-forest bg-forest text-offwhite' : 'border-forest/15 text-forest hover:border-forest/40',
                )}
              >
                {t(p.name)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-forest/10 pt-7">
          <span className="text-[15px] font-semibold text-forest">{t(T.packages.calcPeople)}</span>
          <Stepper value={b.people} min={1} onChange={(v) => b.set({ people: v })} label={t(T.packages.calcPeople)} />
        </div>
        <fieldset className="mt-7 border-t border-forest/10 pt-7">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.18em] text-forest/60">{t(T.packages.calcAddons)}</legend>
          <ul className="mt-3 space-y-3">
            {ADDONS.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-3 text-[15px] text-forest">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-forest">
                    <Icon name={ADDON_ICON[a.id]} size={20} />
                  </span>
                  <span>
                    {t(a.name)}
                    <span className="block text-[13px] text-forest/55">
                      {price(a.price, lang)} {t(T.packages.unit[a.unit])}
                    </span>
                  </span>
                </span>
                {a.unit === 'group' ? (
                  <input
                    type="checkbox"
                    className="h-6 w-6 accent-sunset"
                    checked={!!b.addons[a.id]}
                    onChange={(e) => b.setAddon(a.id, e.target.checked ? 1 : 0)}
                    aria-label={t(a.name)}
                  />
                ) : (
                  <Stepper value={b.addons[a.id]} onChange={(v) => b.setAddon(a.id, v)} label={t(a.name)} />
                )}
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
      <div className="flex flex-col bg-forest p-6 text-offwhite md:p-10">
        <dl className="space-y-3 text-[15px]">
          <div className="flex justify-between gap-4 text-offwhite/70">
            <dt>
              {t(PACKAGES.find((p) => p.id === b.packageId)!.name)} × {b.people}
            </dt>
            <dd className="tabular-nums">{base != null ? price(base, lang) : '—'}</dd>
          </div>
          <div className="flex justify-between gap-4 text-offwhite/70">
            <dt>{t(T.packages.addonsTitle)}</dt>
            <dd className="tabular-nums">{price(addons, lang)}</dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-offwhite/15 pt-6">
          <p className="text-[13px] uppercase tracking-[0.18em] text-offwhite/60">{t(T.packages.total)}</p>
          {total != null ? (
            <p className="font-display text-[clamp(40px,4.6vw,60px)] leading-none tabular-nums" aria-live="polite">
              <Money value={total} lang={lang} />
            </p>
          ) : (
            <p className="mt-2 text-[15px] leading-relaxed text-offwhite/80">{t(T.packages.calcOnRequest)}</p>
          )}
        </div>
        {deposit != null && total != null && (
          <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <div className="wrap-safe min-w-0 rounded-2xl bg-sunset p-4 text-forest">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] opacity-75">{fill(t(T.packages.deposit), { p: SITE.booking.depositPercent })}</p>
              <p className="mt-1 font-display text-[26px] leading-tight tabular-nums">
                <Money value={deposit} lang={lang} />
              </p>
            </div>
            <div className="wrap-safe min-w-0 rounded-2xl bg-offwhite/10 p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-offwhite/60">{t(T.packages.rest)}</p>
              <p className="mt-1 font-display text-[26px] leading-tight tabular-nums">
                <Money value={total - deposit} lang={lang} />
              </p>
            </div>
          </div>
        )}
        <div className="mt-auto pt-8">
          <Cta className="w-full" onClick={() => scrollToTarget('#booking')}>
            {t(T.packages.bookThis)} <Icon name="arrow" size={18} />
          </Cta>
        </div>
      </div>
    </Reveal>
  );
}

export function Packages() {
  const { t, lang } = useLang();
  const b = useBooking();
  return (
    <section id="prices" className="topo-dark relative z-10 -mt-10 rounded-t-[40px] bg-offwhite px-5 py-24 text-forest md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead eyebrow={t(T.packages.eyebrow)} title={t(T.packages.title)} tone="dark" />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 100}>
              <article
                className={cx(
                  'group relative flex h-full flex-col rounded-[30px] p-7 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5',
                  p.popular
                    ? 'bg-forest text-offwhite shadow-[0_30px_60px_-30px_rgba(15,42,29,.8)] ring-2 ring-sunset'
                    : 'bg-white text-forest shadow-[0_20px_50px_-35px_rgba(15,42,29,.5)]',
                  b.packageId === p.id && !p.popular && 'ring-2 ring-forest',
                )}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-7 rounded-full bg-sunset px-3.5 py-1 text-[12px] font-bold uppercase tracking-[0.14em] text-forest">
                    ★ {t(T.packages.popular)}
                  </span>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-[28px] uppercase leading-[1.02]">{t(p.name)}</h3>
                    <p className={cx('mt-1 text-[14px]', p.popular ? 'text-offwhite/65' : 'text-forest/60')}>{t(p.forWhom)}</p>
                  </div>
                  <span className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', p.popular ? 'bg-sunset text-forest' : 'bg-sand text-forest')}>
                    <Icon name={PKG_ICON[p.id]} size={24} />
                  </span>
                </div>
                <div className="mt-6">
                  {p.price != null ? (
                    <p className="font-display text-[44px] leading-none tabular-nums">
                      {price(p.price, lang)}
                      <span className={cx('mt-1.5 block font-sans text-[14px] font-normal', p.popular ? 'text-offwhite/60' : 'text-forest/55')}>{t(T.packages.perPerson)}</span>
                    </p>
                  ) : (
                    <p className="font-display text-[30px] uppercase leading-none">{t(T.packages.onRequest)}</p>
                  )}
                </div>
                <ul className="mt-6 space-y-2.5">
                  {p.includes.map((inc, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-[15px] leading-snug">
                      <Icon name="check" size={18} strokeWidth={2.4} className={cx('mt-0.5 shrink-0', p.popular ? 'text-sunset' : 'text-meadow')} />
                      {t(inc)}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <Cta
                    variant={p.popular ? 'primary' : 'dark'}
                    className="w-full"
                    onClick={() => {
                      b.set({ packageId: p.id });
                      scrollToTarget('#calculator', -16);
                    }}
                  >
                    {t(T.packages.choose)}
                  </Cta>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-wrap items-center gap-3 rounded-[24px] bg-sand p-5">
          <span className="mr-2 font-display text-xl uppercase">{t(T.packages.addonsTitle)}:</span>
          {ADDONS.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px]">
              <Icon name={ADDON_ICON[a.id]} size={16} className="text-sunset" />
              {t(a.name)} · <b className="tabular-nums">{price(a.price, lang)}</b> {t(T.packages.unit[a.unit])}
            </span>
          ))}
        </Reveal>

        <div id="calculator">
          <Calculator />
        </div>
      </div>
    </section>
  );
}
