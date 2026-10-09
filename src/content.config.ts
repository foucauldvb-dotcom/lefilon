import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { RUBRIQUE_SLUGS } from './config/rubriques';
import { SITE } from './config/site';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1).max(160, 'La description ne doit pas dépasser 160 caractères'),
        date: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        rubrique: z.enum(RUBRIQUE_SLUGS),
        // La largeur minimale (1200 px) est contrôlée au build dans la page article
        image: image().optional(),
        imageAlt: z.string().min(1).optional(),
        imageCredit: z.string().min(1).optional(),
        // Article sans photo : une couverture typographique est générée à partir de ce texte
        coverText: z.string().min(1).max(40).optional(),
        coverSub: z.string().min(1).max(60).optional(),
        coverTheme: z.enum(['noir', 'or']).default('noir'),
        sources: z
          .array(z.object({ name: z.string().min(1), url: z.url() }))
          .min(1, 'Au moins une source est obligatoire'),
        author: z.string().default(SITE.defaultAuthor),
        draft: z.boolean().default(false),
      })
      .refine((data) => (data.image ? Boolean(data.imageAlt) : Boolean(data.coverText)), {
        message: 'Il faut soit `image` et `imageAlt`, soit `coverText` (couverture générée)',
      }),
});

export const collections = { articles };
