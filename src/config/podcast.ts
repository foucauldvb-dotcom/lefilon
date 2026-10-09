// Le podcast du Filon, hébergé chez Soundcast. Le lecteur affiche toujours le dernier épisode.
export const PODCAST = {
  show: 'le-filon-47a0e032-2c64-4a57-884b-297d1786b0ab',
  playerOrigin: 'https://player.soundcast.io',
} as const;

export type PodcastLayout = 'horizontal' | 'vertical';

// Dimensions fournies par Soundcast pour chaque format
export const PODCAST_SIZES: Record<PodcastLayout, { width: number; height: number }> = {
  horizontal: { width: 544, height: 176 },
  vertical: { width: 265, height: 490 },
};

// Lecteur animé, thème clair, à la couleur or du Filon
export const podcastPlayerUrl = (layout: PodcastLayout) =>
  `${PODCAST.playerOrigin}/?color=F5B800&playlist=false&vertical=${layout === 'vertical'}&theme=light&show=${PODCAST.show}&animate=true`;
