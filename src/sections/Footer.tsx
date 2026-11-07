import { SITE, SOUND_CREDITS, T } from '../config/content';
import { phoneUrl, telegramUrl, useLang } from '../lib/i18n';
import { Icon } from '../components/Icon';
import { Logo, NAV } from '../components/Header';
import { scrollToTarget } from '../lib/smooth';

export function Footer() {
  const { t } = useLang();
  const c = SITE.contacts;
  const socials = [
    { name: 'Telegram', icon: 'telegram', href: telegramUrl() },
    { name: 'Instagram', icon: 'instagram', href: c.instagram ? `https://instagram.com/${c.instagram.replace(/^@/, '')}` : '' },
    { name: 'Facebook', icon: 'facebook', href: c.facebook },
    { name: 'TikTok', icon: 'tiktok', href: c.tiktok },
  ];
  return (
    <footer className="relative z-10 overflow-hidden bg-night px-5 pb-28 pt-20 text-offwhite md:px-10 md:pb-12">
      <div className="mx-auto max-w-[1400px]">
        {/* decorative watermark (an image, not text) */}
        <svg viewBox="0 0 1000 118" className="block w-full text-offwhite/[0.06]" aria-hidden="true" focusable="false">
          <text x="0" y="104" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="currentColor" className="font-display uppercase" style={{ fontSize: 132 }}>
            Weekend Extreme
          </text>
        </svg>
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-offwhite/65">{t(T.footer.about)}</p>
          </div>
          <div>
            <h3 className="font-display text-xl uppercase text-sunset">{t(T.footer.contacts)}</h3>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              <li>
                <a href={phoneUrl()} className="inline-flex items-center gap-2 hover:text-sunset">
                  <Icon name="phone" size={16} /> {c.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 hover:text-sunset">
                  <Icon name="mail" size={16} /> {c.email}
                </a>
              </li>
              <li>
                <a href={SITE.campMapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-sunset">
                  <Icon name="pin" size={16} /> {t(T.footer.campMap)}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-xl uppercase text-sunset">{t(T.footer.follow)}</h3>
            <ul className="mt-4 space-y-2.5 text-[15px]">
              {socials.map((s) => (
                <li key={s.name}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-sunset">
                      <Icon name={s.icon} size={16} /> {s.name}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-offwhite/65">
                      <Icon name={s.icon} size={16} /> {s.name} · {t(T.footer.soon)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-xl uppercase text-sunset">{t(T.footer.partners)}</h3>
            <ul className="mt-4 space-y-2.5 text-[15px] text-offwhite/75">
              {T.footer.partnersList.map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Icon name={i === T.footer.partnersList.length - 1 ? 'users' : 'building'} size={16} className="text-offwhite/40" /> {t(p)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {SOUND_CREDITS.length > 0 && (
          <p className="mt-12 text-[12px] leading-relaxed text-offwhite/60">♪ {SOUND_CREDITS.join(' · ')}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-offwhite/10 pt-6 text-[13px] text-offwhite/65">
          <span>
            © {new Date().getFullYear()} {SITE.brand}. {t(T.footer.rights)}.
          </span>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-4">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToTarget(`#${n.id}`);
                    }}
                    className="hover:text-offwhite"
                  >
                    {t(T.nav[n.key])}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
