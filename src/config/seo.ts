/* SEO helpers — used at BUILD time by vite.config.ts (to write localized
 * /index.html, /en/index.html, /ru/index.html) and at runtime when the
 * language is switched. Pure functions, no browser APIs. */
import { LANGS, PACKAGES, SITE, T, type Lang } from './content';

export const KEYWORDS = [
  'Weekend Extreme', 'off-road tour Armenia', 'jeep tour Tavush Lori', 'Koti', 'Lori',
  'camping Armenia', 'team building Armenia', 'ջիպ տուր', 'էքստրիմ տուր', 'շաբաթ-կիրակի տուր', 'ճամբար',
  'джип тур Армения', 'off-road Армения',
].join(', ');

export function langPath(lang: Lang) {
  return lang === 'hy' ? '/' : `/${lang}/`;
}

const ogLocale: Record<Lang, string> = { hy: 'hy_AM', en: 'en_US', ru: 'ru_RU' };

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** schema.org TouristTrip with offers in AMD */
export function structuredData(lang: Lang) {
  const url = SITE.siteUrl.replace(/\/$/, '') + langPath(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: T.meta.title[lang],
    description: T.meta.description[lang],
    url,
    image: SITE.siteUrl.replace(/\/$/, '') + '/og-image.png',
    touristType: ['Adventure', 'Families', 'Corporate groups'],
    inLanguage: LANGS.map((l) => l.code),
    itinerary: {
      '@type': 'ItemList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, item: { '@type': 'Place', name: 'Koti village, Tavush, Armenia' } },
        { '@type': 'ListItem', position: 2, item: { '@type': 'Place', name: 'Alpine camp, Lori, Armenia', hasMap: SITE.campMapUrl } },
      ],
    },
    provider: {
      '@type': 'TravelAgency',
      name: SITE.brand,
      url: SITE.siteUrl,
      telephone: SITE.contacts.phoneHref,
      email: SITE.contacts.email,
      areaServed: ['Armenia', 'Georgia'],
    },
    offers: PACKAGES.filter((p) => p.price != null).map((p) => ({
      '@type': 'Offer',
      name: p.name[lang],
      price: p.price,
      priceCurrency: 'AMD',
      availability: 'https://schema.org/InStock',
      url: url + '#packages',
    })),
  };
}

/** Everything that differs per language inside <head>. */
export function renderSeoHead(lang: Lang) {
  const base = SITE.siteUrl.replace(/\/$/, '');
  const url = base + langPath(lang);
  const title = esc(T.meta.title[lang]);
  const desc = esc(T.meta.description[lang]);
  const alternates = LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l.code}" href="${base}${langPath(l.code)}" />`,
  ).join('\n    ');
  return `<title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta name="keywords" content="${esc(KEYWORDS)}" />
    <link rel="canonical" href="${url}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${base}/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE.brand}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${base}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="${ogLocale[lang]}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${base}/og-image.png" />
    <script type="application/ld+json">${JSON.stringify(structuredData(lang))}</script>`;
}
