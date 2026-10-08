import type { APIRoute } from 'astro';
import { SITE } from '../config/site';
import { getPublishedArticles } from '../lib/articles';
import { buildFeed } from '../lib/rss';

export const GET: APIRoute = async () =>
  buildFeed({
    title: SITE.name,
    description: SITE.description,
    articles: await getPublishedArticles(),
  });
