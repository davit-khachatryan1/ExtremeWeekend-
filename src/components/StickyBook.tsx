/* Always-visible "Book now" bar on mobile (hidden while the booking form is on screen). */
import { useEffect, useState } from 'react';
import { T } from '../config/content';
import { phoneUrl, telegramUrl, useLang } from '../lib/i18n';
import { minPrice, price } from '../lib/format';
import { scrollToTarget } from '../lib/smooth';
import { Icon } from './Icon';
import { cx } from './motion';

export function StickyBook({ ready }: { ready: boolean }) {
  const { t, lang } = useLang();
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const el = document.getElementById('booking');
    if (!el) return;
    const io = new IntersectionObserver((e) => setHide(e[0].isIntersecting), { rootMargin: '0px 0px -30% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className={cx(
        'fixed inset-x-3 bottom-3 z-30 flex items-center gap-2 rounded-full border border-offwhite/15 bg-forest/90 p-1.5 pl-4 shadow-2xl backdrop-blur-md transition-[transform,opacity] duration-500 md:hidden',
        ready && !hide ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0',
      )}
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span className="mr-auto min-w-0 text-[13px] leading-tight text-offwhite/80">
        {t(T.hero.from)} <b className="text-offwhite">{price(minPrice(), lang)}</b>
      </span>
      <a href={telegramUrl()} target="_blank" rel="noopener noreferrer" aria-label={t(T.booking.telegram)} className="flex h-11 w-11 items-center justify-center rounded-full bg-offwhite/10 text-offwhite">
        <Icon name="telegram" size={20} />
      </a>
      <a href={phoneUrl()} aria-label={t(T.booking.call)} className="flex h-11 w-11 items-center justify-center rounded-full bg-offwhite/10 text-offwhite">
        <Icon name="phone" size={19} />
      </a>
      <button
        type="button"
        onClick={() => scrollToTarget('#booking')}
        className="h-11 whitespace-nowrap rounded-full bg-sunset px-4 text-[15px] font-semibold text-forest"
      >
        {t(T.booking.stickyBook)}
      </button>
    </div>
  );
}
