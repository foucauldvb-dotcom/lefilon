// Rend tous les posts d'une semaine : node build.mjs semaines/2026-S45 [--only <id>]
// Sortie : semaines/<semaine>/out/<id>/NN.jpg + planche.html (à valider avant mise en file d'attente)
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { chromium } from 'playwright';
import { CSS, renderSlide, frTypo } from './lib/engine.mjs';
import { SOIR_CSS, renderSoir } from './lib/formats-soir.mjs';
import { prepareIllustration } from './lib/images.mjs';
import { makeReel, hasFfmpeg } from './tools/reel.mjs';

const weekDir = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(path.join(weekDir, 'posts.mjs'))) {
  console.error('Usage : node build.mjs semaines/<semaine>   (le dossier doit contenir posts.mjs)');
  process.exit(1);
}
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const posts = (await import(pathToFileURL(path.join(weekDir, 'posts.mjs')).href + '?t=' + Date.now())).default;
const imgDir = path.join(weekDir, 'img');
const outRoot = path.join(weekDir, 'out');

// ---------- Vérifications de la charte avant rendu ----------
const errors = [], warnings = [];
const ids = new Set();
for (const p of posts) {
  if (!p.id || !/^[a-z0-9-_]+$/.test(p.id)) errors.push(`id invalide : "${p.id}" (minuscules, chiffres, tirets)`);
  if (ids.has(p.id)) errors.push(`id en double : ${p.id}`); ids.add(p.id);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?[+-]\d{2}:\d{2}$/.test(p.when || '')) errors.push(`${p.id} : "when" doit être au format 2026-11-03T12:30:00+01:00`);
  if (!['carousel', 'image', 'story', 'reel'].includes(p.type)) errors.push(`${p.id} : type inconnu "${p.type}"`);
  if (p.type === 'carousel') {
    if (p.slides.length > 10) errors.push(`${p.id} : ${p.slides.length} slides (10 maximum)`);
    if (p.slides.length < 2) errors.push(`${p.id} : un carrousel a au moins 2 slides`);
    const used = p.slides.flatMap(s => [s.v && s.v.f, s.full]).filter(Boolean);
    const dup = used.filter((f, k) => used.indexOf(f) !== k);
    if (dup.length) errors.push(`${p.id} : image utilisée plusieurs fois (${[...new Set(dup)].join(', ')}) — une image une seule fois par carrousel`);
    if (p.slides.at(-1).k !== 'end') warnings.push(`${p.id} : la dernière slide n'est pas la slide de fin noire`);
  }
  if (p.type !== 'story') {
    const cap = p.caption || '';
    if (!cap) errors.push(`${p.id} : légende manquante`);
    if (cap.length > 2200) errors.push(`${p.id} : légende trop longue (${cap.length} > 2200)`);
    const tags = cap.match(/#[\p{L}\d_]+/gu) || [];
    if (tags.length > 5) errors.push(`${p.id} : ${tags.length} hashtags (5 maximum)`);
    if (!tags.includes('#lefilon')) warnings.push(`${p.id} : #lefilon absent de la légende`);
  }
}
if (warnings.length) console.warn('⚠️  ' + warnings.join('\n⚠️  '));
if (errors.length) { console.error('❌ ' + errors.join('\n❌ ')); process.exit(1); }

// ---------- Rendu ----------
const findImg = name => {
  for (const e of ['.jpg', '.jpeg', '.png', '.webp']) { const f = path.join(imgDir, name + e); if (fs.existsSync(f)) return f; }
  if (fs.existsSync(path.join(imgDir, name))) return path.join(imgDir, name);
  throw new Error(`Image introuvable : ${name} (attendue dans ${imgDir})`);
};
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
const manifest = [];

async function shot(html, css, file, height) {
  await page.setViewportSize({ width: 1080, height });
  await page.setContent(`<html><head><meta charset="utf-8"><style>${css}</style></head>${html}</html>`);
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(120);
  await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
}

