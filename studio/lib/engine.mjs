// Moteur de rendu des carrousels Le Filon (PNG/JPEG 1080×1350).
// Charte : voir studio/CHARTE.md. Ne pas changer les couleurs sans mettre la charte à jour.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dataUri, heightAt1080 } from './images.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const font = w => `@font-face{font-family:Sora;font-weight:${w};src:url(${dataUri(path.join(HERE, `sora-latin-${w}-normal.woff2`)).replace('image/jpeg', 'font/woff2')})}`;
export const FONTS = [400, 600, 700, 800].map(font).join('');

export const INK = '#16130E', J = '#F5B800', BG = '#FAF6EA', MUTED = '#6E675C', GOLD = '#B07D00';

export const CONCEPTS = {
  'OVNI': { bg: '#F8E3CB', lab: '#B8601F', acc: '#B8601F', tag: 'Des histoires vraies et insolites,<br>chaque semaine.' },
  'LE CHIFFRE FOU': { bg: J, lab: INK, acc: GOLD, tag: 'Un chiffre fou chaque semaine.<br>Des histoires vraies tous les jours.' },
  'LES PÉPITES': { bg: '#E2ECDD', lab: '#2E7D63', acc: '#2E7D63', tag: 'Des bonnes nouvelles vérifiées,<br>chaque semaine.' },
  'LE SAVIEZ-VOUS ?': { bg: '#F9E6BE', lab: '#A86A00', acc: '#A86A00', tag: 'Une pépite de culture générale,<br>chaque semaine.' },
  'BÊTES DE SCÈNE': { bg: '#E6E9D0', lab: '#5B7A2E', acc: '#5B7A2E', tag: 'Des animaux qui épatent,<br>chaque semaine.' },
  'BON FILON': { bg: '#EFEAD8', lab: '#6E6A2E', acc: '#6E6A2E', tag: 'Des bons filons pour votre argent,<br>chaque semaine.' },
  'CE JOUR-LÀ': { bg: '#F2E9D3', lab: INK, acc: '#9A6E00', tag: 'Une date, une histoire vraie.<br>Chaque mercredi et samedi.' },
  "L'OBJET QUI A UNE HISTOIRE": { bg: '#F1E4D7', lab: '#8B5A3C', acc: '#8B5A3C', tag: 'Des objets du quotidien.<br>Des histoires qu\'on ne connaît pas.' },
  'IDÉE REÇUE': { bg: '#F7E1D4', lab: '#C4604A', acc: '#C4604A', tag: 'Une idée reçue démontée<br>chaque semaine.' },
  "D'OÙ ÇA VIENT ?": { bg: '#F5E1DC', lab: '#A8574F', acc: '#A8574F', tag: 'L\'origine des choses,<br>chaque semaine.' },
  "L'HISTOIRE VRAIE": { bg: INK, lab: J, acc: J, dark: true, tag: 'Une histoire vraie<br>chaque dimanche.' },
};

export const CSS = `${FONTS}*{margin:0;box-sizing:border-box}
body{width:1080px;height:1350px;font-family:Sora;color:${INK};position:relative;overflow:hidden}
.pill{position:absolute;top:60px;height:58px;padding:0 26px;border-radius:29px;display:flex;align-items:center;font-weight:700;font-size:27px;letter-spacing:.5px}
.box{position:absolute;left:90px;right:80px;top:160px;bottom:160px;display:flex;flex-direction:column;gap:26px}
.h{font-weight:800;letter-spacing:-2.5px;line-height:1.05}
.big{font-weight:800;letter-spacing:-6px;line-height:.95}
.p{font-weight:600;font-size:36px;line-height:1.3}
.lead{font-weight:600;font-size:34px;color:${MUTED}}
.vis{flex:1 1 auto;min-height:0;position:relative}
.vis img.ill{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;-webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent),linear-gradient(to bottom,transparent,#000 6%,#000 94%,transparent);-webkit-mask-composite:source-in}
.logo{position:absolute;left:90px;bottom:62px;font-weight:800;font-size:44px;letter-spacing:-1px}
.handle{position:absolute;right:90px;bottom:68px;font-weight:600;font-size:28px}
.btn{position:absolute;right:60px;bottom:52px;height:72px;padding:0 34px;border-radius:36px;background:${INK};color:${BG};font-weight:700;font-size:28px;display:flex;align-items:center;gap:14px}
.opt{height:110px;border:4px solid ${INK};border-radius:26px;display:flex;align-items:center;padding:0 36px;gap:28px;font-weight:700;font-size:42px}
.opt b{font-size:36px}`;

