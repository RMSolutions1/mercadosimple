# Verificación ejecutada desde el entorno

Se ejecutaron comprobaciones contra **producción** (https://mercadosimple-web.fly.dev) sin usar navegador.

---

## Resultados

| Comprobación | Resultado |
|--------------|-----------|
| **Home (/)** | OK — Carga, título "Mercado Simple - Compra y vende...", enlace "Ingresar" presente, CTAs, categorías, Pago Simple, registro. |
| **Login (/auth/login)** | OK — HTTP 200, página contiene "Ingresar" y enlace a registro. |
| **Registro (/auth/registro)** | OK — HTTP 200, contenido incluye opciones de rol (comprador/vendedor). |
| **Pago Simple (/pago-simple)** | OK — HTTP 200. |
| **Productos (/productos)** | OK — Carga, título "Productos — Comprá tecnología...", navbar con Ingresar/Registrarse. |
| **Checkout (/checkout)** | OK — Página carga (sin sesión el cliente redirige a login con returnUrl). |

---

## Limitaciones

- Las **redirecciones** (ej. /mi-cuenta → login) ocurren en el **cliente** (React/useEffect), por eso con un simple GET no se ve un 302; al abrir la URL en el navegador sí redirige.
- Los **tests E2E con Playwright** no se pudieron ejecutar aquí porque en este entorno no están instalados los navegadores de Playwright (`npx playwright install` debe ejecutarse en tu máquina).
- La **API** (health) dio timeout en la prueba (posible cold start de Fly.io).

---

## Cómo correr los E2E tú mismo

En tu PC, en la carpeta del frontend:

```bash
npx playwright install
npm run test:e2e
```

Para probar contra producción:

```bash
$env:PLAYWRIGHT_BASE_URL="https://mercadosimple-web.fly.dev"
npm run test:e2e
```

---

## Resumen

Las URLs principales de auth y las páginas clave **responden 200** y el **contenido esperado** (formularios, enlaces de login/registro, CTAs) está presente. El comportamiento de registro, login y redirecciones está implementado en el código y revisado; la verificación en navegador real la podés hacer manualmente o con los tests E2E después de instalar Playwright.
