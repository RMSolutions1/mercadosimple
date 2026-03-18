# Verificación: Registro, Login y Redirecciones

## Corrección aplicada

- **Vendedor dashboard:** Si un usuario **comprador** (sin rol seller) entra a `/vendedor/dashboard` (p. ej. por un link con returnUrl), ahora se redirige a **`/mi-cuenta`** en lugar de volver a login, evitando un bucle.

---

## Flujos verificados en código

### 1. Login (`/auth/login`)

| Caso | Comportamiento |
|------|----------------|
| Submit con email/contraseña correctos | `auth.store` → `login()` → API `POST /auth/login` → guarda user + tokens → `fetchCart()` → toast "¡Bienvenido!" → **redirect** |
| Sin `returnUrl` en la URL | Redirige a **`/mi-cuenta`** |
| Con `returnUrl` (ej. `?returnUrl=/checkout`) | Redirige a la URL decodificada (ej. **`/checkout`**) |
| Credenciales inválidas | Toast error, no redirige |

### 2. Registro (`/auth/registro`)

| Caso | Comportamiento |
|------|----------------|
| Paso 1: elegir rol (comprador / vendedor) → Continuar | Paso 2: formulario nombre, email, teléfono, contraseña, confirmar, términos |
| Submit con datos válidos (contraseña ≥ 8 chars, coinciden, términos aceptados) | API `POST /auth/register` → guarda user + tokens → toast "¡Cuenta creada! Bienvenido." → **redirect** |
| Sin `returnUrl` | **Rol seller** → **`/vendedor/dashboard`**; **Rol buyer** → **`/mi-cuenta`** |
| Con `returnUrl` | Redirige a la URL decodificada |

### 3. Rutas protegidas (sin sesión → login con returnUrl)

Todas redirigen a `/auth/login?returnUrl=...` para volver tras el login:

- `/mi-cuenta` → returnUrl=/mi-cuenta  
- `/checkout` → returnUrl=/checkout  
- `/perfil`, `/perfil/configuracion`, `/perfil/direcciones`, `/perfil/favoritos`, `/perfil/pedidos`, `/perfil/seguridad`, `/perfil/notificaciones`  
- `/vendedor/dashboard` → returnUrl=/vendedor/dashboard  
- `/vendedor/productos/nuevo`, `/vendedor/productos/[id]/editar`  
- `/chat` → returnUrl con path + query  
- `/pago-simple/pagar/[code]`, `/pago-simple/qr/[qrCode]`  
- Desde producto: agregar al carrito / comprar ya / favoritos / contactar / preguntar → returnUrl=/productos/[slug]  

### 4. Vendedor dashboard con sesión

- **No autenticado** → redirect a `/auth/login?returnUrl=/vendedor/dashboard`.  
- **Autenticado pero rol comprador** → redirect a **`/mi-cuenta`** (evita bucle).  
- **Autenticado y rol seller o admin** → se muestra el dashboard y se cargan datos.

---

## Cómo probar manualmente

1. **Backend y frontend en local**
   - Backend: `cd backend && npm run start:dev` (puerto 3001).
   - Frontend: `cd frontend && npm run dev` (puerto 3000).
   - Opcional: ejecutar seed si tenés DB local: `npm run seed` en backend.

2. **Usuarios de prueba (seed)**
   - Comprador: `comprador@mercadosimple.com` / `Comprador123*`
   - Vendedor: `techstore@mercadosimple.com` / `Vendedor123*`
   - Admin: `admin@mercadosimple.com` / `Admin123*`

3. **Checklist manual**
   - [ ] Ir a `/auth/login` → ingresar con comprador → debe ir a **`/mi-cuenta`**.
   - [ ] Cerrar sesión, ir a `/checkout` → debe redirigir a login con returnUrl → ingresar → debe volver a **`/checkout`**.
   - [ ] Ir a `/auth/registro` → elegir "Quiero vender" → completar datos → enviar → debe ir a **`/vendedor/dashboard`**.
   - [ ] Cerrar sesión, registrar "Quiero comprar" → debe ir a **`/mi-cuenta`**.
   - [ ] Con sesión de comprador, abrir `/vendedor/dashboard` → debe redirigir a **`/mi-cuenta`** (no a login).
   - [ ] Sin sesión, abrir `/vendedor/dashboard` → debe ir a login con returnUrl.

---

## Tests E2E (Playwright)

En el frontend:

```bash
cd frontend
npm run test:e2e
```

Los tests cubren:

- Formulario de login y enlace a registro.
- Login exitoso → `/mi-cuenta` (usa comprador@mercadosimple.com si el backend con seed está disponible).
- Login con returnUrl → redirección al returnUrl o `/mi-cuenta`.
- Formulario de registro (paso 1 y paso 2).
- Acceso a `/mi-cuenta`, `/checkout`, `/vendedor/dashboard` sin sesión → redirect a login con returnUrl.
- Home y Pago Simple cargan y muestran CTAs.

Para que los tests de login/registro pasen, el **backend debe estar corriendo** (localhost:3001 o la URL configurada en `NEXT_PUBLIC_API_URL`) y, si usás DB local, con el **seed ejecutado**.
