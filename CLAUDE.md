# Le Filon

Site du média **Le Filon** (https://lefilon.media) : un média français positif et viral. Insolite, bonnes nouvelles, animaux, chiffres fous, argent pratique.
Promesse : « On creuse Internet pour vous et on ne garde que les pépites. »
Instagram : https://www.instagram.com/lefilon.media/

## Technique

- Site **Astro statique**, hébergé sur un mutualisé OVH (Apache), déployé par GitHub Actions (FTP) **à chaque push sur `main`**. Un push = une mise en ligne.
- **Node 22 obligatoire** (`.nvmrc`). Le build échoue avec Node 20 : `nvm use` avant toute commande.
- `npm run build` enchaîne : couvertures typographiques, `astro check`, `astro build`, index de recherche Pagefind.
- `npm run dev` pour le serveur local. La recherche ne fonctionne qu'après un build (l'index est dans `dist/pagefind/`).

## Charte

- Police : **Sora** (400, 600, 800), sous-ensemble latin, servie en local.
- Or `#F5B800`, noir `#16130E`, fond clair `#F3F0E8`. Variables CSS dans `src/styles/global.css`.
- Sur fond noir, le contour de focus passe en or.

## Les 6 rubriques

Définies dans `src/config/rubriques.ts` (le slug fait partie de l'URL, ne pas le changer).

| Slug | Nom | Contenu |
|---|---|---|
| `pepites` | Pépites | Bonnes nouvelles |
| `ovni` | OVNI | Insolite |
| `betes-de-scene` | Bêtes de scène | Animaux |
| `chiffre-fou` | Le Chiffre Fou | Chiffres étonnants |
| `bon-filon` | Bon Filon | Argent et vie pratique |
| `le-saviez-vous` | Le Saviez-vous ? | Anecdotes, culture générale |

Le champ optionnel `intro` d'une rubrique affiche 2-3 phrases en haut de sa page.

## Articles

Un fichier Markdown par article dans `src/content/articles/`. Le nom du fichier est l'identifiant et le slug : `/<rubrique>/<nom-du-fichier>/`. Schéma dans `src/content.config.ts`.

```yaml
title: "…"            # 90 caractères maximum
description: "…"      # 160 caractères maximum (sert de chapô et de meta description)
date: 2026-10-09T08:00:00+02:00
updatedDate: …        # optionnel ; affiche « Mis à jour le … » et alimente dateModified
rubrique: pepites
image: ../../assets/articles/nom.jpg   # au moins 1200 px de large, sinon le build échoue
imageAlt: "…"         # obligatoire avec image
imageCredit: "…"      # affiché sous l'image principale
coverText: "1494"     # à la place d'image : couverture typographique générée
coverSub: "…"
sources:              # au moins une
  - name: "…"
    url: "https://…"
voirAussi:            # optionnel, 3 au plus : identifiants d'articles proches (encart « Dans le même filon »)
  - autre-article
author: "La rédaction"
draft: true
```

- Un article est en ligne s'il a `draft: false` **et** une date passée. Un article daté dans le futur n'apparaît qu'au premier build après sa date (pas de build programmé pour l'instant).
- Brouillons et articles futurs sont exclus partout : pages, RSS, sitemap, recherche.
- **Typographie** : écrire avec des espaces simples et des apostrophes droites. Les espaces insécables (avant `: ; ! ?`, dans `« »`, dans `3 000`, avant `%`) et les apostrophes courbes sont ajoutées au build par `src/lib/typo.ts`.
- Ne pas terminer un article par un appel à suivre Instagram : le bloc « Suivez-nous sur Instagram » est ajouté automatiquement.

## Images

- Format paysage **16:9, au moins 1200 px de large** (indispensable pour Google Discover).
- Optimisation automatique au build : AVIF, WebP, tailles responsives. Déposer simplement le JPEG dans `src/assets/articles/`.
- Le dossier `assets-source/` contient les fichiers bruts ; il n'est pas versionné (sauf les logos).

### Illustrations générées par IA (Gemini)

