export const RUBRIQUE_SLUGS = [
  'pepites',
  'ovni',
  'betes-de-scene',
  'chiffre-fou',
  'bon-filon',
  'le-saviez-vous',
] as const;

export type RubriqueSlug = (typeof RUBRIQUE_SLUGS)[number];

export interface Rubrique {
  slug: RubriqueSlug;
  name: string;
  description: string;
  // Texte d'introduction (2-3 phrases) affiché en haut de la page rubrique
  intro?: string;
}

export const RUBRIQUES: Rubrique[] = [
  { slug: 'pepites', name: 'Pépites', description: 'Les bonnes nouvelles qui redonnent le sourire' },
  { slug: 'ovni', name: 'OVNI', description: "L'insolite qui laisse bouche bée" },
  { slug: 'betes-de-scene', name: 'Bêtes de scène', description: 'Les animaux qui font fondre' },
  { slug: 'chiffre-fou', name: 'Le Chiffre Fou', description: "Les chiffres qu'on ne croit qu'en les vérifiant" },
  { slug: 'bon-filon', name: 'Bon Filon', description: 'Argent et vie pratique' },
  { slug: 'le-saviez-vous', name: 'Le Saviez-vous ?', description: 'Anecdotes et culture générale' },
];

export const getRubrique = (slug: RubriqueSlug) => RUBRIQUES.find((rubrique) => rubrique.slug === slug)!;

export const rubriqueUrl = (slug: RubriqueSlug) => `/${slug}/`;
