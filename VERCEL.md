# Despliegue en Vercel

Este repo tiene **dos aplicaciones**: frontend (Next.js) y backend (NestJS). En Vercel conviene crear **dos proyectos** apuntando al mismo repositorio, con **Root Directory** distinto en cada uno.

## 1. Base de datos

Usá un PostgreSQL administrado compatible con serverless:

- [Neon](https://neon.tech), [Supabase](https://supabase.com), [Vercel Postgres](https://vercel.com/storage/postgres), etc.

Definí `DATABASE_URL` en el proyecto **backend**. En producción, activá migraciones o `ALLOW_SYNC=true` solo si entendés el riesgo (ver `DEPLOY.md` / `backend/.env.example`).

## 2. Proyecto backend (API)

1. [Vercel](https://vercel.com) → **Add New Project** → importá el repo.
2. **Root Directory**: `backend`
3. Framework Preset: **Other** (Vercel detectará `vercel.json`).
4. **Build Command**: `npm run build` (ya está en `backend/vercel.json`).
5. **Output**: no aplica (función serverless en `api/index.js`).
6. Variables de entorno: copiá desde `backend/.env.vercel.example` y completá al menos:
   - `DATABASE_URL`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `FRONTEND_URL` → URL final del frontend (ej. `https://tu-app.vercel.app` o tu dominio).
   - `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` (para seed / admin).
7. Para **Preview Deployments** del frontend con URL distinta, usá `CORS_ALLOW_VERCEL_APP=true` o sumá orígenes en `CORS_EXTRA_ORIGINS`.

Tras el deploy, la API quedará en una URL tipo `https://tu-api.vercel.app`. Los endpoints siguen bajo prefijo **`/api`** (ej. `POST /api/auth/register`).

### Límites serverless

- **Cold start**: la primera petición puede tardar varios segundos (Nest + TypeORM).
- **Tiempo máximo** de la función: 60 s (configurado en `backend/vercel.json`; en plan Hobby el máximo puede ser menor — revisá [límites](https://vercel.com/docs/functions/limitations)).
- **Conexiones DB**: en alto tráfico conviene pooler (Neon pooler, PgBouncer) y revisar límites de conexiones.

Si necesitás un API siempre caliente o sin cold start, seguí usando **Fly.io** u otro contenedor solo para el backend y dejá solo el frontend en Vercel.

## 3. Proyecto frontend (Next.js)

1. **Add New Project** → mismo repo.
2. **Root Directory**: `frontend`
3. Framework: **Next.js** (automático).
4. Variables de entorno (ver `frontend/.env.vercel.example`):
   - `NEXT_PUBLIC_API_URL` → `https://tu-api.vercel.app/api` (la URL del backend **con** `/api` al final).
   - `NEXT_PUBLIC_APP_URL` → URL pública del sitio (tu dominio o `https://tu-app.vercel.app`).
   - `NEXT_PUBLIC_APP_NAME` (opcional).

`next.config.mjs` desactiva `output: 'standalone'` cuando `VERCEL=1`, que es lo correcto para el build de Vercel.

## 4. Dominio custom

- Frontend: dominio principal en el proyecto Next.
- Backend: si usás `api.tudominio.com`, configurá el dominio en el proyecto backend y actualizá `NEXT_PUBLIC_API_URL` y `FRONTEND_URL` con HTTPS y sin barra final incorrecta.

## 5. Checklist rápido

| Dónde | Variable | Ejemplo |
|--------|-----------|---------|
| Backend | `FRONTEND_URL` | `https://mercado.vercel.app` |
| Backend | `DATABASE_URL` | `postgresql://...` |
| Frontend | `NEXT_PUBLIC_API_URL` | `https://xxx.vercel.app/api` |
| Frontend | `NEXT_PUBLIC_APP_URL` | `https://mercado.vercel.app` |

Probá: `GET https://tu-api.vercel.app/api/health` → `{ "status": "ok", ... }`.

---

## 6. Vercel pide DB_HOST, PGADMIN, NEXT_PUBLIC… ¿qué va en cada proyecto?

Suele pasar si importaste el `.env` de Docker o mezclaste todo en **un solo** proyecto. Tenés que tener **dos proyectos** en Vercel (mismo repo, carpetas `backend` y `frontend`).

### 6.1 Proyecto BACKEND (`Root Directory` = `backend`)

| Variable | ¿Obligatorio? | Qué poner |
|----------|----------------|-----------|
| `NODE_ENV` | Sí | `production` |
| `DATABASE_URL` | Sí (recomendado) | URL completa de Postgres (Neon, Supabase, etc.). **Con esto NO hace falta** `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL`. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | Solo si **no** usás `DATABASE_URL` | Valores del proveedor. Si usás `DATABASE_URL`, **no las agregues** (o borralas). |
| `JWT_SECRET` | Sí | Secreto largo (ej. `openssl rand -base64 64`). |
| `JWT_REFRESH_SECRET` | Sí | Otro secreto distinto. |
| `JWT_EXPIRES_IN` | Opcional | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Opcional | `7d` |
| `FRONTEND_URL` | Sí | URL del sitio Next, ej. `https://tu-app.vercel.app` |
| `APP_URL` | Sí | URL **de esta API** sin `/api`, ej. `https://tu-api.vercel.app` (webhooks MP, links en mails). |
| `ADMIN_SEED_EMAIL` | Sí (producción) | Email del admin que crea el seed. |
| `ADMIN_SEED_PASSWORD` | Sí (producción) | Clave fuerte del admin. |
| `ALLOW_SYNC` | Sí | `false` en producción (salvo que necesites sync de esquema y aceptes el riesgo). |
| `RESEND_API_KEY` / `RESEND_FROM` | Opcional | Si mandás mail con Resend. |
| `SMTP_*` | Opcional | Si mandás mail por SMTP; si usás Resend, podés dejar vacío. |
| `MP_ACCESS_TOKEN` / `MP_PUBLIC_KEY` | Opcional | Cuando configures cobros reales con Mercado Pago. |
| `CORS_EXTRA_ORIGINS` | Opcional | Más orígenes, separados por coma. |
| `CORS_ALLOW_VERCEL_APP` | Opcional | `true` si querés permitir cualquier `*.vercel.app` (previews). |

### 6.2 Proyecto FRONTEND (`Root Directory` = `frontend`)

| Variable | ¿Obligatorio? | Qué poner |
|----------|----------------|-----------|
| `NEXT_PUBLIC_API_URL` | Sí | `https://tu-api.vercel.app/api` (**con** `/api` al final). |
| `NEXT_PUBLIC_APP_URL` | Sí | URL del sitio, ej. `https://tu-app.vercel.app`. |
| `NEXT_PUBLIC_APP_NAME` | Opcional | `Mercado Simple` |
| `NEXT_PUBLIC_SITE_URL` | Opcional | Si usás otro dominio para SEO/sitemap. |

En el proyecto **frontend** no van `JWT_*`, `DB_*`, `SMTP_*`, `ADMIN_*`, `MP_*`, `ALLOW_SYNC`, etc.

### 6.3 No van en Vercel (solo Docker local)

| Variable | Motivo |
|----------|--------|
| `PGADMIN_PASSWORD` | Es para el contenedor **pgAdmin** en `docker-compose`, no para la app. **Eliminala** del proyecto Vercel si la importaste. |

### 6.4 Resumen rápido

1. **Backend**: `DATABASE_URL` + JWT + `FRONTEND_URL` + `APP_URL` + admin + `ALLOW_SYNC=false` + lo opcional (email, MP).  
2. **Frontend**: solo `NEXT_PUBLIC_*`.  
3. **Borrá** `PGADMIN_PASSWORD` y las `DB_*` si ya tenés `DATABASE_URL`.

## 7. Archivos clave

| Archivo | Rol |
|---------|-----|
| `frontend/vercel.json` | Ajustes del proyecto Next en Vercel |
| `backend/vercel.json` | Build + función `api/index.js` + rewrites |
| `backend/api/index.js` | Carga `dist/serverless.js` tras `nest build` |
| `backend/src/serverless.ts` | Nest sobre Express + `serverless-http` |
| `backend/src/configure-app.ts` | CORS, helmet, pipes, Swagger (dev), health |
