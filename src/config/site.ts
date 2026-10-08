export type SocialId = 'instagram' | 'tiktok' | 'facebook';

export interface Social {
  id: SocialId;
  name: string;
  handle: string;
  url: string;
}

export const SITE = {
  name: 'Le Filon',
  url: 'https://lefilon.media',
  tagline: 'On creuse Internet pour vous et on ne garde que les pépites.',
  description:
    "Le Filon, le média positif : bonnes nouvelles, insolite, animaux, chiffres fous et bons plans argent. On creuse Internet pour vous et on ne garde que les pépites.",
  lang: 'fr',
  locale: 'fr_FR',
  email: 'contact@lefilon.media',
  defaultAuthor: 'La rédaction',
  authorPath: '/auteur/la-redaction/',
  // Fichiers générés dans public/ par `npm run icons`
  defaultOgImage: '/og-default.jpg',
  logoPath: '/logo.png',
  articlesPerPage: 12,
} as const;

// Pour ajouter un réseau : une ligne ici, il apparaît dans le header, le footer et le JSON-LD.
export const SOCIALS: Social[] = [
  { id: 'instagram', name: 'Instagram', handle: '@lefilon.media', url: 'https://www.instagram.com/lefilon.media/' },
  // { id: 'tiktok', name: 'TikTok', handle: '@lefilon.media', url: 'https://www.tiktok.com/@lefilon.media' },
  // { id: 'facebook', name: 'Facebook', handle: 'Le Filon', url: 'https://www.facebook.com/lefilon.media' },
];

export const INSTAGRAM = SOCIALS.find((social) => social.id === 'instagram')!;

export const absoluteUrl = (path: string) => new URL(path, SITE.url).href;
