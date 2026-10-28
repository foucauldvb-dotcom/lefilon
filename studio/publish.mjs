// Publication Instagram via l'API officielle (Instagram API with Instagram Login).
//   node publish.mjs            publie ce qui est dû (utilisé par GitHub Actions toutes les 15 min)
//   node publish.mjs --dry-run  montre ce qui serait publié, sans rien publier
//   node publish.mjs check      vérifie la clé et le quota de publication
//   node publish.mjs refresh    prolonge la clé d'accès (valable 60 jours)
// Variables : IG_USER_ID, IG_ACCESS_TOKEN (secrets GitHub, ou studio/.env en local), SITE_URL (défaut https://lefilon.media)
import './lib/env.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const STUDIO = path.dirname(fileURLToPath(import.meta.url));
const QUEUE = path.join(STUDIO, 'queue');
const { IG_USER_ID, IG_ACCESS_TOKEN } = process.env;
const SITE = (process.env.SITE_URL || 'https://lefilon.media').replace(/\/$/, '');
const BASE = 'https://graph.instagram.com' + (process.env.GRAPH_VERSION ? '/' + process.env.GRAPH_VERSION : '');
const MAX_LATE_H = 12; // au-delà, un post en retard n'est plus publié (statut "missed")
const cmd = process.argv[2];
const DRY = process.argv.includes('--dry-run');
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!IG_USER_ID || !IG_ACCESS_TOKEN) { console.error('IG_USER_ID / IG_ACCESS_TOKEN manquants'); if (!DRY) process.exit(1); }

async function api(method, endpoint, params = {}) {
  const url = new URL(BASE + '/' + endpoint);
  const body = new URLSearchParams({ ...params, access_token: IG_ACCESS_TOKEN });
  let r;
  if (method === 'GET') { for (const [k, v] of body) url.searchParams.set(k, v); r = await fetch(url); }
  else r = await fetch(url, { method, body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`${endpoint} → ${j.error ? `${j.error.message} (code ${j.error.code}${j.error.error_subcode ? '/' + j.error.error_subcode : ''})` : r.status}`);
  return j;
}

async function waitReady(id, video) {
  for (let k = 0; k < (video ? 60 : 20); k++) {
    const { status_code } = await api('GET', id, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`conteneur ${id} : ${status_code}`);
    await sleep(video ? 10000 : 3000);
  }
  throw new Error(`conteneur ${id} : délai de traitement dépassé`);
}

async function online(url) {
  try { const r = await fetch(url, { method: 'HEAD' }); return r.ok; } catch { return false; }
}

async function publishEntry(q) {
  const urls = q.media.map(m => `${SITE}/${m}`);
  for (const u of urls) if (!(await online(u))) throw Object.assign(new Error(`pas encore en ligne : ${u}`), { retryLater: true });
  if (DRY) return { media_id: 'DRY-RUN', permalink: '(dry-run)' };
  let creation;
  if (q.type === 'carousel') {
    const children = [];
    for (const u of urls) { const c = await api('POST', `${IG_USER_ID}/media`, { image_url: u, is_carousel_item: 'true' }); children.push(c.id); }
    for (const c of children) await waitReady(c, false);
    creation = (await api('POST', `${IG_USER_ID}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption: q.caption })).id;
    await waitReady(creation, false);
  } else if (q.type === 'image') {
    creation = (await api('POST', `${IG_USER_ID}/media`, { image_url: urls[0], caption: q.caption })).id;
    await waitReady(creation, false);
  } else if (q.type === 'story') {
    const isVideo = urls[0].endsWith('.mp4');
    creation = (await api('POST', `${IG_USER_ID}/media`, { media_type: 'STORIES', [isVideo ? 'video_url' : 'image_url']: urls[0] })).id;
    await waitReady(creation, isVideo);
  } else if (q.type === 'reel') {
    creation = (await api('POST', `${IG_USER_ID}/media`, { media_type: 'REELS', video_url: urls[0], caption: q.caption, share_to_feed: 'true' })).id;
    await waitReady(creation, true);
  } else throw new Error('type inconnu ' + q.type);
  const { id } = await api('POST', `${IG_USER_ID}/media_publish`, { creation_id: creation });
  let permalink = '';
  try { permalink = (await api('GET', id, { fields: 'permalink' })).permalink; } catch {}
  return { media_id: id, permalink };
}

if (cmd === 'check') {
  const me = await api('GET', 'me', { fields: 'user_id,username' });
  const lim = await api('GET', `${IG_USER_ID}/content_publishing_limit`, { fields: 'quota_usage,config' }).catch(e => ({ error: e.message }));
  console.log('Compte :', me.username, '| quota 24 h :', JSON.stringify(lim.data?.[0] || lim));
  process.exit(0);
}
if (cmd === 'refresh') {
  const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${IG_ACCESS_TOKEN}`);
  const j = await r.json();
  if (j.error) { console.error('Échec du renouvellement :', j.error.message); process.exit(1); }
  const days = Math.round(j.expires_in / 86400);
  console.log(`Clé prolongée : valable encore ${days} jours.`);
  if (j.access_token && j.access_token !== IG_ACCESS_TOKEN) console.log('::warning::Meta a renvoyé une NOUVELLE clé : mets à jour le secret IG_ACCESS_TOKEN (voir README).');
  process.exit(0);
}

// --- Publication de ce qui est dû ---
const now = Date.now();
const files = fs.existsSync(QUEUE) ? fs.readdirSync(QUEUE).filter(f => f.endsWith('.json')).sort() : [];
let done = 0, failed = 0;
for (const f of files) {
  const p = path.join(QUEUE, f);
  const q = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (q.status !== 'pending') continue;
  const due = new Date(q.when).getTime();
  if (due > now) continue;
  if (now - due > MAX_LATE_H * 3600e3) {
    q.status = 'missed'; q.last_error = `non publié : plus de ${MAX_LATE_H} h de retard`;
    if (!DRY) fs.writeFileSync(p, JSON.stringify(q, null, 2) + '\n');
    console.log(`⏰ ${q.id} manqué (trop en retard)`); continue;
  }
  try {
    console.log(`🚀 ${q.id} (${q.type})${DRY ? ' [dry-run]' : ''}`);
    const r = await publishEntry(q);
    Object.assign(q, { status: 'published', published_at: new Date().toISOString(), ...r });
    delete q.last_error; done++;
    console.log(`   ✅ ${r.permalink}`);
  } catch (e) {
    if (e.retryLater) { console.log(`   ⏳ ${e.message} — nouvel essai au prochain passage`); continue; }
    q.attempts = (q.attempts || 0) + 1; q.last_error = e.message; failed++;
    if (q.attempts >= 3) q.status = 'failed';
    console.log(`::error::${q.id} : ${e.message} (essai ${q.attempts}/3)`);
  }
  if (!DRY) fs.writeFileSync(p, JSON.stringify(q, null, 2) + '\n');
}
console.log(`Terminé : ${done} publié(s), ${failed} échec(s).`);
if (failed) process.exitCode = 1;