for (const p of posts) {
  if (only && p.id !== only) continue;
  const dir = path.join(outRoot, p.id); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const files = [];
  if (p.type === 'carousel') {
    const ills = {};
    for (const s of p.slides) if (s.v && s.v.type === 'ill' && !ills[s.v.f]) ills[s.v.f] = await prepareIllustration(page, findImg(s.v.f), path.join(outRoot, '_cache'));
    const ctx = { img: findImg, ill: f => ills[f] };
    for (const [k, s] of p.slides.entries()) {
      const f = path.join(dir, String(k + 1).padStart(2, '0') + '.jpg');
      await shot(frTypo(renderSlide(p.concept, s, k + 1, p.slides.length, ctx)), CSS, f, 1350); files.push(f);
    }
  } else if (p.type === 'image' || p.type === 'story') {
    const f = path.join(dir, '01.jpg');
    if (p.soir) await shot(renderSoir(p.soir, p.type === 'image'), SOIR_CSS, f, p.type === 'image' ? 1350 : 1920);
    else fs.copyFileSync(findImg(p.file), f);
    files.push(f);
  } else if (p.type === 'reel') {
    if (!hasFfmpeg()) { console.warn(`⚠️  ${p.id} : ffmpeg absent, Reel ignoré (brew install ffmpeg)`); continue; }
    const src = path.join(outRoot, p.from);
    if (!fs.existsSync(src)) { console.warn(`⚠️  ${p.id} : rends d'abord le carrousel "${p.from}"`); continue; }
    const f = path.join(dir, 'reel.mp4');
    makeReel(fs.readdirSync(src).filter(x => x.endsWith('.jpg')).sort().map(x => path.join(src, x)), f, { seconds: p.seconds || 2.6, music: p.music ? findImg(p.music) : null });
    files.push(f);
  }
  let caption = p.caption || '';
  if (p.ia && !/IA/.test(caption)) {
    // mention IA juste avant le bloc de hashtags (l'API ne permet pas d'activer l'étiquette IA d'Instagram)
    const parts = caption.split('\n\n'); const last = parts.at(-1).trim();
    if (last.startsWith('#')) parts.splice(parts.length - 1, 0, 'Illustrations générées par IA.'); else parts.push('Illustrations générées par IA.');
    caption = parts.join('\n\n');
  }
  manifest.push({ id: p.id, when: p.when, type: p.type, caption, files: files.map(f => path.relative(weekDir, f)), ia: !!p.ia, cover_url: null });
  console.log(`✅ ${p.id} (${files.length} fichier${files.length > 1 ? 's' : ''})`);
}
await browser.close();

// Fusion avec un manifeste existant (cas --only)
const mPath = path.join(outRoot, 'manifest.json');
let all = manifest;
if (only && fs.existsSync(mPath)) { const old = JSON.parse(fs.readFileSync(mPath, 'utf8')).filter(m => m.id !== only); all = [...old, ...manifest]; }
all.sort((a, b) => a.when.localeCompare(b.when));
fs.writeFileSync(mPath, JSON.stringify(all, null, 2));

// ---------- Planche de validation ----------
const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const jours = { 1: 'lun.', 2: 'mar.', 3: 'mer.', 4: 'jeu.', 5: 'ven.', 6: 'sam.', 0: 'dim.' };
const label = w => { const d = new Date(w); return `${jours[d.getDay()]} ${w.slice(8, 10)}/${w.slice(5, 7)} · ${w.slice(11, 16)}`; };
const html = `<!doctype html><meta charset="utf-8"><title>Planche ${path.basename(weekDir)}</title>
<style>body{font-family:-apple-system,Helvetica,sans-serif;background:#f3f0e8;margin:24px;color:#16130e}h1{margin:0 0 20px}
.post{background:#fff;border-radius:14px;padding:16px 18px;margin:0 0 18px}.meta{font-weight:700;margin-bottom:8px}.tag{display:inline-block;background:#16130e;color:#fff;border-radius:10px;padding:1px 9px;font-size:12px;margin-left:6px}
.ia{background:#c4604a}.row{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}.row img{height:260px;border-radius:6px}.row video{height:300px}
pre{white-space:pre-wrap;background:#faf6ea;padding:10px;border-radius:8px;font-size:13px}</style>
<h1>Planche ${path.basename(weekDir)} — ${all.length} publications</h1>
${all.map(m => `<div class="post"><div class="meta">${label(m.when)} — ${m.id}<span class="tag">${m.type}</span>${m.ia ? '<span class="tag ia">IA</span>' : ''}</div>
<div class="row">${m.files.map(f => f.endsWith('.mp4') ? `<video src="${f}" controls></video>` : `<img src="${f}">`).join('')}</div>
${m.caption ? `<pre>${esc(m.caption)}</pre>` : ''}</div>`).join('')}`;
fs.writeFileSync(path.join(weekDir, 'planche.html'), html);
console.log(`\nPlanche : ${path.join(weekDir, 'planche.html')}`);
