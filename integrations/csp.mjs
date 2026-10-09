// Calcule l'empreinte (sha256) des scripts intégrés aux pages et l'inscrit dans la
// Content-Security-Policy de dist/.htaccess, à la place du marqueur __SCRIPT_HASHES__.
// Un script modifié est ainsi autorisé automatiquement au build suivant.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MARKER = '__SCRIPT_HASHES__';
// Les blocs de données (JSON-LD) ne sont pas exécutés : la CSP ne les concerne pas.
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")[^>]*>([\s\S]*?)<\/script>/g;

export default function csp() {
  return {
    name: 'lefilon-csp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const hashes = new Set();
        for (const entry of await readdir(dist, { withFileTypes: true, recursive: true })) {
          if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
          const html = await readFile(join(entry.parentPath, entry.name), 'utf8');
          for (const [, code] of html.matchAll(INLINE_SCRIPT)) {
            hashes.add(`'sha256-${createHash('sha256').update(code).digest('base64')}'`);
          }
        }

        const file = join(dist, '.htaccess');
        const htaccess = await readFile(file, 'utf8');
        if (!htaccess.includes(MARKER)) throw new Error(`.htaccess : marqueur ${MARKER} introuvable`);
        await writeFile(file, htaccess.replace(MARKER, [...hashes].sort().join(' ')));
        logger.info(`CSP : ${hashes.size} script(s) intégré(s) autorisé(s) par empreinte`);
      },
    },
  };
}
