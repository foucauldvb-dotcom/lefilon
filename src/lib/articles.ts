import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { RubriqueSlug } from '../config/rubriques';
import { typo } from './typo';

type Entry = CollectionEntry<'articles'>;

// Une fois chargé, un article a toujours une image : sa photo ou sa couverture générée.
export type Article = Entry & { data: Entry['data'] & { image: ImageMetadata; imageAlt: string } };

// Couvertures typographiques créées par scripts/generate-covers.mjs
const covers = import.meta.glob<{ default: ImageMetadata }>('../assets/covers/*.jpg', { eager: true });

function withCover(entry: Entry): Article {
  const { image, imageAlt, coverText, coverSub } = entry.data;
  const data = {
    ...entry.data,
    title: typo(entry.data.title),
    description: typo(entry.data.description),
    sources: entry.data.sources.map((source) => ({ ...source, name: typo(source.name) })),
  };
  if (image && imageAlt) return { ...entry, data: { ...data, image, imageAlt: typo(imageAlt) } };

  const cover = covers[`../assets/covers/${entry.id}.jpg`]?.default;
  if (!cover) {
    throw new Error(`Article "${entry.id}" : couverture introuvable, relancez \`npm run covers\`.`);
  }
  const text = [coverText, coverSub].filter(Boolean).join(', ');
  return { ...entry, data: { ...data, image: cover, imageAlt: typo(`Visuel Le Filon : « ${text} »`) } };
}

// Google Discover exige une image principale d'au moins 1200 px de large
const MIN_IMAGE_WIDTH = 1200;

// Les brouillons sont contrôlés aussi : mieux vaut le savoir avant la publication.
function checkImageWidth({ id, data }: Entry) {
  if (data.image && data.image.width < MIN_IMAGE_WIDTH) {
    throw new Error(
      `Article "${id}" : l'image principale fait ${data.image.width} px de large, il en faut au moins ${MIN_IMAGE_WIDTH}.`,
    );
  }
}

// Les brouillons et les articles datés dans le futur sont exclus partout : pages, flux RSS, sitemap.
export async function getPublishedArticles(): Promise<Article[]> {
  const now = Date.now();
  const entries = await getCollection('articles');
  entries.forEach(checkImageWidth);
  const articles = entries.filter(({ data }) => !data.draft && data.date.getTime() <= now);
  return articles.map(withCover).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getArticlesByRubrique(rubrique: RubriqueSlug): Promise<Article[]> {
  const articles = await getPublishedArticles();
  return articles.filter((article) => article.data.rubrique === rubrique);
}

export const articleUrl = (article: Article) => `/${article.data.rubrique}/${article.id}/`;

// Articles de la même rubrique d'abord, complétés par les plus récents des autres rubriques.
export function getRelatedArticles(current: Article, all: Article[], limit = 3): Article[] {
  const others = all.filter((article) => article.id !== current.id);
  const sameRubrique = others.filter((article) => article.data.rubrique === current.data.rubrique);
  const rest = others.filter((article) => article.data.rubrique !== current.data.rubrique);
  return [...sameRubrique, ...rest].slice(0, limit);
}

export function paginate<T>(items: T[], pageSize: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) pages.push(items.slice(i, i + pageSize));
  return pages.length > 0 ? pages : [[]];
}

const WORDS_PER_MINUTE = 220;

export function readingTime(markdown = ''): number {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Paris',
});

export const formatDate = (date: Date) => dateFormatter.format(date);
