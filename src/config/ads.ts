export type AdPosition = 'sous-titre' | 'milieu' | 'fin';

// Tant que `enabled` est à false, <AdSlot /> ne rend rien et aucun script n'est chargé.
// Pour activer : passer `enabled` à true et renseigner `scriptSrc` (script de la régie).
export const ADS = {
  enabled: false,
  scriptSrc: '',
  // Hauteurs réservées (px) pour éviter les décalages de mise en page
  slots: {
    'sous-titre': { mobile: 100, desktop: 90 },
    milieu: { mobile: 280, desktop: 250 },
    fin: { mobile: 280, desktop: 250 },
  } satisfies Record<AdPosition, { mobile: number; desktop: number }>,
};