// Raccourcis utilisés dans les fichiers posts.mjs
export const ill = f => ({ type: 'ill', f });
export const ph = (f, credit, pos) => ({ type: 'photo', f, credit, pos });
export const band = f => ({ f });

const bigSize = t => t.length <= 6 ? 230 : t.length <= 10 ? 170 : t.length <= 13 ? 130 : 110;

// Typographie française : espaces insécables
export function frTypo(html) {
  return html.replace(/\*\*(.+?)\*\*/g, '<b style="font-weight:800">$1</b>')
    .replace(/ \?/g, '&nbsp;?').replace(/ !/g, '&nbsp;!').replace(/ :/g, '&nbsp;:').replace(/ ;/g, '&nbsp;;')
    .replace(/ %/g, '&nbsp;%').replace(/« /g, '«&nbsp;').replace(/ »/g, '&nbsp;»');
}

// ctx.img(name) -> chemin du fichier image ; ctx.ill(name) -> chemin de l'illustration préparée
export function renderSlide(concept, s, i, n, ctx) {
  const C = CONCEPTS[concept];
  if (!C) throw new Error('Concept inconnu : ' + concept + ' (voir CONCEPTS dans lib/engine.mjs)');
  const labTxt = C.lab === INK ? J : C.lab === J ? INK : '#fff';
  const acc = t => t.replace(/\[(.+?)\]/g, `<span style="color:${C.acc}">$1</span>`);
  const yel = t => t.replace(/\[(.+?)\]/g, `<span style="color:${J}">$1</span>`);
  const md = t => t.replace(/\*\*(.+?)\*\*/g, `<b style="font-weight:800">$1</b>`);
  const single = n === 1;
  const pg = (bgc, tc) => single ? '' : `<div class="pill" style="right:60px;background:${bgc};color:${tc}">${i}/${n}</div>`;
  const label = `<div class="pill" style="left:60px;background:${C.lab};color:${labTxt}">${concept}</div>`;
  const vis = v => !v ? '' : v.type === 'photo'
    ? `<div class="vis"><div style="width:100%;height:100%;border-radius:36px;overflow:hidden"><img src="${dataUri(ctx.img(v.f))}" style="width:100%;height:100%;object-fit:cover;object-position:${v.pos || 'center'}"></div></div>`
    : v.type === 'ill' ? `<div class="vis"><img class="ill" src="${dataUri(ctx.ill(v.f))}"></div>`
    : v.type === 'glyph' ? `<div class="vis" style="display:flex;align-items:center"><div style="font-weight:800;font-size:380px;line-height:1;color:${C.acc}">${v.g}</div></div>` : '';
  const foot = (btn, dot = J) => `<div class="logo">le filon<span style="color:${dot}">.</span></div>` + (btn ? `<div class="btn">${btn}</div>` : `<div class="handle">@lefilon.media</div>`);
  const glissez = 'Glissez <b style="color:' + J + '">→</b>';

  // Photo pleine page (couverture ou slide intérieure "fp")
  const fullpage = () => `<body style="background:${INK}">
   <div style="position:absolute;inset:0;background:url(${dataUri(ctx.img(s.full))}) ${s.fpos || 'center'}/cover no-repeat"></div>
   <div style="position:absolute;left:0;right:0;bottom:0;height:${s.k === 'fp' ? 820 : 660}px;background:linear-gradient(to bottom,rgba(22,19,14,0),rgba(22,19,14,.9) ${s.k === 'fp' ? 45 : 55}%,rgba(22,19,14,.96))"></div>
   <div style="position:absolute;left:0;right:0;top:0;height:220px;background:linear-gradient(to bottom,rgba(22,19,14,.35),rgba(22,19,14,0))"></div>
   ${label}${pg(INK, '#fff')}
   <div style="position:absolute;left:90px;right:80px;bottom:175px;display:flex;flex-direction:column;gap:20px;color:${BG}">
    <h1 class="h" style="font-size:${s.size || 84}px">${yel(s.t)}</h1>${s.sub ? `<p class="p" style="color:#E2DCCD;font-weight:500">${s.sub.replace(/\*\*(.+?)\*\*/g, '<b style="font-weight:800;color:#fff">$1</b>')}</p>` : ''}${s.fcredit ? `<div style="font-weight:600;font-size:22px;color:#A9A195">${s.fcredit}</div>` : ''}</div>
   <div class="logo" style="color:${BG}">le filon<span style="color:${J}">.</span></div>
   ${(single || s.k === 'fp') ? `<div class="handle" style="color:${BG}">@lefilon.media</div>` : `<div class="btn" style="background:${J};color:${INK}">Glissez&nbsp;→</div>`}</body>`;

  // Photo en bandeau en haut, texte dessous
  const bandSlide = (bg, v, isCover) => {
    const h = Math.min(heightAt1080(ctx.img(v.f)), isCover ? 760 : 640);
    return `<body style="background:${bg}"><img src="${dataUri(ctx.img(v.f))}" style="position:absolute;left:0;top:0;width:1080px;height:${h}px;object-fit:cover;object-position:${v.pos || 'center'}">${label}${pg(INK, '#fff')}
   <div style="position:absolute;left:90px;right:80px;top:${h + (v.credit ? 62 : 56)}px;bottom:${isCover ? 170 : 150}px;display:flex;flex-direction:column;gap:26px;justify-content:${isCover ? 'flex-start' : 'center'}">
    ${s.b ? `<div class="big" style="font-size:${s.bsize || Math.min(bigSize(s.b), 150)}px;color:${C.acc}">${s.b}</div>` : ''}
    ${s.t ? `<h1 class="h" style="font-size:${s.size || (isCover ? 80 : (s.b ? 54 : 76))}px;${s.b ? 'letter-spacing:-1.2px' : ''}">${acc(s.t)}</h1>` : ''}
    ${(s.p || s.sub || s.t2) ? `<p class="p" style="font-weight:500;color:#3A352D;font-size:${isCover ? 38 : 44}px;line-height:1.32">${md(s.p || s.sub || s.t2)}</p>` : ''}
   </div>
   ${v.credit ? `<div style="position:absolute;left:90px;top:${h + 14}px;font-weight:600;font-size:22px;color:${MUTED}">${v.credit}</div>` : ''}
   ${foot(isCover && !single ? glissez : null, C.bg === J && isCover ? INK : J)}</body>`;
  };

  // Slide sombre (L'histoire vraie) : illustration en bandeau, fondu vers le noir
  const darkSlide = () => {
    const isC = i === 1;
    const h = s.v ? heightAt1080(ctx.img(s.v.f)) : 0;
    const img = s.v ? `<img src="${dataUri(ctx.img(s.v.f))}" style="position:absolute;left:0;top:0;width:1080px;height:${h}px">
   <div style="position:absolute;left:0;right:0;top:${h - 170}px;height:171px;background:linear-gradient(to bottom,rgba(22,19,14,0),rgba(22,19,14,1))"></div>
   <div style="position:absolute;left:0;right:0;top:0;height:200px;background:linear-gradient(to bottom,rgba(22,19,14,.45),rgba(22,19,14,0))"></div>` : '';
    return `<body style="background:${INK}">${img}${label}${pg(isC ? J : '#2A251D', isC ? INK : '#fff')}
   <div style="position:absolute;left:90px;right:80px;top:${s.v ? (h + 6) + 'px' : '160px'};bottom:170px;display:flex;flex-direction:column;gap:24px;justify-content:${s.v ? 'flex-start' : 'center'};color:${BG}">
    ${s.share ? `<div style="font-weight:700;font-size:30px;letter-spacing:2px;color:${J}">À PARTAGER</div>` : ''}
    ${s.b ? `<div class="big" style="font-size:${s.bsize || 170}px;color:${J}">${s.b}</div>` : ''}
    <h1 class="h" style="font-size:${s.size || (s.v ? 62 : 92)}px">${yel(s.t)}</h1>${s.p ? `<p class="p" style="color:#D9D3C4;font-weight:500;font-size:${s.psize || (s.v ? 42 : 46)}px;line-height:1.32">${s.p.replace(/\*\*(.+?)\*\*/g, '<b style="font-weight:800;color:#fff">$1</b>')}</p>` : ''}</div>
   <div class="logo" style="color:${BG}">le filon<span style="color:${J}">.</span></div>
   ${isC ? `<div class="btn" style="background:${J};color:${INK}">Glissez&nbsp;→</div>` : s.share ? `<div class="btn" style="background:${J};color:${INK}">Partager&nbsp;➤</div>` : `<div class="handle" style="color:${BG}">@lefilon.media</div>`}</body>`;
  };

  if (s.k === 'dark') return darkSlide();
  if (s.k === 'fp' || (s.k === 'cover' && s.full)) return fullpage();
  if (s.k === 'cover' && s.v && s.v.type === 'photo') return bandSlide(C.bg, s.v, true);
  if ((s.k === 'photo' || s.k === 'big') && s.v && s.v.type === 'photo') return bandSlide(BG, s.v, false);
  if (s.k === 'cover') return `<body style="background:${C.bg}">${label}${pg(INK, '#fff')}<div class="box">
   <h1 class="h" style="font-size:${s.size || 84}px">${acc(s.t)}</h1>${s.sub ? `<p class="p" style="color:${C.lab === INK ? INK : MUTED}">${s.sub}</p>` : ''}
   ${s.opts ? `<div style="display:flex;flex-direction:column;gap:24px;margin-top:10px">${s.opts.map((o, k) => `<div class="opt"><b style="color:${C.acc}">${'AB'[k]}</b>${o}</div>`).join('')}</div>` : ''}
   ${vis(s.v)}</div>${foot(single ? null : glissez, C.bg === J ? INK : J)}</body>`;
  const head = `${label}${pg(INK, '#fff')}`;
  if (s.k === 'big') return `<body style="background:${BG}">${head}<div class="box" style="${s.v ? '' : 'justify-content:center'}">
   ${s.lead ? `<div class="lead">${s.lead}</div>` : ''}<div class="big" style="font-size:${s.size || bigSize(s.b)}px;color:${C.acc}">${s.b}</div>
   ${s.t ? `<p class="${s.v ? 'p' : 'h'}" style="${s.v ? 'font-size:40px' : 'font-size:58px;letter-spacing:-1.5px'}">${s.t}</p>` : ''}${s.t2 ? `<p class="p" style="color:#3A352D;font-weight:500;font-size:42px;line-height:1.3">${s.t2}</p>` : ''}${vis(s.v)}</div>${foot()}</body>`;
  if (s.k === 'photo' || s.k === 'text') return `<body style="background:${BG}">${head}<div class="box" style="${s.v ? '' : 'justify-content:center'}">
   <h1 class="h" style="font-size:${s.size || (s.v ? 66 : 104)}px">${acc(s.t)}</h1>${s.p ? `<p class="p" style="font-size:${s.v ? 40 : 50}px;font-weight:500;line-height:1.3">${s.p}</p>` : ''}${vis(s.v)}</div>${foot()}</body>`;
  if (s.k === 'share') return `<body style="background:${BG}">${head}<div class="box" style="justify-content:center">
   <div style="font-weight:700;font-size:30px;letter-spacing:2px;color:${C.acc}">À PARTAGER</div>
   <h1 class="h" style="font-size:${s.size || 86}px">${s.t}</h1>${s.sub ? `<p class="p" style="color:${MUTED}">${s.sub}</p>` : ''}</div>${foot('Partager <b style="color:' + J + '">➤</b>')}</body>`;
  if (s.k === 'end') return `<body style="background:${INK}"><div class="pill" style="right:60px;background:${J};color:${INK}">${i}/${n}</div>
   <div style="position:absolute;left:90px;top:300px;font-weight:800;font-size:120px;letter-spacing:-4px;color:${BG}">le filon<span style="color:${J}">.</span></div>
   <p style="position:absolute;left:90px;right:80px;top:470px;font-weight:600;font-size:44px;line-height:1.3;color:${BG}">${C.tag}</p>
   <div style="position:absolute;left:90px;top:700px;height:96px;padding:0 50px;border-radius:48px;background:${J};color:${INK};font-weight:800;font-size:38px;display:flex;align-items:center">S'abonner à @lefilon.media</div>
   ${s.src ? `<p style="position:absolute;left:90px;right:80px;bottom:70px;font-weight:600;font-size:24px;line-height:1.4;color:#9C9486">${s.src}</p>` : ''}</body>`;
  throw new Error('Type de slide inconnu : ' + s.k);
}
