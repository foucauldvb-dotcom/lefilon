// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { parse } from 'yaml';

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
  integrations: [
    sitemap({
      filter: (page) => !excluded.has(page) && !page.includes('/404'),
      serialize: (item) => ({ ...item, lastmod: lastmod.get(item.url) }),
    }),
  ],
});