- Direction artistique unique : encre et aquarelle, carnet naturaliste, traits fins, palette ocre doré / vert sauge / bleu ardoise, fond papier crème uni, aucun texte dans l'image.
- Toute image générée par IA porte `imageCredit: "Illustration générée par IA"`.
- Réservées aux **sujets intemporels** (science, animaux, idées reçues). Une vraie actualité garde une vraie photo.
- Image manquante : l'article reste en `draft: true` et le prompt est ajouté à `docs/images-a-generer.md` avec le nom de fichier attendu. Modèle de prompt :

> Génère une image : [SUJET]. Illustration à l'encre et aquarelle, carnet naturaliste, traits fins, ocre doré, vert sauge, bleu ardoise, fond papier crème uni, sujet centré avec de l'espace vide à gauche et à droite, format paysage 16:9, haute résolution, aucun texte.

### Image de partage

Une carte 1200 × 630 (rubrique, titre, logo) est générée par article dans `/og/<identifiant>.jpg` (`src/lib/og.ts`). Elle sert à `og:image`. La photo de l'article reste dans le NewsArticle (formats 16:9, 4:3, 1:1) pour Google Discover.

## Circuit de publication

1. Article écrit en `draft: true`.
2. Relecture par l'éditeur.
3. `draft: false` : **uniquement sur demande explicite de l'éditeur**.
4. `npm run build`, commit, puis push **après accord**.

## Règles éditoriales

- N'utiliser que des faits vérifiés et sourcés. Aucun chiffre ni citation inventés.
- Réécrire avec ses propres mots, ne jamais copier une source.
- Titre accrocheur mais vrai, 90 caractères maximum. Description de 160 caractères maximum.
- Typographie française (gérée au build, voir plus haut).
- Vérifier chaque URL de `sources`. Britannica, Smithsonian, WWF, UICN, Investopedia et l'US Forest Service bloquent les robots (403) : contrôler par recherche web ou demander à l'éditeur.
- Ne pas modifier le fond d'un texte sans le signaler.

## À ne pas faire sans accord explicite

- Ajouter un outil de statistiques ou quoi que ce soit qui dépose des cookies.
- Activer la publicité (`src/config/ads.ts`).
- Passer un article en `draft: false`.
- Pousser sur GitHub.

## Sécurité : `.htaccess` et CSP

- `public/.htaccess` porte la compression, le cache, HSTS (un an, sans `includeSubDomains` ni `preload`) et la Content-Security-Policy.
- Les scripts intégrés aux pages sont autorisés par empreinte : `integrations/csp.mjs` les calcule au build et remplace le marqueur `__SCRIPT_HASHES__`. Rien à maintenir à la main.
- `'wasm-unsafe-eval'` est indispensable à la recherche Pagefind. `style-src 'unsafe-inline'` est voulu : le CSS est intégré au HTML.
- **Publicité : le jour où elle est activée (AdSense, puis Prebid / Google Ad Manager), la CSP devra être élargie** (`script-src`, `img-src`, `connect-src`, `frame-src` pour les domaines de la régie), et la politique de confidentialité ainsi que le consentement aux cookies devront être revus. Sans cela, les scripts publicitaires seront bloqués.
- Pour tester la CSP en local : servir `dist/` avec l'Apache de macOS (`/usr/sbin/httpd`, `AllowOverride All`), en retirant `upgrade-insecure-requests` de la copie.

## Podcast

- Lecteur Soundcast : `src/components/PodcastPlayer.astro`, réglages dans `src/config/podcast.ts`. Il affiche toujours le dernier épisode.
- Deux formats, un seul par page : `layout="horizontal"` (544 × 176) sur l'accueil, `layout="vertical"` (265 × 490) en fin d'article.
- Il n'est chargé **qu'au clic** : le lecteur appelle Soundcast et Google Fonts, donc rien ne doit partir avant l'action du visiteur (c'est ce que dit la politique de confidentialité). Ne pas le remplacer par une iframe chargée d'office sans accord.
- La CSP l'autorise par `frame-src https://player.soundcast.io`.

## Repères dans le code

- `src/lib/articles.ts` : chargement des articles, filtre brouillons et dates, contrôle des images, articles liés.
- `src/lib/seo.ts` et `src/components/Seo.astro` : balises et données structurées.
- `src/pages/[rubrique]/[slug].astro` : page article.
- `integrations/nettoyage.mjs` : retire de `dist/` les images non référencées.
- `scripts/generate-covers.mjs` : couvertures typographiques (`coverText`).
