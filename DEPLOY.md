# Despliegue en producción (Fly.io)

Guía para dejar **Mercado Simple** listo para operaciones reales en Fly.io.

Para **Vercel** (Next + Nest serverless), usá **[VERCEL.md](VERCEL.md)**.

## Después de un push: pasos en tu máquina (con Fly CLI)

Si el código ya está en GitHub, solo tenés que ejecutar en tu PC (con [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) instalado y `fly auth login` hecho):

```bash
# 1. Generar JWT secrets y configurarlos en Fly (guarda backup en backend/.secrets.generated.txt)
cd backend
npm run generate-secrets

# 2. Desplegar API
fly deploy -a mercadosimple-api

# 3. Desplegar frontend (desde la raíz del repo)
cd ../frontend
fly deploy -a mercadosimple-web
```

Si `fly` no está en el PATH al ejecutar `generate-secrets`, los valores se guardan igual en `backend/.secrets.generated.txt`; después podés configurarlos con:

```bash
cd backend
fly secrets set JWT_SECRET="..." JWT_REFRESH_SECRET="..." -a mercadosimple-api
```

(copiando los valores de `.secrets.generated.txt`).

## URLs actuales

| Servicio | URL |
|----------|-----|
| Frontend | https://mercadosimple-web.fly.dev |
| API | https://mercadosimple-api.fly.dev |
| Health | https://mercadosimple-api.fly.dev/api/health |

---

## Checklist de producción

### 1. Base de datos en Fly (bootstrap)

El seed **no** crea usuarios de demo: solo el **administrador dueño** (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`) y las **categorías** para que vendedores publiquen. Compradores y vendedores se crean con **registro** (`POST /api/auth/register`).

Configurá en Fly (recomendado):

```bash
fly secrets set ADMIN_SEED_EMAIL="tu@dominio.com" ADMIN_SEED_PASSWORD="clave-muy-segura" -a mercadosimple-api
```

**Primera carga** (DB vacía o sin admin): con `ALLOW_SYNC=true` o migraciones ya aplicadas, ejecutá el bootstrap una vez. Opciones:

- **Desde tu PC** contra la DB (túnel o `DATABASE_URL`):

```bash
cd backend && npm run seed
```

- **Con JWT de admin** (si ya podés loguear como admin):

```bash
curl -X POST https://mercadosimple-api.fly.dev/api/admin/seed \
  -H "Authorization: Bearer TU_JWT_ADMIN"
```

**Reinicio total** (borra **todo**: usuarios, productos, órdenes, etc. y vuelve a dejar solo admin + categorías). Solo en entornos controlados:

```bash
curl -X POST https://mercadosimple-api.fly.dev/api/admin/reset-platform \
  -H "Authorization: Bearer TU_JWT_ADMIN" \
  -H "Content-Type: application/json" \
  -d "{\"confirm\":\"ELIMINAR_TODO_Y_REINICIAR\"}"
```

Local (requiere `CONFIRM_RESET=YES`):

```bash
# Windows PowerShell:
$env:CONFIRM_RESET="YES"; npm run db:reset-platform
```

### 2. Secrets fuertes en Fly (API)

Generar y configurar JWT y, si aplica, Resend:

**Generar secretos (PowerShell):**

```powershell
# JWT (64 bytes en base64)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Repetir para otro valor (JWT_REFRESH_SECRET). Luego:

```bash
cd backend
fly secrets set JWT_SECRET="el-valor-generado-1" -a mercadosimple-api
fly secrets set JWT_REFRESH_SECRET="el-valor-generado-2" -a mercadosimple-api
```

**Email con Resend:**

```bash
fly secrets set RESEND_API_KEY="re_xxxx" -a mercadosimple-api
fly secrets set RESEND_FROM="Mercado Simple <noreply@tudominio.com>" -a mercadosimple-api
```

(En Resend debes verificar el dominio para usar tu propio `RESEND_FROM`.)

### 3. Variables de entorno

- **Backend (mercadosimple-api):**  
  `DATABASE_URL` lo inyecta Fly al adjuntar Postgres. Configurar además: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL` (ej. `https://mercadosimple-web.fly.dev`), `APP_URL` (ej. `https://mercadosimple-api.fly.dev`). Opcional: `RESEND_API_KEY`, `RESEND_FROM`, `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`.
- **Frontend (mercadosimple-web):**  
  `NEXT_PUBLIC_API_URL=https://mercadosimple-api.fly.dev` (y en build si aplica).

### 4. Mercado Pago en producción

- En producción, si `MP_ACCESS_TOKEN` no está definido o empieza por `TEST-`, el backend muestra un **warning** al arrancar.
- Para pagos reales: crear una aplicación en [desarrolladores.mercadopago.com](https://www.mercadopago.com.ar/developers), obtener credenciales de **producción** y configurar:
  - `MP_ACCESS_TOKEN` (producción)
  - En el frontend, la clave pública correspondiente para el checkout.
- Webhook: configurar en Mercado Pago la URL de notificaciones:  
  `https://mercadosimple-api.fly.dev/api/payments/webhook`

### 5. Dominio propio (opcional)

- En [Fly.io Dashboard](https://fly.io/dashboard) → tu app → **Settings** → **Domains**: añadir un dominio (ej. `api.tudominio.com` para la API y `tudominio.com` para la web).
- En el proveedor de DNS, crear los registros CNAME que indique Fly.
- Actualizar `APP_URL`, `FRONTEND_URL` y `NEXT_PUBLIC_API_URL` según los nuevos dominios y volver a desplegar si hace falta.

---

## Resumen de variables (backend)

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Lo define Fly al adjuntar Postgres |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Obligatorios en producción; valores aleatorios fuertes |
| `APP_URL` | URL pública del backend (para emails y webhooks) |
| `FRONTEND_URL` | Origen permitido (CORS) |
| `RESEND_API_KEY` | Email vía Resend (opcional) |
| `RESEND_FROM` | Remitente con Resend (opcional) |
| `SMTP_*` | Alternativa a Resend (opcional) |
| `MP_ACCESS_TOKEN` | Producción: token real de Mercado Pago |

Más referencias en `backend/.env.example`.
