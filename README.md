# QuizBlitz

A real-time multiplayer quiz platform. A host runs live quiz sessions; players
join from any device and compete simultaneously — Kahoot-style.

## Tech stack

| Layer | Technology |
|---|---|
| Mobile | Expo + React Native (iOS & Android) |
| Web portal | React + Vite |
| Backend | NestJS (Node.js) |
| Database | PostgreSQL 16 via TypeORM |
| Real-time | WebSockets via socket.io |
| Object storage | Cloudflare R2 (MinIO locally) |
| Containerisation | Docker + Docker Compose |

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| pnpm | 10.28.2 (`corepack enable && corepack prepare pnpm@10.28.2 --activate`) |
| Docker | 24+ with Compose v2 |

## Quick setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in every value. See **Environment variables** below for
what each section requires.

### 3. Start the stack

```bash
docker compose up --build
```

All five services start: `api`, `postgres`, `pgadmin`, `minio`, `mailpit`.
`minio-init` runs once to create and publicise the bucket, then exits — that is
expected.

### 4. Verify

| URL | What you should see |
|---|---|
| http://localhost:3000/health | `{ "status": "ok" }` |
| http://localhost:3000/api/docs | Swagger UI with all route groups |
| http://localhost:5050 | pgAdmin (DB_USER / DB_PASSWORD) |
| http://localhost:9001 | MinIO console (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY) |
| http://localhost:8025 | Mailpit — OTP emails appear here |

---

## Environment variables

Copy `.env.example` and fill in each section. The sections below explain what
needs to be set for local development.

### Database

```env
DB_NAME=quizblitz
DB_USER=quizblitz_user
DB_PASSWORD=<choose any password>
DB_HOST=postgres         # Docker service name
DB_PORT=5432
```

### pgAdmin

```env
PGADMIN_DEFAULT_EMAIL=admin@quizblitz.local
PGADMIN_DEFAULT_PASSWORD=<choose any password>
```

### JWT (RSA key pair)

Generate once and paste the flattened output into `.env`:

```bash
openssl genrsa -out /tmp/private.pem 2048
openssl rsa -in /tmp/private.pem -pubout -out /tmp/public.pem

# Flatten to single-line \n-separated strings:
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' /tmp/private.pem   # → JWT_PRIVATE_KEY
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' /tmp/public.pem    # → JWT_PUBLIC_KEY
```

```env
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Google OAuth

Create credentials at [console.cloud.google.com](https://console.cloud.google.com)
→ APIs & Services → Credentials → OAuth 2.0 Client IDs.

```env
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

For local dev without Google OAuth, dummy values keep the app running — only
the Google login button will fail.

### API

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Object storage

**Local dev (MinIO)** — uncomment the MinIO block in `.env.example`:

```env
R2_ACCOUNT_ID=local
R2_ACCESS_KEY_ID=minioadmin
R2_SECRET_ACCESS_KEY=minioadmin
R2_BUCKET_NAME=quizblitz-dev
R2_PUBLIC_URL=http://localhost:9000/quizblitz-dev   # browser address
R2_ENDPOINT=http://minio:9000                       # API → Docker network
```

`R2_ENDPOINT` and `R2_PUBLIC_URL` are intentionally different: the API
container reaches MinIO via the Docker service name (`minio`); your browser
reaches it via `localhost`.

**Production (Cloudflare R2)** — fill in the real values and leave
`R2_ENDPOINT` unset.

### Email

**Local dev (Mailpit)** — emails appear at http://localhost:8025, no account
needed:

```env
FROM_EMAIL=noreply@quizblitz.local
SMTP_HOST=mailpit       # Docker service name
SMTP_PORT=1025
```

**Production (Resend)** — remove `SMTP_HOST`/`SMTP_PORT` and set:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

---

## Useful commands

```bash
# Start the stack (rebuild if Dockerfile changed)
docker compose up --build

# Start without rebuild
docker compose up

# Stop everything
docker compose down

# Stop and delete volumes (wipes DB and MinIO data)
docker compose down -v

# Run API tests
pnpm --filter api test

# Run mobile tests
pnpm --filter @quizblitz/mobile test

# Run all tests across the monorepo
pnpm test

# Generate a DB migration
pnpm --filter api run migration:generate -- src/migrations/<MigrationName>

# Run pending migrations manually (also runs automatically on startup)
pnpm --filter api run migration:run
```

---

## Project structure

```
QuizBlitz/
├── apps/
│   ├── api/          NestJS backend
│   ├── mobile/       Expo React Native (iOS + Android)
│   └── web/          React + Vite web portal
├── packages/
│   └── shared/       Shared TypeScript types
├── docs/
│   └── LOCAL_DEV_NOTES.md
├── docker-compose.yml
├── pnpm-workspace.yaml
└── .env.example
```

Full project context, coding standards, and ticket workflow live in
`.claude/CLAUDE.md`.
