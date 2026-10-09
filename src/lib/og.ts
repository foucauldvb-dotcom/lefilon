// Image de partage 1200 x 630 d'un article : rubrique, titre et logo aux couleurs du Filon.
import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { getRubrique } from '../config/rubriques';
import type { Article } from './articles';
import { plainSpaces } from './typo';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const OR = '#F5B800';
const NOIR = '#16130E';
const BLANC = '#FFFFFF';
const MARGIN = 64;
const LOGO_WIDTH = 220;
const BAR = 14;

const font = (weight: number) => readFile(`node_modules/@fontsource/sora/files/sora-latin-${weight}-normal.woff`);
const assets = Promise.all([
  font(800),
  font(600),
  sharp('assets-source/lefilon-logo-blanc.png').resize(LOGO_WIDTH).png().toBuffer({ resolveWithObject: true }),
]);

const titleSize = (title: string) => (title.length <= 45 ? 72 : title.length <= 65 ? 62 : 52);

type Style = Record<string, string | number>;
const el = (style: Style, children?: unknown) => ({ type: 'div', props: { style, children } });

export async function ogImage(article: Article): Promise<Buffer> {
  const [sora800, sora600, logo] = await assets;
  const title = plainSpaces(article.data.title);

  const card = el(
    {
      position: 'relative',
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      background: NOIR,
      fontFamily: 'Sora',
    },
    [
      el(
        {
          display: 'flex',
          marginTop: MARGIN,
          marginLeft: MARGIN,
          padding: '10px 24px',
          borderRadius: 999,
          background: OR,
          color: NOIR,
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
        getRubrique(article.data.rubrique).name,
      ),
      el(
        {
          display: 'block',
          width: OG_WIDTH - 2 * MARGIN,
          marginTop: 36,
          marginLeft: MARGIN,
          color: BLANC,
          fontSize: titleSize(title),
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: -1.5,
        },
        title,
      ),
      el(
        {
          position: 'absolute',
          right: MARGIN,
          bottom: MARGIN + BAR,
          display: 'flex',
          color: OR,
          fontSize: 26,
          fontWeight: 600,
        },
        'lefilon.media',
      ),
      el({ position: 'absolute', left: 0, bottom: 0, width: OG_WIDTH, height: BAR, background: OR }),
    ],
  );

  const svg = await satori(card as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Sora', data: sora800, weight: 800, style: 'normal' },
      { name: 'Sora', data: sora600, weight: 600, style: 'normal' },
    ],
  });

  // Le logo est incrusté par sharp, en bas à gauche
  return sharp(Buffer.from(svg))
    .composite([{ input: logo.data, left: MARGIN, top: OG_HEIGHT - BAR - MARGIN - logo.info.height + 10 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

export const ogImagePath = (article: Article) => `/og/${article.id}.jpg`;
