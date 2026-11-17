# Deckforge

Compare deux versions d'un deck Magic (ton deck d'origine et ton deck modifié), valide carte par carte
les ajouts (➜) et les retraits (✖), puis exporte le deck final au format Archidekt.

- **Accueil** (`/`) : présentation du site ; les boutons s'adaptent si on est connecté.
- **Comparaison rapide** (`/comparer`) : sans compte, tout reste dans le navigateur.
- **Mes decks** (`/decks`) : avec un compte, chaque deck garde toutes ses versions (v1, v2…) et
  les validations de chaque comparaison sont enregistrées en base.
- **Liste de souhaits** (`/souhaits`) : avec un compte, les cartes qu'on n'a pas encore (noms anglais
  ou français). Un lien de partage permet de la montrer à n'importe qui, sans compte
  (`/souhaits/<jeton>`) ; on peut le remplacer ou le désactiver.

En ligne : https://deckforge-magic.vercel.app

## Mettre en ligne une nouvelle version

Chaque envoi sur la branche `main` de GitHub met le site à jour automatiquement (Vercel).
Pour mettre en ligne sans passer par GitHub :

```bash
npx vercel deploy --prod
```

Les variables d'environnement sont déjà réglées dans le projet Vercel « deckforge ».

## Lancer le projet

Node 24 est nécessaire (voir `.nvmrc`) :

```bash
nvm use
npm install
npm run dev
```

Puis ouvre l'adresse affichée (http://localhost:3000 par défaut).

Les variables d'environnement vont dans `.env.local` (non versionné).

| Commande              | Rôle                                                  |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Site en mode développement                            |
| `npm test`            | Tests de la logique (Vitest)                          |
| `npm run lint`        | Vérification du code (ESLint)                         |
| `npm run typecheck`   | Vérification des types (TypeScript)                   |
| `npm run build`       | Version de production                                 |
| `npm run db:generate` | Crée une migration SQL après un changement de schéma  |
| `npm run db:migrate`  | Applique les migrations sur la base                   |

## Organisation du code

```
src/
├─ app/                     Pages Next.js
│  ├─ page.tsx              Page d'accueil
│  ├─ comparer/             Comparaison rapide (sans compte)
│  ├─ auth/                 Connexion, inscription
│  ├─ decks/                Mes decks, détail d'un deck, comparaison de deux versions
│  │  └─ actions.ts         Actions serveur (créer, ajouter une version, enregistrer…)
│  ├─ souhaits/             Ma liste de souhaits, et la page publique d'une liste partagée
│  └─ api/auth/             Passerelle vers le service de comptes
├─ components/
│  ├─ comparator/           Comparateur : ComparisonView (le cœur), version rapide et version sauvegardée
│  ├─ cards/                Éléments de carte : image, tuile, ligne, bouton ➜/✖
│  ├─ decks/                Formulaires et éléments des pages « Mes decks »
│  ├─ wishlist/             Ajout de cartes, grille de la liste, encadré de partage
│  ├─ auth/                 Formulaire de connexion / inscription
│  └─ layout/               En-tête du site
├─ db/                      Base de données (Drizzle) : schéma, connexion, lectures
├─ hooks/                   État côté navigateur, chargement Scryfall, préférences d'affichage
├─ lib/                     Logique pure, sans React, couverte par les tests
│  ├─ auth/                 Comptes : serveur, navigateur, utilisateur connecté
│  ├─ parse.ts, diff.ts…    Lecture des listes, comparaison, exports, statistiques
│  └─ __tests__/            Tests (dont tes vrais decks dans exemples/)
└─ proxy.ts                 Protège /decks et /souhaits : redirige vers la connexion
drizzle/                    Migrations SQL
exemples/                   Listes de decks d'exemple
legacy/                     Ancienne version en un seul fichier HTML
```

Chaque lecture et écriture en base filtre sur l'utilisateur connecté (`src/db/queries.ts`,
`src/app/decks/actions.ts`) : un compte ne voit jamais les decks d'un autre.

Les données des cartes et les images viennent de [Scryfall](https://scryfall.com/docs/api).
