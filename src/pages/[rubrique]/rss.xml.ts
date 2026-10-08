import type { APIRoute } from 'astro';
import { RUBRIQUES, type Rubrique } from '../../config/rubriques';
import { SITE } from '../../config/site';
import { getArticlesByRubrique } from '../../lib/articles';
import { buildFeed } from '../../lib/rss';

export function getStaticPaths() {
  return RUBRIQUES.map((rubrique) => ({ params: { rubrique: rubrique.slug }, props: { rubrique } }));
}

export const GET: APIRoute = async ({ props }) => {
  const rubrique = props.rubrique as Rubrique;
  return buildFeed({
    title: `${SITE.name} : ${rubrique.name}`,
    description: rubrique.description,
    articles: await getArticlesByRubrique(rubrique.slug),
  });
};
