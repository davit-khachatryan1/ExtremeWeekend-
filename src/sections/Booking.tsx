/* BOOKING — request form. Sends JSON to SITE.booking.endpoint (the included
 * /api/booking function forwards it to Telegram). If no endpoint is set or it
 * fails, the booking text is copied and the visitor is sent to Telegram. */
import { useMemo, useState, type FormEvent } from 'react';
import { ADDONS, LANGS, PACKAGES, SITE, T, type Lang } from '../config/content';
import { fill, phoneUrl, telegramUrl, useLang } from '../lib/i18n';
import { price } from '../lib/format';
import { computeTotal, upcomingDepartures, useBooking } from '../lib/booking';
import { Icon } from '../components/Icon';
import { Cta, Reveal, SectionHead, cx } from '../components/motion';

const field =
  'w-full rounded-2xl border border-forest/15 bg-white px-4 py-3.5 text-[16px] text-forest placeholder:text-forest/35 outline-none transition-[border,box-shadow] focus:border-sunset focus:ring-4 focus:ring-sunset/20';
const labelCls = 'mb-1.5 block text-[13px] font-semibold uppercase tracking-[0.14em] text-forest/65';

export function Booking() {
  const { t, lang } = useLang();
  const b = useBooking();
  const deps = useMemo(() => upcomingDepartures(12), []);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guideLang, setGuideLang] = useState<Lang>(lang);
  const [customDate, setCustomDate] = useState('');
  const [comment, setComment] = useState('');
  const [hp, setHp] = useState(''); // honeypot
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'fallback'>('idle');
  const { pkg, total, deposit } = computeTotal(b);
  const months = T.season.months[lang];

  const dateLabel = (iso: string) => {
    if (iso === 'custom') return `${t(T.booking.customDate)}${customDate ? `: ${customDate}` : ''}`;
    const d = deps.find((x) => x.date === iso)?.day ?? new Date(iso);
    const s = new Date(d);
    s.setDate(s.getDate() + 1);
    return s.getMonth() === d.getMonth()
      ? `${d.getDate()}–${s.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      : `${d.getDate()} ${months[d.getMonth()]} – ${s.getDate()} ${months[s.getMonth()]} ${d.getFullYear()}`;
  };

  const message = () => {
    const ad = ADDONS.filter((a) => b.addons[a.id]).map((a) => `${a.name.en} ×${b.addons[a.id]}`);
    return [
      `🏔 Weekend Extreme — booking request`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Package: ${pkg.name.en}`,
      `People: ${b.people}`,
      `Date: ${b.date === 'custom' ? `custom ${customDate}` : b.date}`,
      `Add-ons: ${ad.length ? ad.join(', ') : '—'}`,
      `Guide language: ${guideLang.toUpperCase()}`,
      `Total: ${total != null ? price(total, 'en') : 'on request'}${deposit != null ? ` · deposit ${price(deposit, 'en')}` : ''}`,
      comment ? `Comment: ${comment}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (hp) return;
    const errs: Record<string, boolean> = {
      name: !name.trim(),
      phone: phone.replace(/\D/g, '').length < 8,
      date: !b.date || (b.date === 'custom' && !customDate),
    };
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setState('sending');
    const payload = {
      name,
      phone,
      people: b.people,
      package: pkg.id,
      packageName: pkg.name.en,
      date: b.date === 'custom' ? `custom:${customDate}` : b.date,
      addons: b.addons,
      guideLanguage: guideLang,
      comment,
      total,
      deposit,
      siteLanguage: lang,
      text: message(),
    };
    try {
      if (!SITE.booking.endpoint) throw new Error('no endpoint');
      const res = await fetch(SITE.booking.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('ok');
    } catch {
      try {
        await navigator.clipboard.writeText(message());
      } catch {
        /* clipboard blocked */
      }
      setState('fallback');
    }
  };

  const rules = T.booking.rules.map((r) => fill(t(r), { deposit: SITE.booking.depositPercent, days: SITE.booking.freeCancellationDays }));

  return (
    <section id="booking" className="relative z-10 bg-sand px-5 py-24 text-forest md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead eyebrow={t(T.booking.eyebrow)} title={t(T.booking.title)} lead={t(T.booking.lead)} tone="dark" />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="rounded-[32px] bg-offwhite p-6 shadow-[0_30px_70px_-50px_rgba(15,42,29,.6)] md:p-10">
            {state === 'ok' || state === 'fallback' ? (
              <div className="flex min-h-[420px] flex-col items-start justify-center" role="status">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-meadow text-offwhite">
                  <Icon name={state === 'ok' ? 'check' : 'telegram'} size={30} strokeWidth={2.4} />
                </span>
                <h3 className="mt-6 font-display text-[clamp(34px,4vw,52px)] uppercase leading-none">
                  {state === 'ok' ? t(T.booking.successTitle) : t(T.booking.fallbackTitle)}
                </h3>
                <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-forest/75">
                  {state === 'ok'
                    ? fill(t(T.booking.successText), { name, deposit: deposit != null ? price(deposit, lang) : t(T.packages.onRequest) })
                    : t(T.booking.fallbackText)}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {state === 'ok' && SITE.booking.paymentUrl && (
                    <Cta href={SITE.booking.paymentUrl} target="_blank">
                      <Icon name="card" size={18} /> {t(T.booking.payNow)}
                    </Cta>
                  )}
                  <Cta variant={state === 'fallback' ? 'primary' : 'dark'} href={telegramUrl()} target="_blank">
                    <Icon name="telegram" size={18} /> {t(T.booking.telegram)}
                  </Cta>
                  <Cta variant="dark" href={phoneUrl()}>
                    <Icon name="phone" size={18} /> {t(T.booking.call)}
                  </Cta>
                </div>
                <button type="button" className="mt-6 text-[14px] font-semibold text-forest/60 underline" onClick={() => setState('idle')}>
                  {t(T.booking.newRequest)}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="bk-name" className={labelCls}>
                    {t(T.booking.name)} *
                  </label>
                  <input id="bk-name" className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={errors.name || undefined} required />
                  {errors.name && <p className="mt-1 text-[13px] text-[#b03a1a]">{t(T.booking.required)}</p>}
                </div>
                <div>
                  <label htmlFor="bk-phone" className={labelCls}>
                    {t(T.booking.phone)} *
                  </label>
                  <input
                    id="bk-phone"
                    className={field}
                    type="tel"
                    inputMode="tel"
                    placeholder="+374 …"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    aria-invalid={errors.phone || undefined}
                    required
                  />
                  {errors.phone && <p className="mt-1 text-[13px] text-[#b03a1a]">{t(T.booking.phoneInvalid)}</p>}
                </div>
                <div>
                  <label htmlFor="bk-people" className={labelCls}>
                    {t(T.booking.people)}
                  </label>
                  <input
                    id="bk-people"
                    className={field}
                    type="number"
                    min={1}
                    max={60}
                    value={b.people}
                    onChange={(e) => b.set({ people: Math.max(1, Math.min(60, Number(e.target.value) || 1)) })}
                  />
                </div>
                <div>
                  <label htmlFor="bk-package" className={labelCls}>
                    {t(T.booking.package)}
                  </label>
                  <select id="bk-package" className={field} value={b.packageId} onChange={(e) => b.set({ packageId: e.target.value as typeof b.packageId })}>
                    {PACKAGES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {t(p.name)} — {p.price != null ? price(p.price, lang) : t(T.packages.onRequest)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={b.date === 'custom' ? '' : 'sm:col-span-2'}>
                  <label htmlFor="bk-date" className={labelCls}>
                    {t(T.booking.date)} *
                  </label>
                  <select
                    id="bk-date"
                    className={field}
                    value={b.date}
                    onChange={(e) => b.set({ date: e.target.value })}
                    aria-invalid={errors.date || undefined}
                    required
                  >
                    <option value="">—</option>
                    {deps.map((d) => (
                      <option key={d.date} value={d.date} disabled={d.seatsLeft <= 0}>
                        {dateLabel(d.date)} · {d.seatsLeft > 0 ? `${d.seatsLeft} ${t(T.season.seatsLeft)}` : t(T.season.full)}
                      </option>
                    ))}
                    <option value="custom">{t(T.booking.customDate)}</option>
                  </select>
                  {errors.date && <p className="mt-1 text-[13px] text-[#b03a1a]">{t(T.booking.required)}</p>}
                </div>
                {b.date === 'custom' && (
                  <div>
                    <label htmlFor="bk-custom" className={labelCls}>
                      {t(T.booking.customDateLabel)} *
                    </label>
                    <input id="bk-custom" type="date" className={field} value={customDate} onChange={(e) => setCustomDate(e.target.value)} aria-invalid={(errors.date && !customDate) || undefined} />
                  </div>
                )}
                <fieldset className="sm:col-span-2">
                  <legend className={labelCls}>{t(T.booking.addons)}</legend>
                  <div className="flex flex-wrap gap-2">
                    {ADDONS.map((a) => {
                      const on = !!b.addons[a.id];
                      return (
                        <label
                          key={a.id}
                          className={cx(
                            'inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] transition-colors',
                            on ? 'border-forest bg-forest text-offwhite' : 'border-forest/15 bg-white hover:border-forest/40',
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={on}
                            onChange={() => b.setAddon(a.id, on ? 0 : a.unit === 'group' ? 1 : b.people)}
                          />
                          <Icon name={on ? 'check' : 'plus'} size={15} />
                          {t(a.name)} · {price(a.price, lang)} {t(T.packages.unit[a.unit])}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <fieldset className="sm:col-span-2">
                  <legend className={labelCls}>{t(T.booking.language)}</legend>
                  <div className="flex flex-wrap gap-2">
                    {LANGS.map((l) => (
                      <label
                        key={l.code}
                        className={cx(
                          'inline-flex cursor-pointer items-center rounded-full border px-4 py-2.5 text-[14px] transition-colors',
                          guideLang === l.code ? 'border-forest bg-forest text-offwhite' : 'border-forest/15 bg-white hover:border-forest/40',
                        )}
                      >
                        <input type="radio" name="guide-lang" className="sr-only" checked={guideLang === l.code} onChange={() => setGuideLang(l.code)} />
                        {l.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="sm:col-span-2">
                  <label htmlFor="bk-comment" className={labelCls}>
                    {t(T.booking.comment)}
                  </label>
                  <textarea id="bk-comment" rows={3} className={field} placeholder={t(T.booking.commentPh)} value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
                {/* spam trap — hidden from people */}
                <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" name="website" />
                <div className="sm:col-span-2">
                  <ul className="mb-5 flex flex-wrap gap-2 text-[13px]">
                    {rules.map((r, i) => (
                      <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-forest/80">
                        <Icon name={['card', 'calendar', 'rain'][i]} size={14} className="text-sunset" /> {r}
                      </li>
                    ))}
                  </ul>
                  <Cta type="submit" className="w-full sm:w-auto" disabled={state === 'sending'}>
                    {state === 'sending' ? t(T.booking.sending) : t(T.booking.submit)} <Icon name="arrow" size={18} />
                  </Cta>
                </div>
              </form>
            )}
          </Reveal>

          {/* summary */}
          <Reveal delay={120} className="flex flex-col gap-4">
            <div className="rounded-[32px] bg-forest p-6 text-offwhite md:p-8">
              <p className="text-[13px] uppercase tracking-[0.18em] text-offwhite/60">{t(T.booking.summary)}</p>
              <p className="mt-2 font-display text-3xl uppercase leading-tight">{t(pkg.name)}</p>
              <dl className="mt-5 space-y-2.5 text-[15px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-offwhite/60">{t(T.booking.people)}</dt>
                  <dd>{b.people}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-offwhite/60">{t(T.booking.date)}</dt>
                  <dd className="text-right">{b.date ? dateLabel(b.date) : '—'}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-offwhite/15 pt-3">
                  <dt className="text-offwhite/60">{t(T.packages.total)}</dt>
                  <dd className="font-display text-2xl tabular-nums">{total != null ? price(total, lang) : t(T.packages.onRequest)}</dd>
                </div>
                {deposit != null && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-offwhite/60">{fill(t(T.packages.deposit), { p: SITE.booking.depositPercent })}</dt>
                    <dd className="font-display text-2xl tabular-nums text-sunset">{price(deposit, lang)}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="rounded-[32px] bg-offwhite p-6 md:p-8">
              <h3 className="flex items-center gap-2 font-display text-2xl uppercase">
                <Icon name="card" size={22} className="text-sunset" /> {t(T.booking.payTitle)}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-forest/70">{t(SITE.booking.paymentMethods)}</p>
              {SITE.booking.paymentUrl ? (
                <Cta className="mt-4" href={SITE.booking.paymentUrl} target="_blank">
                  {t(T.booking.payNow)}
                </Cta>
              ) : (
                <p className="mt-3 text-[14px] text-forest/60">{t(T.booking.payLater)}</p>
              )}
            </div>
            <div className="rounded-[32px] bg-offwhite p-6 md:p-8">
              <p className="text-[13px] uppercase tracking-[0.18em] text-forest/55">{t(T.booking.or)}</p>
              <div className="mt-4 grid gap-2.5">
                <Cta variant="dark" href={telegramUrl()} target="_blank" className="justify-start">
                  <Icon name="telegram" size={18} /> {t(T.booking.telegram)}
                </Cta>
                <Cta variant="dark" href={phoneUrl()} className="justify-start">
                  <Icon name="phone" size={18} /> {t(T.booking.call)} · {SITE.contacts.phoneDisplay}
                </Cta>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
