# Le Filon Studio

Production et publication automatique des contenus Instagram de @lefilon.media.

```
Claude Code (/semaine)  →  studio/semaines/<semaine>/  →  planche.html (tu valides)
        →  node enqueue.mjs  →  public/ig/ + studio/queue/  →  git push
        →  déploiement du site (images en ligne)  →  GitHub Actions publie à l'heure prévue
```

## Installation (une seule fois)
1. Dans le Terminal :
   ```bash
   cd /Users/foucauld/claude-perso/lefilon.media/studio
   npm install
   npx playwright install chromium
   brew install ffmpeg        # pour les Reels (facultatif)
   cp .env.example .env && open -e .env   # colle IG_ACCESS_TOKEN (et GEMINI_API_KEY si tu en as une)
   node publish.mjs check     # doit afficher : Compte : lefilon.media
   ```
2. Sur GitHub, dans le dépôt du site : **Settings → Secrets and variables → Actions → New repository secret** :
   - `IG_USER_ID` = `17841441849015332`
   - `IG_ACCESS_TOKEN` = la clé (la même que dans `.env`)
3. Onglet **Actions** → « Instagram – publication programmée » → **Run workflow** → action `check`. Le journal doit afficher `Compte : lefilon.media`.

## Chaque semaine
Dans Claude Code, à la racine du site : `/semaine 2026-S46`. Claude fait la recherche, les textes et les visuels, puis ouvre la planche. Tu valides, il met en file d'attente et pousse. C'est tout.

## Suivi
- `studio/queue/*.json` : un fichier par publication, avec son statut (`pending`, `published` et le lien du post, `failed` et l'erreur, `missed`).
- Onglet **Actions** sur GitHub : journal de chaque passage.
- Pour annuler une publication à venir : supprime son fichier dans `studio/queue/`, puis commit et push.

## Clé d'accès
Elle est valable 60 jours et prolongée automatiquement chaque lundi. Si le journal affiche « NOUVELLE clé » ou une erreur d'autorisation, régénère-la sur developers.facebook.com (app Le Filon Studio → Configuration de l'API avec la connexion Instagram → Générer un token), puis mets à jour le secret GitHub et `studio/.env`.

## Limites connues
- L'API ne permet pas d'activer l'étiquette « IA » d'Instagram : la mention est ajoutée à la légende et à la slide de fin.
- Pas de musique Instagram ni de stickers (questions, sondages) via l'API : ajoute-les depuis l'app si besoin.
- GitHub peut lancer la tâche avec quelques minutes de retard. Au-delà de 12 h de retard, un post n'est pas publié (statut `missed`).
