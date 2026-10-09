// Le podcast du Filon, hébergé chez Soundcast.
// Pour mettre un nouvel épisode en avant : changer `episode` (identifiant Soundcast) et `title`.
export const PODCAST = {
  show: 'le-filon',
  episode: 'le-filon-le-podcast-episode-1',
  title: 'Épisode 1',
  duration: '4 min',
  playerOrigin: 'https://player.soundcast.io',
} as const;

// Lecteur compact animé, thème clair, à la couleur or du Filon
export const podcastPlayerUrl = () =>
  `${PODCAST.playerOrigin}/?color=F5B800&mode=compact&light=true&episode=${PODCAST.episode}&show=${PODCAST.show}&animate=true`;
