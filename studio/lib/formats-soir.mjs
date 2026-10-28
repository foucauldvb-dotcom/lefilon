// Formats courts du soir : stories 1080×1920 et visuel unique 1080×1350 (citation du samedi).
import { FONTS, INK, J } from './engine.mjs';

const CR = '#FAF6EA', PALE = '#FCECAA', SAND = '#F2EEE4';
export const SOIR_CSS = `${FONTS}*{margin:0;box-sizing:border-box}body{font-family:Sora;position:relative;overflow:hidden}
.pill{position:absolute;left:80px;height:62px;padding:0 28px;border-radius:31px;display:flex;align-items:center;font-weight:700;font-size:28px;letter-spacing:.5px}
.logo{position:absolute;font-weight:800;letter-spacing:-1px}`;
const nb = t => t.replace(/ ([?!:;»])/g, '&nbsp;$1').replace(/« /g, '«&nbsp;');

// v = { kind: 'humeur'|'pensee'|'citation'|'question', ... } ; feed=true -> 1080×1350 au lieu de 1920
export function renderSoir(v, feed = false) {
  const W = 1080, H = feed ? 1350 : 1920;
  const top = feed ? 60 : 290, bot = feed ? 62 : 330; // zones sûres des stories
  if (v.kind === 'humeur') return `<body style="width:${W}px;height:${H}px;background:${J};color:${INK}">
  <div class="pill" style="top:${top}px;background:${INK};color:#fff">NOTE D'HUMEUR</div>
  <div style="position:absolute;left:80px;right:80px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:30px">
   <div style="font-weight:700;font-size:58px;color:#7A5A00">${nb(v.lead)}</div>
   <div style="font-weight:800;font-size:${v.size || 96}px;line-height:1.08;letter-spacing:-2.5px">${nb(v.main)}</div></div>
  <div class="logo" style="left:80px;bottom:${bot}px;font-size:50px">le filon<span style="color:#fff">.</span></div>
  <div style="position:absolute;right:80px;bottom:${bot + 8}px;font-weight:600;font-size:32px">@lefilon.media</div></body>`;
  if (v.kind === 'pensee') return `<body style="width:${W}px;height:${H}px;background:${PALE};color:${INK}">
  <div style="position:absolute;left:80px;top:${top + 10}px;display:flex;align-items:center;gap:16px;font-weight:600;font-size:34px"><span style="width:20px;height:20px;border-radius:10px;background:${J};display:inline-block"></span>la pensée du soir</div>
  ${v.n ? `<div style="position:absolute;right:80px;top:${top + 10}px;font-weight:600;font-size:34px">n°${v.n}</div>` : ''}
  <div style="position:absolute;left:80px;right:80px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:34px">
   <div style="font-weight:800;font-size:84px;line-height:1.1;letter-spacing:-2px">${nb(v.a)}</div>
   <div style="font-weight:400;font-size:60px;line-height:1.3">${nb(v.b)}</div></div>
  <div class="logo" style="left:0;right:0;text-align:center;bottom:${bot}px;font-size:48px">le filon<span style="color:${J}">.</span></div></body>`;
  if (v.kind === 'citation') return `<body style="width:${W}px;height:${H}px;background:${INK};color:${CR}">
  <div class="pill" style="top:${top}px;background:${J};color:${INK}">CITATION</div>
  <div style="position:absolute;left:80px;right:80px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:34px">
   <div style="font-weight:800;font-size:200px;line-height:.6;color:${J};height:110px">«</div>
   <div style="font-weight:800;font-size:${v.size || 72}px;line-height:1.15;letter-spacing:-1.5px">${nb(v.q)}</div>
   <div style="width:90px;height:6px;background:${J}"></div>
   <div><div style="font-weight:800;font-size:44px">${v.who}</div><div style="font-weight:600;font-size:34px;color:#B9B1A3;margin-top:8px">${v.src}</div></div></div>
  <div class="logo" style="left:80px;bottom:${bot}px;font-size:${feed ? 44 : 50}px">le filon<span style="color:${J}">.</span></div>
  <div style="position:absolute;right:80px;bottom:${bot + 8}px;font-weight:600;font-size:${feed ? 28 : 32}px">@lefilon.media</div></body>`;
  if (v.kind === 'question') return `<body style="width:${W}px;height:${H}px;background:${SAND};color:${INK}">
  <div class="pill" style="top:${top}px;background:${INK};color:#fff">LA QUESTION DU SOIR</div>
  <div style="position:absolute;left:80px;right:80px;top:${feed ? 200 : 470}px;font-weight:800;font-size:96px;line-height:1.08;letter-spacing:-2.5px">${nb(v.q)}</div>
  <div class="logo" style="left:80px;bottom:${bot}px;font-size:50px">le filon<span style="color:${J}">.</span></div></body>`;
  throw new Error('Format du soir inconnu : ' + v.kind);
}
