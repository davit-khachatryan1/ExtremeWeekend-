import { useState } from 'react';
import { ADDONS, PACKAGES, SITE, T } from '../config/content';
import { fill, useLang } from '../lib/i18n';
import { price } from '../lib/format';
import { Icon } from '../components/Icon';
import { Reveal, SectionHead, cx } from '../components/motion';

export function Faq() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<number | null>(0);
  const p = (id: string) => {
    const v = PACKAGES.find((x) => x.id === id)?.price;
    return v != null ? price(v, lang) : '';
  };
  const vars = {
    owncar: p('owncar'),
    selfdrive: p('selfdrive'),
    tent: price(ADDONS.find((a) => a.id === 'tent')!.price, lang),
    deposit: SITE.booking.depositPercent,
    days: SITE.booking.freeCancellationDays,
    methods: t(SITE.booking.paymentMethods),
  };
  return (
    <section id="faq" className="topo-dark relative z-10 bg-offwhite px-5 py-24 text-forest md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead eyebrow={t(T.faq.eyebrow)} title={t(T.faq.title)} tone="dark" />
        </div>
        <ul className="divide-y divide-forest/10 border-y border-forest/10">
          {T.faq.items.map((it, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} as="li" delay={(i % 6) * 50}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left text-[clamp(17px,1.6vw,20px)] font-semibold leading-snug"
                  >
                    {t(it.q)}
                    <span
                      className={cx(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-[transform,background,color] duration-500',
                        isOpen ? 'rotate-45 border-sunset bg-sunset text-forest' : 'border-forest/20 text-forest',
                      )}
                      aria-hidden="true"
                    >
                      <Icon name="plus" size={18} />
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="acc-body" data-open={isOpen}>
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 text-[16px] leading-relaxed text-forest/75">{fill(t(it.a), vars)}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
