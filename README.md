# CycleSmart

Calculateur d'heures creuses : indique la durée de ton cycle (lave-linge, lave-vaisselle...) et
tes plages d'heures creuses, CycleSmart te dit immédiatement le meilleur moment pour lancer ta
machine — en local (invité) ou synchronisé sur tous tes appareils une fois connecté.

Application installable en PWA (icône sur l'écran d'accueil, mode standalone).

## Fonctionnalités

- **Calculateur** (`/calculer`) : durée du cycle + plages d'heures creuses → prochain créneau
  optimal (plusieurs modes de calcul).
- **Créneaux** (`/creneaux`) : gestion des plages d'heures creuses.
- **Machines** (`/machines`) : appareils enregistrés (durée de cycle par défaut).
- **Profil** (`/profil`) : compte, synchronisation, session.
- Mode invité (réglages en local storage) ou compte (email/password ou Google), avec
  synchronisation entre appareils une fois connecté.
- Bandeau d'installation PWA (Android : `beforeinstallprompt` ; iOS : instructions
  "Partager → Sur l'écran d'accueil"), affiché après quelques visites (voir
  `components/pwa-install-prompt.tsx`).

Bâti sur le socle [starter-nextjs](https://github.com/Mts76000/starter-nextjs) : authentification,
format API standardisé, transactions, audit log, RGPD, analytics, email transactionnel, anti-bot,
sécurité HTTP, SEO/PWA, tests, CI/CD, qualité/DX. Voir [AGENTS.md](./AGENTS.md) pour les principes
de conception détaillés du socle (lu automatiquement par les agents IA).

## Démarrage

1. `npm install`.
2. Copier les fichiers d'environnement et les remplir (voir ci-dessous) :
   ```bash
   cp .env.example .env.local
   cp .env.test.example .env.test
   ```

## Variables d'environnement

| Variable                                                  | Où l'obtenir                                                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                            | Postgres local (Docker, voir ci-dessous) ou Coolify en prod                                                                           |
| `BETTER_AUTH_SECRET`                                      | `openssl rand -base64 32`                                                                                                             |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`               | [Google Cloud Console → Identifiants OAuth](https://console.cloud.google.com/apis/credentials)                                        |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL`                            | URL complète du script de ton instance Umami self-hosted (ex : `https://umami.example.com/script.js`)                                 |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`                            | Dashboard Umami self-hosted                                                                                                           |
| `RESEND_API_KEY`                                          | [resend.com/api-keys](https://resend.com/api-keys)                                                                                    |
| `CONTACT_EMAIL`                                           | Adresse admin (from + to des notifications)                                                                                           |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)                                               |
| `CRON_SECRET`                                             | `openssl rand -hex 32`                                                                                                                |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`     | Optionnel en dev. Requis en prod pour un rate limiting partagé entre instances (sinon fallback mémoire, non fiable en multi-instance) |
| `NEXT_PUBLIC_IS_PREVIEW`                                  | À mettre à `true` uniquement sur l'environnement preview/staging Coolify                                                              |
| `NEXT_PUBLIC_BUYMEACOFFEE_SLUG`                           | Optionnel. Ton slug sur buymeacoffee.com, affiche un bouton de soutien sur le profil                                                  |

`lib/env.ts` valide toutes ces variables au démarrage (Zod) et plante immédiatement si une
variable obligatoire manque.

### Délivrabilité email (Resend)

Configurer les enregistrements DNS **SPF**, **DKIM** et **DMARC** du domaine d'envoi dans le
dashboard Resend avant la mise en prod, sous peine de finir en spam.

### Tester les flows email sans compte Resend (dev)

Sans `RESEND_API_KEY` valide, l'envoi échoue silencieusement (comportement voulu, voir
"Échec Resend jamais bloquant"). En développement (`NODE_ENV=development`), le lien
(vérification email, reset password, changement d'email) est loggé dans la console du
serveur (`npm run dev`) — copiez-le depuis là pour tester le flow sans vrai email.

## Base de données — dev, test, prod

- **Dev** : Postgres local via Docker.

  ```bash
  docker compose up -d postgres
  npm run db:migrate
  npm run db:seed
  ```

  `DATABASE_URL` pointe vers `localhost:5434` (port choisi pour éviter les conflits avec
  d'autres projets Docker sur la même machine).

- **Test** : base Postgres **dédiée et séparée**, jamais partagée avec dev/prod.

  ```bash
  docker compose up -d postgres-test
  ```

  `DATABASE_URL` dans `.env.test` pointe vers `localhost:5433`. Les scripts de test
  (`tests/setup.ts`) refusent de démarrer si `DATABASE_URL` ne contient pas explicitement
  "test" — garde-fou contre l'écrasement accidentel de données réelles.

- **Prod** : conteneur Postgres Coolify séparé, URL interne Docker fournie par Coolify et
  configurée côté Coolify (jamais committée).

### Scripts

```bash
npm run db:generate   # génère une migration à partir du schéma Drizzle
npm run db:migrate    # applique les migrations
npm run db:push       # push direct du schéma (dev rapide, sans migration versionnée)
npm run db:studio     # explorateur Drizzle Studio
npm run db:seed       # données de test (utilisateur + admin de test)
npm run db:reset      # reset complet (drop + migrate + seed), à relancer à volonté en dev
```

## Lancer le projet en local

```bash
npm install
docker compose up -d postgres postgres-test
cp .env.example .env.local && cp .env.test.example .env.test
# éditer .env.local avec vos vraies clés (Google OAuth, Resend, Turnstile, Umami...)
npm run db:migrate
npm run db:seed
npm run dev
```

## Tests

```bash
npm run test              # unit (Vitest)
npm run test:coverage     # unit + couverture (seuil 70%)
npm run test:integration  # intégration, contre la base de test (docker compose up -d postgres-test)
npm run test:e2e          # e2e (Playwright, démarre son propre serveur avec NODE_ENV=test)
npm run test:e2e:ui       # e2e en mode UI interactif
```

Avant tout commit ou déploiement :

```bash
npm run check   # format:check → lint → typecheck → test
```

## Déploiement (Coolify)

- `Dockerfile` multi-stage (build + image de production légère, `output: "standalone"`).
- `GET /api/health` vérifie l'app + la connexion BDD (utilisé par le `HEALTHCHECK` Docker).
- Les migrations Drizzle s'exécutent automatiquement au démarrage du conteneur
  (`drizzle/migrate-prod.mjs`, avant `node server.js` dans le `CMD` du Dockerfile) : chaque
  déploiement converge le schéma prod sans étape manuelle.
- **Environnement preview/staging** : déployer une branche dédiée sur un service Coolify
  séparé, avec `NEXT_PUBLIC_IS_PREVIEW=true` — `app/robots.ts` bloque alors totalement
  l'indexation sur cet environnement.
- Tâches planifiées : voir `app/api/cron/cleanup-expired-tokens/route.ts` comme exemple à
  copier, protégé par `CRON_SECRET`, pensé pour Coolify Scheduled Tasks
  (`POST` + `Authorization: Bearer <CRON_SECRET>`).

## Qualité / CI

- ESLint (+ `eslint-plugin-jsx-a11y`) + Prettier + Husky + lint-staged + commitlint (commits
  conventionnels).
- CI GitHub Actions (`.github/workflows/ci.yml`) : lint, typecheck, `npm audit`, tests
  unit/intégration/e2e, seuil de couverture, scan de secrets (gitleaks).
- Dependabot pour les mises à jour de dépendances (npm, GitHub Actions, Docker).
