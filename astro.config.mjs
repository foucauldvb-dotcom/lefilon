// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { parse } from 'yaml';
import nettoyage from './integrations/nettoyage.mjs';

const SITE_URL = 'https://lefilon.media';
const RUBRIQUES = ['pepites', 'ovni', 'betes-de-scene', 'chiffre-fou', 'bon-filon', 'le-saviez-vous'];

// Lecture directe des frontmatters : la config est chargée avant la collection de contenu.
function publishedArticles() {
  const dir = new URL('./src/content/articles/', import.meta.url);
  const now = Date.now();
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((file) => ({
      slug: file.replace(/\.md$/, ''),
      ...parse(readFileSync(new URL(file, dir), 'utf8').split(/^---$/m)[1] ?? ''),
    }))
    .filter((article) => article.draft !== true && new Date(article.date).getTime() <= now);
}

const articles = publishedArticles();

// Rubriques sans article publié : leurs pages sont en noindex, on les retire donc du sitemap.
const used = new Set(articles.map((article) => article.rubrique));
const excluded = new Set(RUBRIQUES.filter((slug) => !used.has(slug)).map((slug) => `${SITE_URL}/${slug}/`));

// Date de dernière modification de chaque article, pour le sitemap
const lastmod = new Map(
  articles.map((article) => [
    `${SITE_URL}/${article.rubrique}/${article.slug}/`,
    new Date(article.updatedDate ?? article.date).toISOString(),
  ]),
);

/** @param {number} weight */
const soraVariant = (weight) => ({
  weight,
  style: /** @type {const} */ ('normal'),
  src: /** @type {[string]} */ ([`./node_modules/@fontsource/sora/files/sora-latin-${weight}-normal.woff2`]),
});

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Le CSS est léger : on l'intègre au HTML pour éviter une requête bloquante
    inlineStylesheets: 'always',
  },
  image: {
    // Images responsives (srcset) par défaut, y compris celles insérées dans le Markdown
    layout: 'constrained',
  },
  // Sora (sous-ensemble latin) servie en local. Astro génère une police de repli aux mêmes métriques,
  // ce qui évite que le texte bouge quand Sora arrive (CLS).
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Sora',
      cssVariable: '--font-sora',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [soraVariant(400), soraVariant(600), soraVariant(800)],
      },
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !excluded.has(page) && !page.includes('/404'),
      serialize: (item) => ({ ...item, lastmod: lastmod.get(item.url) }),
    }),
    nettoyage(),
  ],
});
