// Transforme les slides d'un carrousel en Reel vertical 1080×1920 (MP4 H.264 + AAC).
// Nécessite ffmpeg (Mac : brew install ffmpeg).
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export function hasFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}

// slides : chemins JPEG 1080×1350 ; music : mp3/m4a libre de droits (facultatif)
export function makeReel(slides, out, { seconds = 2.6, music = null, bg = '#16130E' } = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-'));
  const list = path.join(tmp, 'list.txt');
  // concat demuxer : la dernière image doit être répétée pour que sa durée soit prise en compte
  const lines = slides.map(s => `file '${s.replace(/'/g, "'\\''")}'\nduration ${seconds}`);
  lines.push(`file '${slides.at(-1).replace(/'/g, "'\\''")}'`);
  fs.writeFileSync(list, lines.join('\n'));
  const total = (slides.length * seconds).toFixed(2);
  const vf = `scale=1080:1350,pad=1080:1920:0:285:color=${bg},fps=30,format=yuv420p`;
  const args = ['-y', '-f', 'concat', '-safe', '0', '-i', list];
  if (music) args.push('-i', music); else args.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000');
  args.push('-vf', vf, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-c:a', 'aac', '-b:a', '128k', '-t', total, '-movflags', '+faststart', out);
  execFileSync('ffmpeg', args, { stdio: 'ignore' });
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}
