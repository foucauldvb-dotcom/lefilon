// Typographie française appliquée au build : les fichiers Markdown restent écrits avec des espaces simples.
const NBSP = ' ';
const FINE = ' ';

export function typo(text: string): string {
  return text
    .replace(/ ([;!?])/g, `${FINE}$1`)
    .replace(/ ([:»])/g, `${NBSP}$1`)
    .replace(/« /g, `«${NBSP}`)
    .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${FINE}`)
    .replace(/(\d) (?=[%€])/g, `$1${NBSP}`)
    .replace(/(\p{L})'(?=\p{L}|«)/gu, '$1’');
}

// Pour les rendus qui n'ont pas ces glyphes (images générées par satori)
export const plainSpaces = (text: string) => text.replace(/[  ]/g, ' ');

// Applique la typographie au texte d'un fragment HTML, sans toucher aux balises ni au code.
export function typoHtml(html: string): string {
  let code = 0;
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        if (/^<(pre|code)\b/i.test(part)) code += 1;
        else if (/^<\/(pre|code)>/i.test(part)) code -= 1;
        return part.replace(/(\salt=")([^"]*)(")/, (_, before, alt, after) => before + typo(alt) + after);
      }
      return code > 0 ? part : typo(part);
    })
    .join('');
}
