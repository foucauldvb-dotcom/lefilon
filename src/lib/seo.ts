import { getRubrique } from '../config/rubriques';
import { SITE, SOCIALS, absoluteUrl } from '../config/site';
import { articleUrl, type Article } from './articles';

export type JsonLd = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

const logo = {
  '@type': 'ImageObject',
  url: absoluteUrl(SITE.logoPath),
  width: 600,
  height: 162,
};

export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': ORGANIZATION_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    description: SITE.description,
    email: SITE.email,
    logo,
    sameAs: SOCIALS.map((social) => social.url),
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function newsArticleSchema(article: Article, images: string[]): JsonLd {
  const { data } = article;
  const url = absoluteUrl(articleUrl(article));
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: data.title,
    description: data.description,
    image: images,
    datePublished: data.date.toISOString(),
    dateModified: (data.updatedDate ?? data.date).toISOString(),
    articleSection: getRubrique(data.rubrique).name,
    inLanguage: SITE.lang,
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      name: data.author,
      url: absoluteUrl(SITE.authorPath),
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      '@id': ORGANIZATION_ID,
      name: SITE.name,
      url: `${SITE.url}/`,
      logo,
    },
    // Première source de l'article
    isBasedOn: data.sources[0].url,
  };
}
