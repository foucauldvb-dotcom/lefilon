// Semaine 45 (2–8 novembre 2026) — exemple de fichier de semaine.
// Un post = un objet. Les images sont dans ./img (nom sans extension).
import { ill, ph, band } from '../../lib/engine.mjs';

export default [
  {
    id: '2026-11-03-idee-recue-grande-muraille',
    when: '2026-11-03T12:30:00+01:00',
    type: 'carousel',
    concept: 'IDÉE REÇUE',
    ia: true,
    caption: `On nous l'a appris à l'école… et c'est faux 🚀

Vous y croyiez ? Oui ou non en commentaire 👇

Sources : Scientific American, Al Jazeera

#ideerecue #espace #chine #lesaviezvous #lefilon`,
    slides: [
      { k: 'cover', t: 'La Grande Muraille de Chine se voit [depuis l\'espace] ?', size: 86, v: ill('muraille-astronaute') },
      { k: 'photo', t: 'C\'est [faux.]', p: 'À l\'œil nu, depuis l\'orbite, on ne la distingue pas. **Même en la cherchant.**', size: 96, v: ill('muraille-hublot') },
      { k: 'text', t: 'En 2003, le premier astronaute chinois [l\'a cherchée.]', p: 'De retour sur Terre, Yang Liwei l\'a avoué à la télévision chinoise : **« Je n\'ai pas vu la Grande Muraille. »**', size: 84 },
      { k: 'big', b: '6 m', size: 240, t: 'C\'est à peu près sa largeur.', t2: 'Très longue, mais **très étroite**. Et sa couleur se confond avec le sol qui l\'entoure.' },
      { k: 'text', t: 'Ce qu\'on voit, en revanche ?', p: 'Les **routes**, les **pistes d\'aéroport**, les **villes**. Des lignes nettes qui tranchent avec le paysage.', size: 96 },
      { k: 'text', t: 'Et depuis la [Lune] ?', p: 'Encore moins. Neil Armstrong voyait les continents, les lacs… mais **aucune construction humaine**.', size: 104 },
      { k: 'share', t: 'Envoyez-le à quelqu\'un qui vous l\'a appris à l\'école.', sub: 'On a tous eu ce prof.' },
      { k: 'end', src: 'Sources : Scientific American ; Al Jazeera (17 octobre 2003).<br>Illustrations générées par IA.' },
    ],
  },
];
