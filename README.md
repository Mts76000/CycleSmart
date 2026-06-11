# CycleSmart

Application Next.js pour calculer le bon moment de lancement des machines pendant les heures creuses.

## Demarrage local

```bash
npm install
cp .env.example .env.local
npm run db:up
npm run dev
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000).

## PostgreSQL local

Le fichier `compose.yaml` lance un PostgreSQL local avec ces valeurs :

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=cyclesmart
POSTGRES_USER=cyclesmart
POSTGRES_PASSWORD=cyclesmart_local_password
POSTGRES_SSL=false
```

Ajoute aussi un secret de session dans `.env.local` :

```bash
openssl rand -base64 32
```

Puis colle le resultat dans :

```env
SESSION_SECRET=<secret-genere>
```

Commandes utiles :

```bash
npm run db:up
npm run db:logs
npm run db:down
```

## Verification

```bash
npm run lint
npm run build
```
