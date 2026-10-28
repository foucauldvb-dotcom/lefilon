# Le Filon Studio — instructions pour Claude Code

Ce dossier produit et publie les contenus Instagram de @lefilon.media.
Lis aussi `CHARTE.md` (couleurs, mises en page) avant toute production.

## Règles absolues (ne jamais déroger)
1. **Faits vérifiés et sourcés uniquement.** Chaque chiffre, date et citation vient d'une page que tu as réellement ouverte (WebFetch), pas d'un extrait de recherche. Aucun chiffre ni citation inventés. En cas de doute : reformuler sans le chiffre, ou abandonner le sujet. Les sources figurent sur la slide de fin et dans la légende.
2. **Illustrations IA : on illustre le sujet, jamais le visage d'une personne réelle.** Une illustration avec un visage ne doit jamais être placée à côté du nom d'une personne réelle.
3. **Vraie actualité ou vraie personne → photo réelle** libre de droits (Unsplash, Pexels, NASA) ou sous licence libre (Wikimedia Commons, auteur cité). Jamais de photo de presse. Si la photo ne montre pas exactement le sujet : « Photo d'illustration : … ».
4. **Couverture sans spoiler** (question, quiz A/B, promesse). La première ligne de légende ne dévoile pas non plus la réponse.
5. **Carrousel : 10 slides maximum**, slide de fin comprise. Une image n'apparaît qu'**une seule fois** par carrousel.
6. **Légende : 5 hashtags maximum, toujours `#lefilon`**, en français. Jamais #viral, #explore, #reels.
7. **Couleurs chaudes uniquement** (pas de bleu, violet, prune pour les fonds/étiquettes). Un concept = une couleur (voir `CONCEPTS` dans `lib/engine.mjs`).
8. **Rien n'est mis en file de publication sans validation explicite de Foucauld** sur la planche (`planche.html`). Ne jamais lancer `enqueue.mjs` ni pousser `studio/queue/` sans son « ok ».
9. Ne jamais afficher, commiter ni copier `studio/.env` (clé d'accès Instagram).

## Semaine type (heure de Paris)
| Jour | Heure | Format |
|---|---|---|
| Lundi | 19:00 | Le Chiffre Fou ou Le Saviez-vous ? |
| Mardi | 12:30 | Idée reçue (illustrée) |
| Mercredi | 12:30 | Ce jour-là (histoire liée à la date) |
| Jeudi | 19:00 | Bêtes de scène (photos) ou OVNI |
| Vendredi | 12:30 | Les pépites (5 bonnes nouvelles vérifiées, photos pleine page) |
| Samedi | 12:30 | Ce jour-là ou L'objet qui a une histoire ; 21:00 citation (post image) |
| Dimanche | 19:00 | L'histoire vraie (fond noir, 10 slides) |
| Chaque soir | 21:00 (+22:30 certains jours) | Story : humeur, pensée du soir, question |
| 2 fois / semaine | 18:00 | Reel tiré d'un carrousel de la semaine précédente |

Les dates « Ce jour-là » doivent tomber le jour anniversaire exact (« il y a N ans jour pour jour »).

## Fichier d'une semaine : `semaines/<AAAA-Sxx>/posts.mjs`
Exemple complet : `semaines/2026-S45/posts.mjs`. Images dans `semaines/<semaine>/img/` (nom sans extension dans le code).
```js
import { ill, ph, band } from '../../lib/engine.mjs';
export default [{
  id: '2026-11-03-idee-recue-grande-muraille',   // minuscules et tirets, unique
  when: '2026-11-03T12:30:00+01:00',            // heure de Paris avec décalage (+01:00 l'hiver, +02:00 l'été)
  type: 'carousel',                              // carousel | image | story | reel
  concept: 'IDÉE REÇUE',                         // clé de CONCEPTS
  ia: true,                                      // illustrations IA -> mention ajoutée à la légende
  caption: `…\n\n#… #lefilon`,
  slides: [ … ],
}];
```
Types de slides (`k`) — `[mot]` = mot-clé coloré, `**gras**` :
- `cover` : `t`, `sub`, `size`, et soit `v: ill('nom')` (illustration), soit `v: ph('nom','crédit','center 40%')` (photo en bandeau), soit `full: 'nom'` + `fpos` + `fcredit` (photo pleine page), soit `opts: ['A…','B…']` (quiz).
- `text` : `t`, `p`, `size` — texte seul.
- `photo` : `t`, `p`, `v` (illustration sous le texte, ou photo en bandeau si `ph`).
- `big` : `lead`, `b` (le chiffre), `t`, `t2`, `size`, `v` facultatif.
- `fp` : photo pleine page intérieure (pépites) : `t`, `sub`, `full`, `fpos`, `fcredit`.
- `dark` : L'histoire vraie : `t`, `p`, `v: band('nom')` facultatif, `share: true` pour la slide à partager.
- `share` : `t`, `sub` — avant-dernière slide, texte seul.
- `end` : `src` — slide noire de fin (sources + « Illustrations générées par IA. » si besoin).
Posts du soir : `{ type: 'story', soir: { kind: 'humeur', lead, main } }`, `{ kind: 'pensee', n, a, b }`, `{ kind: 'question', q }` ; citation du samedi : `{ type: 'image', soir: { kind: 'citation', q, who, src }, caption }`. Reel : `{ type: 'reel', from: '<id du carrousel>', seconds: 2.6, caption }`.

## Commandes (depuis `studio/`)
- `node build.mjs semaines/<semaine>` : vérifie la charte, rend tout, écrit `planche.html` (l'ouvrir : `open semaines/<semaine>/planche.html`).
- `node tools/gemini-image.mjs semaines/<semaine> <nom> "<sujet>"` : génère une illustration (bloc de style ajouté automatiquement). Toujours regarder l'image produite (texte parasite, cadre, visage) avant de l'utiliser.
- `node enqueue.mjs semaines/<semaine>` : **après validation seulement** — copie dans `public/ig/` et crée `queue/*.json`. Puis commit + push du dépôt.
- `node publish.mjs check` : vérifie la clé Instagram et le quota.

La publication est faite par GitHub Actions (`.github/workflows/instagram.yml`) toutes les 15 min : elle publie les entrées `pending` dont l'heure est passée, une fois les images en ligne sur lefilon.media.
