import type { APIRoute } from 'astro';
import { getPublishedArticles, type Article } from '../../lib/articles';
import { ogImage } from '../../lib/og';

export async function getStaticPaths() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ params: { slug: article.id }, props: { article } }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await ogImage(props.article as Article)), {
    headers: { 'Content-Type': 'image/jpeg' },
  });
