// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://lefilon.media';
const RUBRIQUES = ['pepites', 'ovni', 'betes-de-scene', 'chiffre-fou', 'bon-filon', 'le-saviez-vous'];

// Rubriques sans article publié : leurs pages sont en noindex, on les retire donc du sitemap.
function emptyRubriques() {
  const dir = new URL('./src/content/articles/', import.meta.url);
  const used = new Set();
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.md'))) {
    const frontmatter = readFileSync(new URL(file, dir), 'utf8').split('---')[1] ?? '';
    if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;
    const rubrique = frontmatter.match(/^rubrique:\s*["']?([a-z-]+)["']?\s*$/m)?.[1];
    if (rubrique) used.add(rubrique);
  }
  return RUBRIQUES.filter((slug) => !used.has(slug));
}

const excluded = new Set(emptyRubriques().map((slug) => `${SITE_URL}/${slug}/`));

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
    }),
  ],
});
