// Lecture des images : data URI, dimensions (JPEG / PNG / WebP) et préparation des illustrations.
import fs from 'fs';
import path from 'path';

export function mime(p) {
  const e = path.extname(p).toLowerCase();
  return e === '.png' ? 'image/png' : e === '.webp' ? 'image/webp' : 'image/jpeg';
}

export function dataUri(p) {
  return `data:${mime(p)};base64,` + fs.readFileSync(p).toString('base64');
}

// Dimensions sans dépendance externe.
export function imageSize(p) {
  const b = fs.readFileSync(p);
  if (b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; // PNG
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const t = b.toString('ascii', 12, 16);
    if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (t === 'VP8L') { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
  }
  // JPEG : on cherche un marqueur SOF
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(m)) {
      return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('Format d\'image non reconnu : ' + p);
}

// Hauteur affichée quand l'image est mise à 1080 px de large.
export function heightAt1080(p) { const { w, h } = imageSize(p); return Math.round(h * 1080 / w); }

// Illustration Gemini : on ramène le papier crème au blanc pur pour que
// le mode "multiply" la fonde dans n'importe quel fond pastel (sans rectangle visible).
// Le traitement se fait dans Chromium (canvas), le résultat est mis en cache.
export async function prepareIllustration(page, src, cacheDir) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const out = path.join(cacheDir, path.basename(src).replace(/\.\w+$/, '') + '.norm.jpg');
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(src).mtimeMs) return out;
  const result = await page.evaluate(async (uri) => {
    const img = new Image(); img.src = uri; await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height); const a = d.data;
    // médiane de la couleur du papier sur une bordure de 20 px
    const R = [], G = [], B = [];
    const take = (px, py) => { const k = (py * c.width + px) * 4; R.push(a[k]); G.push(a[k + 1]); B.push(a[k + 2]); };
    for (let py = 0; py < c.height; py += 3) for (let px = 0; px < 20; px += 3) { take(px, py); take(c.width - 1 - px, py); }
    for (let px = 0; px < c.width; px += 3) for (let py = 0; py < 20; py += 3) take(px, py);
    const med = v => { v.sort((p, q) => p - q); return v[v.length >> 1] || 255; };
    const m = [med(R), med(G), med(B)];
    for (let k = 0; k < a.length; k += 4) {
      let r = Math.min(255, a[k] / m[0] * 255), g = Math.min(255, a[k + 1] / m[1] * 255), bl = Math.min(255, a[k + 2] / m[2] * 255);
      const lum = (r + g + bl) / 3, t = Math.max(0, Math.min(1, (lum - 225) / 25));
      a[k] = r * (1 - t) + 255 * t; a[k + 1] = g * (1 - t) + 255 * t; a[k + 2] = bl * (1 - t) + 255 * t;
    }
    x.putImageData(d, 0, 0);
    return c.toDataURL('image/jpeg', 0.93);
  }, dataUri(src));
  fs.writeFileSync(out, Buffer.from(result.split(',')[1], 'base64'));
  return out;
}
