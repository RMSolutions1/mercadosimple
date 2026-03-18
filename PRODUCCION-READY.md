# ¿Listo para producción real?

## Resumen

**Sí, el proyecto está preparado para producción real**, siempre que se cumplan los puntos del checklist siguiente. La base (auth, CORS, HTTPS, secrets por env, throttling, SEO) ya está bien configurada.

---

## Checklist obligatorio

| Punto | Estado | Acción |
|-------|--------|--------|
| **JWT_SECRET y JWT_REFRESH_SECRET** | Revisar | Deben estar configurados en Fly (`fly secrets set`) con valores fuertes, no por defecto. |
| **FRONTEND_URL** | OK | Ya configurado para CORS (mercadosimple-web.fly.dev). |
| **Base de datos** | OK | Fly Postgres; en producción no se usa `synchronize: true`. |
| **HTTPS** | OK | Fly.io fuerza HTTPS. |
| **Secrets en código** | OK | No hay claves hardcodeadas; todo por env. |
| **Swagger / docs** | OK | Solo se exponen en desarrollo (`NODE_ENV !== 'production'`). |
| **Token de recuperación** | OK | En producción el backend no devuelve `resetToken`; solo se envía por email. |

---

## Recomendado para producción “real”

| Punto | Descripción |
|-------|-------------|
| **Mercado Pago** | Si vas a cobrar de verdad: configurar `MP_ACCESS_TOKEN` y `MP_PUBLIC_KEY` de **producción** (no TEST-). El backend ya avisa si está en TEST o faltante. |
| **Email (Resend)** | Configurar `RESEND_API_KEY` y `RESEND_FROM` para emails de bienvenida y recuperación de contraseña. |
| **Dominio propio** | Opcional: usar tu dominio en lugar de mercadosimple-web.fly.dev (Fly permite custom domains). |
| **Usuarios de prueba** | Si ejecutaste el seed, en producción conviene cambiar contraseñas de cuentas de prueba o dar de baja las que no sean reales. |
| **Monitoreo** | Opcional: Fly dashboard, logs (`fly logs`), o un servicio de monitoreo/errores. |

---

## Ya resuelto en el proyecto

- Login y registro con redirecciones y `returnUrl`
- CORS con `FRONTEND_URL`
- Throttling en login/registro/forgot-password
- Contraseñas con bcrypt; JWT con refresh
- Términos, privacidad, defensa del consumidor
- SEO: sitemap, robots, metadata, JSON-LD
- Tests E2E (Playwright) para flujos de auth

---

## Conclusión

Con **JWT secrets** y, si aplica, **Mercado Pago y Resend** configurados en Fly, el proyecto está listo para uso en producción real.
