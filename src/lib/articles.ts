import { getCollection, type CollectionEntry } from 'astro:content';
import type { RubriqueSlug } from '../config/rubriques';

export type Article = CollectionEntry<'articles'>;

// Les brouillons sont exclus partout : pages, flux RSS, sitemap.
export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
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
