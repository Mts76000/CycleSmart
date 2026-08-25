# CycleSmart

Application PWA qui calcule le meilleur moment pour lancer tes machines (lave-linge, lave-vaisselle, etc.) pendant les heures creuses.

- Calcule le créneau idéal en fonction de la durée du programme, des heures creuses et du mode de départ différé.
- Fonctionne en mode invité, avec une synchronisation optionnelle en ligne.
- Design mobile-first, installable comme application native (PWA).



## Fonctionnalités

- **Calculateur de créneaux** : choisis un programme ou règles la durée manuellement, l'application indique quand démarrer le cycle.
- **Heures creuses** : ajoute tes plages d'heures creuses personnalisées.
- **Machines et programmes** : gère plusieurs appareils et programmes avec durée, pas et mode (départ/fin).
- **Mode invité** : tout marche sans compte, les données restent dans le navigateur.
- **Synchronisation** : les comptes connectés peuvent sauvegarder leurs réglages sur PostgreSQL.
- **PWA** : manifest, service worker et cache pour une utilisation hors ligne.
- **Sécurité** : sessions JWT sécurisées, rate limiting, CSP, validation Zod.

## Stack technique

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router)
- **UI** : [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Base de données** : PostgreSQL via [pg](https://node-postgres.com/)
- **Authentification** : sessions signées avec [Jose](https://github.com/panva/jose), mots de passe hashés avec [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Emails** : [Resend](https://resend.com/)
- **Validation** : [Zod 4](https://zod.dev/)
- **Tests** : [Vitest](https://vitest.dev/)

## Architecture

```
app/
  (auth)/        # pages publiques : connexion, inscription
  (main)/        # pages authentifiées : calculer, créneaux, machines, profil
  api/           # routes API REST
components/      # composants partagés
lib/
  cycle-store.tsx  # état global (React Context) + logique de calcul pure
  db.ts            # connexion et schéma PostgreSQL
  session.ts       # gestion des sessions
public/sw.js     # service worker pour l'offline
```

La logique de calcul est isolée dans `lib/cycle-store.tsx` : elle est testée directement avec Vitest, sans avoir besoin de monter React.

## Démarrage local

### Prérequis

- Node.js 20+
- npm
- Docker (pour PostgreSQL local, optionnel)

### Installation

```bash
npm install
cp .env.example .env.local
```

Configure les variables dans `.env.local` :

```env
# Base de données (Docker)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=cyclesmart
POSTGRES_USER=cyclesmart
POSTGRES_PASSWORD=cyclesmart_local_password
POSTGRES_SSL=false

# Authentification
SESSION_SECRET=<secret-32-bytes>
# openssl rand -base64 32
```

### Lancer Postgres

```bash
npm run db:up
```

### Lancer l'application

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm run test
```

Pour lancer en mode watch :

```bash
npm run test:watch
```

## Vérification

```bash
npm run lint
npm run build
```



## PWA et offline

Le service worker (`public/sw.js`) précache les pages principales et les actifs statiques. En mode hors ligne :

- les pages sont servies depuis le cache,
- les appels `GET /api/*` retournent la dernière réponse en cache si le réseau est indisponible,
- les modifications sont stockées dans `localStorage` et synchronisées automatiquement quand la connexion revient.

## Licence

Projet personnel — tous droits réservés.
