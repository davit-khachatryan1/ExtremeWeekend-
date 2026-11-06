import { useEffect, useState } from 'react';
import { LANGS, T } from '../config/content';
import { useLang } from '../lib/i18n';
import { setAmbientSound, useSoundOn } from '../lib/audio';
import { scrollToTarget, startScroll, stopScroll } from '../lib/smooth';
import { Icon } from './Icon';
import { Cta, cx } from './motion';

export const NAV = [
  { id: 'route', key: 'route' },
  { id: 'program', key: 'program' },
  { id: 'quest', key: 'quest' },
  { id: 'camp', key: 'camp' },
  { id: 'prices', key: 'prices' },
  { id: 'dates', key: 'dates' },
  { id: 'faq', key: 'faq' },
] as const;

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 64 64" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#E8772E" />
        <path d="M6 50 L24 22 L33 35 L40 26 L58 50 Z" fill="#0F2A1D" />
        <path d="M24 22 L29 30 L26 29 L22 32 Z" fill="#F4F1EA" />
        <circle cx="46" cy="15" r="6" fill="none" stroke="#0F2A1D" strokeWidth="3" />
      </svg>
      <span className="font-display text-[19px] uppercase leading-[0.9] tracking-wide">
        Weekend
        <br />
        <span className="text-sunset">Extreme</span>
      </span>
    </span>
  );
}

function LangSwitch({ compact }: { compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t(T.nav.language)} className="flex rounded-full border border-offwhite/25 bg-night/30 p-0.5 backdrop-blur">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          title={l.label}
          onClick={() => setLang(l.code)}
          className={cx(
            'rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors',
            compact ? 'min-w-9' : 'min-w-10',
            lang === l.code ? 'bg-offwhite text-forest' : 'text-offwhite/80 hover:text-offwhite',
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

export function SoundBars() {
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-sunset"
          style={{ height: '100%', animation: `float-y ${0.6 + i * 0.15}s ease-in-out infinite`, transformOrigin: 'bottom' }}
        />
      ))}
    </span>
  );
}

function SoundToggle() {
  const { t } = useLang();
  const on = useSoundOn();
  return (
    <button
      type="button"
      onClick={() => setAmbientSound(!on)}
      aria-pressed={on}
      aria-label={`${t(T.nav.sound)}: ${on ? t(T.common.soundOn) : t(T.common.soundOff)}`}
      title={t(T.nav.sound)}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-offwhite/25 bg-night/30 backdrop-blur transition-colors hover:bg-offwhite/15"
    >
      {on ? <SoundBars /> : <Icon name="soundOff" size={16} />}
    </button>
  );
}

export function Header() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // while the mobile menu is open: no scrolling behind it, Escape closes it
  useEffect(() => {
    if (!open) return;
    stopScroll();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      startScroll();
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // let the scroll lock release first, then glide to the section
    window.setTimeout(() => scrollToTarget(`#${id}`), 30);
  };

  return (
    <>
      <a
        href="#main"
        className="fixed left-3 top-3 z-[120] -translate-y-20 rounded-full bg-sunset px-4 py-2 text-sm font-semibold text-forest focus:translate-y-0"
      >
        {t(T.common.skip)}
      </a>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background,box-shadow] duration-500',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
          scrolled ? 'bg-forest/80 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)] backdrop-blur-md' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go('top');
            }}
            aria-label="Weekend Extreme"
            data-cursor="hover"
          >
            <Logo />
          </a>
          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(n.id);
                    }}
                    className="rounded-full px-3 py-2 text-[14px] font-medium text-offwhite/85 transition-colors hover:bg-offwhite/10 hover:text-offwhite"
                    data-cursor="hover"
                  >
                    {t(T.nav[n.key])}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LangSwitch />
            </div>
            <SoundToggle />
            <Cta
              className="!px-5 !py-2.5 max-md:!hidden"
              onClick={() => go('booking')}
            >
              {t(T.nav.book)}
            </Cta>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-offwhite/25 bg-night/30 backdrop-blur xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t(T.nav.close) : t(T.nav.menu)}
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? 'x' : 'menu'} size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div
        id="mobile-menu"
        className={cx(
          'fixed inset-0 z-40 flex flex-col bg-forest/97 px-6 pb-10 pt-24 backdrop-blur-xl transition-[opacity,visibility] duration-500 xl:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        aria-hidden={!open}
      >
        <div className="topo absolute inset-0 -z-10 opacity-50" aria-hidden="true" />
        <ul className="flex flex-col gap-1">
          {NAV.map((n, i) => (
            <li
              key={n.id}
              className={cx('transition-[opacity,translate] duration-700', open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : '0ms' }}
            >
              <a
                href={`#${n.id}`}
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  go(n.id);
                }}
                className="block py-2 font-display text-[clamp(34px,9vw,54px)] uppercase leading-tight text-offwhite"
              >
                {t(T.nav[n.key])}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-3">
          <LangSwitch compact />
          <Cta onClick={() => go('booking')}>{t(T.nav.book)}</Cta>
        </div>
      </div>
    </>
  );
}
