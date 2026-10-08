// Génère le favicon, les icônes PWA, le logo et l'image de partage par défaut
// à partir des fichiers de assets-source/. Usage : npm run icons
import { writeFile } from 'node:fs/promises';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const PROFILE = 'assets-source/lefilon-photo-profil-1080.png';
const LOGO_NOIR = 'assets-source/lefilon-logo-noir.png';
const OR = '#F5B800';

const square = (size) => sharp(PROFILE).resize(size, size).png().toBuffer();

await writeFile('public/favicon.ico', await pngToIco([await square(16), await square(32), await square(48)]));
await writeFile('public/apple-touch-icon.png', await square(180));
await writeFile('public/icon-192.png', await square(192));
await writeFile('public/icon-512.png', await square(512));
// La photo de profil a déjà une large marge autour du logo : elle convient au format maskable.
await writeFile('public/icon-maskable-512.png', await square(512));

// Logo pour les données structurées (Organization, NewsArticle)
await sharp(LOGO_NOIR).resize(600).flatten({ background: '#FFFFFF' }).png().toFile('public/logo.png');

// Image de partage par défaut : logo centré sur fond or, 1200 × 630
const logo = await sharp(LOGO_NOIR).resize(720).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: OR } })
  .composite([{ input: logo, gravity: 'centre' }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile('public/og-default.jpg');

console.log('Icônes générées dans public/');
