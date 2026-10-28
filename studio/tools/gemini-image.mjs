// Génère une illustration avec l'API Gemini.
// Usage : node tools/gemini-image.mjs semaines/<semaine> <nom-fichier> "<description du sujet>"
// Le bloc de style du Filon est ajouté automatiquement. Clé : GEMINI_API_KEY dans studio/.env
import '../lib/env.mjs';
import fs from 'fs';
import path from 'path';

const [weekDir, name, subject] = process.argv.slice(2);
if (!weekDir || !name || !subject) { console.error('Usage : node tools/gemini-image.mjs semaines/<semaine> <nom> "<sujet>"'); process.exit(1); }
const key = process.env.GEMINI_API_KEY;
if (!key) { console.error('GEMINI_API_KEY manquante dans studio/.env'); process.exit(1); }
const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

export const STYLE = 'Style : illustration à l\'encre et aquarelle, planche naturaliste, traits fins, ocre doré, vert sauge, bleu ardoise, fond papier crème uni, beaucoup d\'espace vide, sujet placé dans la moitié basse de l\'image, grand espace vide en haut, format portrait 4:5, sans cadre, sans carnet, sans reliure ni bord de page, aucun texte, aucune lettre, aucun chiffre, aucun visage de personne réelle.';

const body = {
  contents: [{ parts: [{ text: `Génère une image : ${subject}. ${STYLE}` }] }],
  generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } },
};
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body),
});
const j = await r.json();
if (!r.ok) { console.error('Erreur Gemini :', JSON.stringify(j.error || j)); process.exit(1); }
const part = (j.candidates?.[0]?.content?.parts || []).find(p => p.inlineData);
if (!part) { console.error('Pas d\'image renvoyée (refus ou filtre). Reformule le sujet.', JSON.stringify(j).slice(0, 400)); process.exit(1); }
const dir = path.join(weekDir, 'img'); fs.mkdirSync(dir, { recursive: true });
const ext = part.inlineData.mimeType === 'image/jpeg' ? '.jpg' : '.png';
const out = path.join(dir, name + ext);
fs.writeFileSync(out, Buffer.from(part.inlineData.data, 'base64'));
console.log('✅ ' + out);
