# Images à générer (Gemini)

Liste des illustrations manquantes. Un article dont l'image manque reste en `draft: true`.

## Modèle de prompt

> Génère une image : [SUJET]. Illustration à l'encre et aquarelle, carnet naturaliste, traits fins, ocre doré, vert sauge, bleu ardoise, fond papier crème uni, sujet centré avec de l'espace vide à gauche et à droite, format paysage 16:9, haute résolution, aucun texte.

## Règles

- Format paysage 16:9, au moins 1200 px de large (le build échoue en dessous).
- Fichier à déposer dans `src/assets/articles/<nom>.jpg`, puis à référencer dans le frontmatter : `image: ../../assets/articles/<nom>.jpg`.
- Ajouter `imageCredit: "Illustration générée par IA"` et un `imageAlt` descriptif.
- Réservé aux sujets intemporels (science, animaux, idées reçues). Une vraie actualité garde une vraie photo.

## En attente

Aucune image en attente : les 14 articles ont leur image, toutes en 1920 × 1072.

<!-- Modèle d'entrée :
### Titre de l'article
- Fichier attendu : `src/assets/articles/nom.jpg`
- Prompt : Génère une image : … (modèle ci-dessus)
-->
