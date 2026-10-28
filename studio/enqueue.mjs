// Met en file d'attente une semaine VALIDÉE : node enqueue.mjs semaines/<semaine>
// - copie les visuels dans public/ig/<id>/ (en ligne sur lefilon.media/ig/<id>/ après le déploiement)
// - crée studio/queue/<id>.json, lu par la publication automatique (GitHub Actions)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const STUDIO = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(STUDIO, '..');
const weekDir = path.resolve(process.argv[2] || '');
const mPath = path.join(weekDir, 'out', 'manifest.json');
if (!fs.existsSync(mPath)) { console.error('Lance d\'abord : node build.mjs ' + (process.argv[2] || 'semaines/<semaine>')); process.exit(1); }
const manifest = JSON.parse(fs.readFileSync(mPath, 'utf8'));
const now = Date.now();
fs.mkdirSync(path.join(STUDIO, 'queue'), { recursive: true });

for (const m of manifest) {
  const qFile = path.join(STUDIO, 'queue', m.id + '.json');
  if (fs.existsSync(qFile)) {
    const q = JSON.parse(fs.readFileSync(qFile, 'utf8'));
    if (q.status === 'published') { console.log(`⏭️  ${m.id} déjà publié, ignoré`); continue; }
  }
  if (new Date(m.when).getTime() < now) { console.warn(`⚠️  ${m.id} : la date ${m.when} est passée, non mis en file`); continue; }
  const pub = path.join(ROOT, 'public', 'ig', m.id);
  fs.rmSync(pub, { recursive: true, force: true }); fs.mkdirSync(pub, { recursive: true });
  const media = m.files.map(f => { const dest = path.join(pub, path.basename(f)); fs.copyFileSync(path.join(weekDir, f), dest); return `ig/${m.id}/${path.basename(f)}`; });
  const entry = { id: m.id, when: m.when, type: m.type, caption: m.caption, media, ia: m.ia, status: 'pending', attempts: 0 };
  fs.writeFileSync(qFile, JSON.stringify(entry, null, 2) + '\n');
  console.log(`📥 ${m.when}  ${m.type.padEnd(8)} ${m.id}`);
}
console.log('\nÉtape suivante : commit + push (le déploiement met les images en ligne, puis la publication se fait à l\'heure prévue).');
