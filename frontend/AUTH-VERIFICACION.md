# Verificación — Rutas y formularios de autenticación

Última revisión: alineación frontend ↔ backend y flujos por rol.

## Rutas públicas (`/auth/*`)

| Ruta | Propósito |
|------|-----------|
| `/auth/login` | Ingreso email + contraseña. Query opcional: `?returnUrl=/ruta-interna` |
| `/auth/registro` | Alta en 2 pasos (comprador / vendedor). Queries: `?returnUrl=...`, `?role=seller` o `buyer` |
| `/auth/recuperar` | Solicitud de reset (`POST /auth/forgot-password`) |
| `/auth/reset-password/[token]` | Nueva contraseña (`POST /auth/reset-password`) |

- **Layout:** `ConditionalLayout` oculta Navbar/Footer en rutas que empiezan por `/auth`.
- **`returnUrl`:** Solo se aceptan rutas relativas que empiezan por `/` (no `//` ni URLs absolutas) — ver `safeReturnUrl()` en `src/lib/utils.ts`.

## API backend (`/api/auth/*`)

| Endpoint | Uso |
|----------|-----|
| `POST /auth/register` | Body: `email`, `password` (≥8), `name`, opcional `role`: `buyer` \| `seller`, opcional `phone` |
| `POST /auth/login` | Body: `email`, `password` |
| `POST /auth/refresh` | Renovación de tokens (axios interceptor) |
| `POST /auth/forgot-password` | Body: `email` |
| `POST /auth/reset-password` | Body: `token`, `password` |
| `GET /auth/profile` | JWT requerido |

**Roles**

- **Comprador / vendedor:** se eligen en el registro; el backend valida con `@IsIn([buyer, seller])`.
- **Administrador:** **no** se registra por el formulario público. Solo usuarios creados por seed o administración (`UserRole.ADMIN`).

## Flujos verificados

1. **Login** → `login()` guarda tokens en Zustand persist → opcional `fetchCart` → redirección a `returnUrl` seguro o `/mi-cuenta`.
2. **Registro comprador** → redirección a `returnUrl` o `/mi-cuenta`.
3. **Registro vendedor** → redirección a `returnUrl` o `/vendedor/dashboard`.
4. **Enlaces cruzados** login ↔ registro conservan `returnUrl` y, en registro, `role` cuando aplica.
5. **Teléfono** opcional en registro se envía al backend y se guarda en `users.phone`.

## Pruebas manuales sugeridas

- [ ] Login con seed `comprador@mercadosimple.com` / `Comprador123*`
- [ ] Login con seed `techstore@mercadosimple.com` / `Vendedor123*`
- [ ] Login con seed `admin@mercadosimple.com` / `Admin123*`
- [ ] Registro nuevo comprador y llegada a `/mi-cuenta`
- [ ] Registro nuevo vendedor (`?role=seller`) y llegada a `/vendedor/dashboard`
- [ ] `/checkout` sin sesión → login con `returnUrl=/checkout` → vuelta a checkout
- [ ] Intento de `returnUrl=https://evil.com` → debe ignorarse y usar ruta por defecto
