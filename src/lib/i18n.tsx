/* Language state: read from the URL (/ = hy, /en/, /ru/), remembered in
 * localStorage, and exposed through useLang(). */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LANG, LANGS, SITE, T, type L, type Lang } from '../config/content';
import { langPath } from '../config/seo';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** pick the current language from a {hy,en,ru} object */
  t: (x: L) => string;
}

const Ctx = createContext<LangCtx | null>(null);

function detectLang(): Lang {
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  if (seg === 'en' || seg === 'ru') return seg;
  if (seg === undefined || seg === '') {
    // The root URL is Armenian; a remembered choice only applies when the visitor
    // previously switched language themselves.
    try {
      const saved = localStorage.getItem('we-lang') as Lang | null;
      if (saved && LANGS.some((l) => l.code === saved) && saved !== 'hy') return saved;
    } catch {
      /* storage blocked */
    }
  }
  return DEFAULT_LANG;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('we-lang', l);
    } catch {
      /* ignore */
    }
    const url = langPath(l) + window.location.search + window.location.hash;
    window.history.replaceState(null, '', url);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = T.meta.title[lang];
    document.querySelector('meta[name="description"]')?.setAttribute('content', T.meta.description[lang]);
    document.body.dataset.lang = lang;
  }, [lang]);

  const value = useMemo<LangCtx>(() => ({ lang, setLang, t: (x: L) => x?.[lang] ?? x?.en ?? '' }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLang outside LangProvider');
  return c;
}

/** Replace {tokens} in a string. */
export function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

export const telegramUrl = () => `https://t.me/${SITE.contacts.telegram}`;
export const phoneUrl = () => `tel:${SITE.contacts.phoneHref}`;
