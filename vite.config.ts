import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { renderSeoHead, langPath } from './src/config/seo.ts';
import { LANGS, SITE } from './src/config/content.ts';

const SEO_START = '<!--seo:start-->';
const SEO_END = '<!--seo:end-->';

function replaceSeo(html: string, lang: 'hy' | 'en' | 'ru') {
  const start = html.indexOf(SEO_START);
  const end = html.indexOf(SEO_END);
  if (start === -1 || end === -1) return html;
  return (
    html.slice(0, start + SEO_START.length) +
    '\n    ' +
    renderSeoHead(lang) +
    '\n    ' +
    html.slice(end)
  ).replace(/<html lang="[a-z]+"/, `<html lang="${lang}"`);
}

/**
 * Writes localized meta tags into index.html and, on build, creates
 * /en/index.html + /ru/index.html (so each language has its own SEO head),
 * plus sitemap.xml and robots.txt using SITE.siteUrl.
 */
function seoPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'weekend-extreme-seo',
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return replaceSeo(html, 'hy');
      },
    },
    closeBundle() {
      const indexFile = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexFile)) return;
      const html = fs.readFileSync(indexFile, 'utf8');
      for (const { code } of LANGS) {
        if (code === 'hy') continue;
        const dir = path.join(outDir, code);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), replaceSeo(html, code));
      }
      const base = SITE.siteUrl.replace(/\/$/, '');
      const today = new Date().toISOString().slice(0, 10);
      const urls = LANGS.map(
        ({ code }) =>
          `  <url><loc>${base}${langPath(code)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`,
      ).join('\n');
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
      fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoPlugin()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
});
