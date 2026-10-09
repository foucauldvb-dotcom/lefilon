// Génère les couvertures typographiques des articles sans photo (champ `coverText` du frontmatter)
// dans src/assets/covers/<slug>.jpg. Lancé automatiquement avant `npm run dev` et `npm run build`.
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { parse } from 'yaml';
import { RUBRIQUES } from '../src/config/rubriques.ts';

const ARTICLES = 'src/content/articles';
const OUT = 'src/assets/covers';
const WIDTH = 1600;
const HEIGHT = 900;
const OR = '#F5B800';
const NOIR = '#16130E';
const BLANC = '#FFFFFF';

const THEMES = {
  noir: { background: NOIR, text: OR, sub: BLANC, badge: OR, badgeText: NOIR, logo: 'blanc' },
  or: { background: OR, text: NOIR, sub: NOIR, badge: NOIR, badgeText: BLANC, logo: 'noir' },
};

const font = (weight) => readFile(`node_modules/@fontsource/sora/files/sora-latin-${weight}-normal.woff`);
const fonts = [
  { name: 'Sora', data: await font(800), weight: 800, style: 'normal' },
  { name: 'Sora', data: await font(600), weight: 600, style: 'normal' },
];

const LOGO_WIDTH = 240;
const LOGO_HEIGHT = 65;
const logo = (variant) => sharp(`assets-source/lefilon-logo-${variant}.png`).resize(LOGO_WIDTH).png().toBuffer();
const logos = { blanc: await logo('blanc'), noir: await logo('noir') };

// Le texte reste dans la zone centrale, visible aussi sur les recadrages carrés
const textSize = (text) => (text.length <= 6 ? 300 : text.length <= 10 ? 200 : text.length <= 18 ? 140 : 100);

const el = (type, style, children) => ({ type, props: { style, children } });

function cover({ text, sub, rubrique, theme }) {
  const colors = THEMES[theme];
  return el(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '70px 0',
      background: colors.background,
      fontFamily: 'Sora',
    },
    [
      el(
        'div',
        {
          display: 'flex',
          padding: '14px 32px',
          borderRadius: 999,
          background: colors.badge,
          color: colors.badgeText,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
        rubrique,
      ),
      el('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 860 }, [
        el(
          'div',
          {
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
            color: colors.text,
            fontSize: textSize(text),
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
          },
          text,
        ),
        sub &&
          el(
            'div',
            {
              display: 'flex',
              justifyContent: 'center',
              textAlign: 'center',
              marginTop: 28,
              color: colors.sub,
              fontSize: 46,
              fontWeight: 600,
              lineHeight: 1.25,
            },
            sub,
          ),
      ]),
      // Emplacement du logo, incrusté ensuite par sharp
      el('div', { display: 'flex', height: LOGO_HEIGHT }),
    ],
  );
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let count = 0;
for (const file of (await readdir(ARTICLES)).filter((name) => name.endsWith('.md'))) {
  const source = await readFile(`${ARTICLES}/${file}`, 'utf8');
  const frontmatter = parse(source.split(/^---$/m)[1] ?? '') ?? {};
  if (frontmatter.image || !frontmatter.coverText) continue;

  const theme = frontmatter.coverTheme === 'or' ? 'or' : 'noir';
  const svg = await satori(
    cover({
      text: String(frontmatter.coverText),
      sub: frontmatter.coverSub ? String(frontmatter.coverSub) : undefined,
      rubrique: RUBRIQUES.find((rubrique) => rubrique.slug === frontmatter.rubrique)?.name ?? '',
      theme,
    }),
    { width: WIDTH, height: HEIGHT, fonts },
  );
  const jpg = await sharp(Buffer.from(svg))
    .composite([
      {
        input: logos[THEMES[theme].logo],
        left: Math.round((WIDTH - LOGO_WIDTH) / 2),
        top: HEIGHT - 70 - LOGO_HEIGHT,
      },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
  await writeFile(`${OUT}/${file.replace(/\.md$/, '.jpg')}`, jpg);
  count += 1;
}

console.log(`Couvertures générées : ${count}`);
