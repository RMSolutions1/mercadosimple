# 🛒 MERCADO SIMPLE

Plataforma marketplace full-stack para Argentina, competidora directa de MercadoLibre y MercadoPago.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14, React, TypeScript, TailwindCSS, Zustand |
| Backend | NestJS, TypeScript, TypeORM |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT + Refresh Tokens, bcrypt (costo 12) |
| Email | Nodemailer (SMTP) o Resend API |
| Pagos | Mercado Pago SDK + Billetera interna (Pago Simple) |
| Infraestructura | Docker, Nginx, Let's Encrypt · **Fly.io** (ver [DEPLOY.md](DEPLOY.md)) |

---

## Inicio rápido (desarrollo)

### Prerequisitos
- Node.js 20+
- Docker Desktop
- PostgreSQL (vía Docker)

### 1. Clonar y configurar entorno

```bash
git clone https://github.com/RMSolutions1/mercadosimple.git
cd "mercado simple"

# Iniciar base de datos
docker-compose up -d postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # Editar con tus valores
npm install
npm run seed           # Cargar datos de prueba
npm run start:dev      # http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

---

## Despliegue en producción

**Opción A — Fly.io (recomendado):** Ver guía completa en **[DEPLOY.md](DEPLOY.md)** (URLs, seed en producción, secrets, Resend, Mercado Pago, dominio propio).

**Opción B — Docker (VPS/servidor propio):**

### 1. Configurar variables de entorno

```bash
cd backend && cp .env.example .env
# Editar backend/.env con valores reales (ver backend/.env.example):
# - JWT_SECRET y JWT_REFRESH_SECRET (o usar: npm run generate-secrets)
# - Email: RESEND_API_KEY o SMTP_*
# - MP_ACCESS_TOKEN y MP_PUBLIC_KEY de Mercado Pago
# - Contraseñas de base de datos
```

### 2. Levantar toda la infraestructura

```bash
# Primera vez (crea las tablas automáticamente via el SQL de init)
docker-compose up -d --build

# Verificar que todos los servicios están corriendo
docker-compose ps

# Ver logs
docker-compose logs -f backend
```

### 3. Configurar SSL (Let's Encrypt)

```bash
# Primero asegurarse que el dominio apunta al servidor
docker-compose run --rm certbot certonly \
  --webroot --webroot-path /var/www/certbot \
  -d mercadosimple.com.ar -d www.mercadosimple.com.ar \
  -d api.mercadosimple.com.ar \
  --email admin@mercadosimple.com.ar --agree-tos

# Reiniciar nginx para cargar los certificados
docker-compose restart nginx
```

### 4. Carga inicial de datos de prueba

```bash
docker-compose exec backend node dist/database/seeds/run-seed.js
```

---

## Cuentas de prueba

Tras ejecutar `npm run seed` en el backend (o el seed en producción, ver [DEPLOY.md](DEPLOY.md)):

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@mercadosimple.com | Admin123* |
| Vendedor | techstore@mercadosimple.com | Vendedor123* |
| Comprador | comprador@mercadosimple.com | Comprador123* |

Listado completo de vendedores y compradores en **[GUIA-DE-PRUEBAS.md](GUIA-DE-PRUEBAS.md)**.

---

## Módulos implementados

### Backend (NestJS)
- ✅ Autenticación JWT + Refresh tokens + Recuperación de contraseña (email)
- ✅ Usuarios con roles (admin/seller/buyer) y verificación KYC
- ✅ Productos con categorías, imágenes, stock, calificaciones
- ✅ Carrito de compras persistente
- ✅ Órdenes con flujo completo + cupones de descuento (validados en backend)
- ✅ Pagos: Mercado Pago SDK + webhooks + reembolsos
- ✅ Envíos con tracking
- ✅ Reviews y calificaciones
- ✅ Favoritos
- ✅ Chat / Mensajería entre usuarios
- ✅ Preguntas y respuestas de productos
- ✅ Notificaciones en tiempo real
- ✅ **Billetera virtual (Pago Simple)**: CVU único, alias, transferencias instantáneas, QR, links de cobro, liquidaciones, comprobantes, extracto bancario
- ✅ Panel de administración completo con gestión de usuarios, wallets, disputas, reportes
- ✅ Email transaccional (bienvenida, recuperación de contraseña, confirmación de órdenes, transferencias)
- ✅ Health check endpoint

### Frontend (Next.js 14)
- ✅ 50+ páginas con rutas completas
- ✅ Dashboard de administrador
- ✅ Dashboard de vendedor con estadísticas y métricas
- ✅ Mi cuenta con billetera integrada
- ✅ Checkout en 3 pasos con múltiples métodos de pago
- ✅ Seguimiento de envíos
- ✅ Chat en tiempo real (polling)
- ✅ Modo oscuro global
- ✅ Diseño responsivo y accesible

---

## API Documentation

Swagger disponible en desarrollo: `http://localhost:3001/api/docs`

---

## Seguridad

- Helmet para HTTP security headers
- Rate limiting (global + por endpoint sensible)
- CORS dinámico desde variables de entorno
- JWT con expiración corta (15m) + refresh token (7d)
- bcrypt con factor de costo 12
- Validación de inputs con class-validator
- `synchronize: false` en producción
- Usuario no-root en contenedores Docker
- SSL/TLS con Let's Encrypt
