import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { RUBRIQUE_SLUGS } from './config/rubriques';
import { SITE } from './config/site';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1).max(160, 'La description ne doit pas dépasser 160 caractères'),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      rubrique: z.enum(RUBRIQUE_SLUGS),
      // La largeur minimale (1200 px) est contrôlée au build dans la page article
      image: image(),
      imageAlt: z.string().min(1),
      imageCredit: z.string().min(1).optional(),
      sources: z
        .array(z.object({ name: z.string().min(1), url: z.url() }))
        .min(1, 'Au moins une source est obligatoire'),
      author: z.string().default(SITE.defaultAuthor),
      draft: z.boolean().default(false),
    }),
});

export const collections = { articles };
