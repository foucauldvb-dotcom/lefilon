// Supprime de dist/_astro les images qu'aucune page ne référence : originaux des brouillons,
// variantes intermédiaires. Le site envoyé par FTP ne contient ainsi que l'utile.
import { readdir, readFile, rm, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const TEXT = /\.(html|xml|css|js|json|webmanifest)$/;
const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/;

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => join(entry.parentPath, entry.name));
}

export default function nettoyage() {
  return {
    name: 'lefilon-nettoyage',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const all = await files(dist);
        let text = '';
        for (const file of all.filter((name) => TEXT.test(name))) text += await readFile(file, 'utf8');

        let count = 0;
        let bytes = 0;
        for (const file of all.filter((name) => IMAGE.test(name) && name.includes('/_astro/'))) {
          const url = `/${relative(dist, file).split('\\').join('/')}`;
          if (text.includes(url)) continue;
          bytes += (await stat(file)).size;
          await rm(file);
          count += 1;
        }
        logger.info(`${count} images inutilisées supprimées (${(bytes / 1e6).toFixed(1)} Mo)`);
      },
    },
  };
}
