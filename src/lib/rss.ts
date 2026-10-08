import rss from '@astrojs/rss';
import { getRubrique } from '../config/rubriques';
import { SITE } from '../config/site';
import { articleUrl, type Article } from './articles';

interface FeedOptions {
  title: string;
  description: string;
  articles: Article[];
}

export function buildFeed({ title, description, articles }: FeedOptions) {
  return rss({
    title,
    description,
    site: SITE.url,
    trailingSlash: true,
    customData: `<language>fr-fr</language>`,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.date,
      link: articleUrl(article),
      categories: [getRubrique(article.data.rubrique).name],
      author: `${SITE.email} (${article.data.author})`,
    })),
  });
}
