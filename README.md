# MR - K Distribution

Site de distribution musicale indépendante — site public + espace admin.

## Stack

- **Next.js 16** (App Router) + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (composants)
- **Prisma ORM** + **SQLite** (dev) / **Turso** (prod Vercel)
- **Framer Motion** (animations)
- **Recharts** (graphiques admin)

## Démarrage local

```bash
# 1. Installer les dépendances
bun install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env : définissez ADMIN_PASSWORD et ADMIN_SESSION_SECRET
# Générer un secret : openssl rand -hex 32

# 3. Initialiser la base de données
bun run db:push

# 4. Lancer le serveur de développement
bun run dev
```

- Site public : http://localhost:3000
- Espace admin : http://localhost:3000/admin

## Déploiement en production (Vercel)

### ⚠️ Important : SQLite ne fonctionne pas sur Vercel

Vercel serverless a un filesystem **éphémère** (lecture seule, réinitialisé à chaque invocation). SQLite étant filesystem-based, les soumissions seraient perdues à chaque redémarrage.

**Solution recommandée : Turso** (SQLite over HTTP, free tier généreux)

### Étapes

1. **Forkez/poussez le code sur GitHub**

2. **Créez une base Turso**
   ```bash
   # Installez Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Authentifiez-vous
   turso auth login
   
   # Créez la base
   turso db create mr-k-distribution
   
   # Récupérez l'URL et le token
   turso db show mr-k-distribution --url
   turso db tokens create mr-k-distribution
   ```

3. **Importez le schéma Prisma dans Turso**
   ```bash
   # Installez le client libsql
   bun add @libsql/client
   
   # Poussez le schéma
   DATABASE_URL="libsql://..." bun run db:push
   ```

4. **Connectez Vercel à votre repo GitHub**
   - Importez le repo sur https://vercel.com/new
   - Framework preset : Next.js (auto-détecté)

5. **Configurez les variables d'environnement sur Vercel**
   - `DATABASE_URL` = votre URL Turso (`libsql://...`)
   - `DATABASE_AUTH_TOKEN` = votre token Turso
   - `ADMIN_PASSWORD` = un mot de passe fort (12+ caractères)
   - `ADMIN_SESSION_SECRET` = un secret de 32+ caractères (`openssl rand -hex 32`)
   - `NODE_ENV` = `production`

6. **Déployez**
   - Vercel build automatiquement à chaque `git push`
   - Build command : `next build` (auto)
   - Output : `.next` (auto)

## Sécurité

### Authentification admin
- Mot de passe stocké dans `ADMIN_PASSWORD` (env var, jamais dans le code)
- Sessions HMAC-SHA256 signées avec `ADMIN_SESSION_SECRET`
- Cookies `httpOnly` + `secure` (en production)
- **Rate limiting** : 5 tentatives de login / minute / IP (in-memory)
- Comparaison constant-time pour éviter les timing attacks

### Pour changer le mot de passe admin
1. Modifiez `ADMIN_PASSWORD` dans les variables d'environnement (Vercel dashboard)
2. Redéployez (ou attendez le redéploiement auto)
3. Les sessions existantes restent valides jusqu'à expiration (12h)

### Pour générer un secret de session
```bash
openssl rand -hex 32
```

## Structure du projet

```
src/
├── app/
│   ├── layout.tsx              # Layout racine (fonts, metadata)
│   ├── page.tsx                # Page d'accueil (site public)
│   ├── globals.css             # Styles globaux + thème
│   ├── admin/
│   │   └── page.tsx            # Espace admin (login + dashboard)
│   └── api/
│       ├── admin/
│       │   ├── login/route.ts  # POST login (HMAC + rate limit)
│       │   └── logout/route.ts # POST logout
│       └── submissions/
│           ├── route.ts        # GET (auth) + POST (public)
│           └── [id]/route.ts   # PATCH + DELETE (auth)
├── components/
│   ├── site/                   # Composants site public
│   │   ├── header.tsx, hero.tsx, about.tsx, platforms.tsx, ...
│   │   ├── plan-submission-dialog.tsx  # Formulaire multi-étapes
│   │   ├── floating-whatsapp.tsx       # Bouton WhatsApp flottant
│   │   ├── vinyl-record.tsx            # Vinyle animé SVG
│   │   └── music-visualizer.tsx        # Visualiseur (equalizer + vinyle)
│   └── admin/                  # Composants espace admin
│       ├── admin-login.tsx     # Page de connexion (sans indice démo)
│       ├── admin-shell.tsx     # Shell avec sidebar (4 vues)
│       ├── admin-dashboard.tsx # Conteneur + state
│       ├── shared/ui.tsx       # KpiCard, SectionCard, StatusBadge
│       └── views/
│           ├── overview-view.tsx   # Vue d'ensemble (stats réelles)
│           ├── demandes-view.tsx   # Tableau des soumissions
│           ├── revenue-view.tsx    # Analyse financière (stats réelles)
│           └── artistes-view.tsx   # Classement artistes (stats réelles)
└── lib/
    ├── auth.ts                 # HMAC sessions + rate limiting
    ├── admin-types.ts          # Types + helpers formatage
    ├── db.ts                   # Prisma client
    └── utils.ts                # cn() helper
```

## Scripts

```bash
bun run dev          # Serveur de développement (port 3000)
bun run build        # Build de production
bun run start        # Serveur de production (après build)
bun run lint         # Vérification ESLint
bun run db:push      # Synchroniser le schéma Prisma avec la DB
bun run db:generate  # Régénérer le client Prisma
```

## Notes

- **Aucune donnée mockée** dans l'admin : toutes les statistiques sont calculées à partir des soumissions réelles en base.
- **Empty states** : l'admin affiche des messages "Aucune donnée pour le moment" tant qu'aucune soumission n'est reçue.
- **Brand assets** : logo, affiche et capture des plateformes sont dans `public/brand/`.
- **WhatsApp** : le numéro `2250157307677` est utilisé partout (à remplacer par le vrai numéro si différent).
