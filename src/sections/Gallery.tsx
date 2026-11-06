/* Horizontal-scroll gallery (pinned while you scroll) + real-reviews-only section. */
import { useEffect, useRef } from 'react';
import { GALLERY, REVIEWS, T } from '../config/content';
import { telegramUrl, useLang } from '../lib/i18n';
import { ScrollTrigger, gsap } from '../lib/smooth';
import { prefersReducedMotion } from '../lib/device';
import { Icon } from '../components/Icon';
import { Media } from '../components/Media';
import { Cta, Reveal, SectionHead } from '../components/motion';

export function Gallery() {
  const { t } = useLang();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = prefersReducedMotion();

  useEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr || reduce) return;
    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth + 40);
      gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    }, el);
    const r = () => ScrollTrigger.refresh();
    window.addEventListener('load', r);
    return () => {
      window.removeEventListener('load', r);
      ctx.revert();
    };
  }, [reduce]);

  return (
    <section ref={section} aria-labelledby="gallery-title" className="relative z-10 overflow-hidden bg-night py-14 md:py-20 [@media(max-height:560px)]:py-6">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead eyebrow={t(T.gallery.eyebrow)} title={t(T.gallery.title)} />
        <span id="gallery-title" className="sr-only">
          {t(T.gallery.title)}
        </span>
      </div>
      <div className={reduce ? 'overflow-x-auto' : ''}>
        <div ref={track} className="mt-8 flex w-max gap-4 px-5 will-change-transform md:mt-10 md:gap-6 md:px-10 [@media(max-height:560px)]:mt-4">
          {GALLERY.map((g, i) => (
            <figure
              key={i}
              className={`group relative shrink-0 overflow-hidden rounded-[28px] ${
                // heights follow the screen height so the pinned gallery always fits
                i % 3 === 0
                  ? 'h-[clamp(190px,55svh,600px)] w-[78vw] md:w-[46vw]'
                  : i % 3 === 1
                    ? 'h-[clamp(160px,45svh,520px)] w-[64vw] self-end md:w-[30vw]'
                    : 'h-[clamp(175px,50svh,560px)] w-[70vw] md:w-[36vw]'
              }`}
            >
              <div className="h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]">
                <Media image={g.image} video={g.video} tone={g.tone} alt={t(g.caption)} label={!g.image && !g.video ? t(T.gallery.soon) : undefined} />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
                <span className="font-display text-[clamp(22px,2.4vw,32px)] uppercase leading-none text-offwhite">{t(g.caption)}</span>
                <span className="font-display text-lg text-offwhite/50">{String(i + 1).padStart(2, '0')}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Reviews() {
  const { t } = useLang();
  return (
    <section aria-labelledby="reviews-title" className="relative z-10 bg-forest px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={t(T.reviews.eyebrow)} title={t(T.reviews.title)} />
          <Cta variant="ghost" href={telegramUrl()} target="_blank">
            <Icon name="telegram" size={18} /> {t(T.reviews.leave)}
          </Cta>
        </div>
        <span id="reviews-title" className="sr-only">
          {t(T.reviews.title)}
        </span>
        {REVIEWS.length > 0 ? (
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <Reveal key={i} delay={i * 90} as="figure" className="rounded-[26px] bg-forest-2 p-7">
                <Icon name="star" size={20} className="text-sunset" />
                <blockquote className="mt-4 text-[16px] leading-relaxed text-offwhite/85">“{t(r.text)}”</blockquote>
                <figcaption className="mt-5 text-[14px] text-offwhite/60">
                  {r.name} · {t(r.city)} · {r.date}
                </figcaption>
              </Reveal>
            ))}
          </div>
        ) : (
          <>
            <Reveal>
              <p className="mt-10 max-w-2xl text-lg leading-relaxed text-offwhite/75">{t(T.reviews.empty)}</p>
            </Reveal>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Reveal key={i} delay={i * 100} className="flex h-48 flex-col justify-between rounded-[26px] border-2 border-dashed border-offwhite/15 p-6">
                  <div className="flex gap-1 text-offwhite/20" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Icon key={s} name="star" size={18} />
                    ))}
                  </div>
                  <p className="text-[15px] text-offwhite/45">{t(T.reviews.slot)}</p>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
