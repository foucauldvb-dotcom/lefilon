---
description: Prépare une semaine complète de contenus Instagram du Filon (recherche, vérification, rendu, planche à valider)
argument-hint: "[semaine, ex. 2026-S46 ou « 9 au 15 novembre »]"
---

Prépare la semaine Instagram du Filon : $ARGUMENTS

Lis d'abord `studio/CLAUDE.md` et `studio/CHARTE.md`, puis suis ces étapes **dans l'ordre**, en posant tes questions à Foucauld au fur et à mesure (il préfère le mode question-réponse, une étape à la fois) :

1. **Planning.** Calcule les dates exactes de la semaine et propose le planning selon la semaine type (sujet par créneau, concept, visuel : illustration ou photo). Vérifie les dates anniversaires pour « Ce jour-là ». Évite les sujets déjà traités (regarde `studio/queue/` et les dossiers `studio/semaines/`). Attends sa validation du planning.
2. **Recherche et vérification.** Pour chaque sujet retenu, ouvre au moins 2 sources fiables (WebFetch) et note chaque fait avec sa source. Pour « Les pépites », cherche 7 vraies bonnes nouvelles des 7 derniers jours, pas de politique partisane, et laisse-le en choisir 5.
3. **Textes.** Écris `studio/semaines/<semaine>/posts.mjs` : 8 à 10 slides par carrousel (couverture sans spoiler, une idée par slide, chiffre révélé en grand, slide « À partager », slide de fin avec sources), légendes, stories du soir, citation du samedi (auteur classique à l'attribution sûre uniquement), 2 Reels.
4. **Visuels.**
   - Illustrations : si `GEMINI_API_KEY` est dans `studio/.env`, génère-les avec `node tools/gemini-image.mjs` puis **regarde chaque image** (pas de texte, pas de cadre, pas de visage réel) ; sinon donne-lui les prompts prêts à copier dans Gemini (commençant par « Génère une image : »).
   - Photos : donne-lui la liste précise des photos à trouver (sites, mots-clés, cadrage voulu) et demande le nom du photographe ; il les dépose dans `studio/semaines/<semaine>/img/`. Vérifie que chaque photo montre bien le bon sujet (ex. un quokka n'est pas un wombat).
5. **Rendu.** `cd studio && node build.mjs semaines/<semaine>`, corrige toute erreur, regarde toi-même les slides produites (débordements de texte, mots orphelins, images mal cadrées), puis `open semaines/<semaine>/planche.html` et demande-lui de valider.
6. **Après son « ok » explicite uniquement** : `node enqueue.mjs semaines/<semaine>`, puis commit (« Instagram : semaine <semaine> ») et push sur main. Rappelle-lui ce qui reste manuel : stickers de question en story, musique des Reels si souhaitée.
