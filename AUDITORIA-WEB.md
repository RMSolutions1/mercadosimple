# Auditoría web — Mercado Simple (mercadosimple-web.fly.dev)

**Fecha:** Marzo 2026  
**URL:** https://mercadosimple-web.fly.dev/

---

## 1. Resumen ejecutivo

Se revisaron la web en vivo, el header, footer, sliders, enlaces, dashboards (admin, vendedor, mi-cuenta), menús y funcionalidades. Se detectó **una inconsistencia corregida** (slug categoría Campo/Agro) y se documentan redundancias y recomendaciones.

---

## 2. Header (Navbar)

### Funcionalidades
- **Logo:** Enlace a `/`, Sol de Mayo + "MERCADO SIMPLE", "🇦🇷 Hecho en Argentina".
- **Mega menú Categorías:** 10 categorías con subcategorías; enlace a `/categorias/[slug]`.
- **Búsqueda:** Formulario que redirige a `/productos?search=...`.
- **Barra secundaria (desktop):** Ofertas, Cómo comprar, Cómo pagar, Cómo vender, Empezar a vender, Compra Protegida, Rastrear envío, Devoluciones, Blog, Ayuda.
- **Carrito:** Abre drawer; contador de ítems.
- **Usuario (logueado):** Menú con Mi cuenta, Pedidos, Favoritos, Mensajes, Notificaciones; Pago Simple (billetera, cargar, transferir, servicios, QR, extracto); Vendedor (panel, estadísticas, preguntas, publicar); tema; cerrar sesión. Admin ve enlace a Panel de Administración.
- **Usuario (no logueado):** Ingresar, Registrarse.
- **Menú móvil:** Mismo contenido adaptado; cierra al elegir enlace.

### Corrección aplicada
- **Slug "Campo y Agro":** En el mega menú estaba `slug: 'campo'` mientras el backend y la home usan `agro`. Corregido a `slug: 'agro'` para que `/categorias/agro` y el filtro por categoría funcionen bien.

### Consistencia
- Todos los enlaces de la barra secundaria y del menú móvil apuntan a rutas existentes (`/ofertas`, `/como-comprar`, `/como-pagar`, etc.).
- Televisores tiene slug `televisores` en Navbar, home y seed; correcto.

---

## 3. Footer

### Estructura
- **Franja de beneficios:** Envío gratis, Compra Protegida, 12 cuotas, Soporte 24/7.
- **Columnas:** Comprar, Vender, Pago Simple, Ayuda.
- **Enlaces:** Coinciden con rutas del proyecto (como-comprar, ofertas, proteccion-comprador, devoluciones, seguimiento; empezar-a-vender, vendedor/dashboard, comisiones, envios-vendedor; mi-cuenta con tabs; ayuda, terminos, privacidad, defensa-consumidor, contacto).
- **Medios de pago:** VISA, MC, AMEX, NRJ, CBL, PAGO SIMPLE (solo visual).
- **Legal:** Términos, Privacidad, Defensa del consumidor.

### Inconsistencias / Recomendaciones
- **Redes sociales:** Todos los enlaces son `href="#"`. Recomendación: reemplazar por URLs reales o eliminar hasta tener perfiles.
- **Panel vendedor / Publicar producto:** Enlazan a `/vendedor/dashboard` y `/vendedor/productos/nuevo`; requieren sesión de vendedor/admin. Está bien; en no logueado la app puede redirigir a login.

---

## 4. Home (sliders, secciones, widgets)

### Hero / Slider
- **4 banners** rotando cada 5 s: Hecho en Argentina (→/productos), Ofertas del Día (→/ofertas), Campo Argentino (→/categorias/agro), Pago Simple (→/mi-cuenta?tab=billetera).
- **Indicadores:** Puntos clicables para cambiar slide.
- **Diseño:** Gradientes, badge, CTA; imagen por banner. Sin errores detectados.

### Ofertas del día
- Countdown "Terminan en: HH:MM:SS" hasta fin del día.
- Lista de productos destacados (API `/products/featured`). En producción sin seed puede verse vacío ("0 ofertas" en /ofertas es esperable).

### Pago Simple (widget)
- Texto + "Ir a Pago Simple" (mi-cuenta?tab=billetera) y "Crear cuenta gratis" (auth/registro). Correcto.

### Comprá por categoría
- **Grid de categorías:** Misma lista que en DEPLOY/seed (tecnologia, smartphones, electrodomesticos, moda, deportes, hogar, gaming, vehiculos, agro, industria x2, bebes, belleza, libros, inmuebles, "Ver todo" → productos).
- **Redundancia:** "⛏️ Minería" y "🛢️ Industrial" comparten slug `industria`; ambos llevan a `/categorias/industria`. No es error; es duplicado visual.

### Productos destacados
- API `/products/featured` + `/products?sortBy=newest&limit=8`. Si no hay productos en la DB, la sección queda vacía.

### Tiendas oficiales (marcas)
- Logos: Apple, Samsung, Sony, LG, Nike, Adidas. Enlace a `/productos?search={nombre}`. Funcional; las imágenes son externas (Wikipedia).

### Recién llegados
- Solo se muestra si hay `newProducts.length > 0`. Correcto.

### Banner "¿Tenés algo para vender?"
- Enlaces a "Cómo vender" y "Empezar a vender" (registro con role=seller). Correcto.

---

## 5. Páginas enlazadas (rutas)

### Páginas públicas
- `/`, `/productos`, `/productos/[slug]`, `/ofertas`, `/categorias/[slug]` (redirige a `/productos?categorySlug=slug`).
- `/auth/login`, `/auth/registro`, `/auth/recuperar`, `/auth/reset-password/[token]`.
- `/como-comprar`, `/como-pagar`, `/como-vender`, `/empezar-a-vender`, `/proteccion-comprador`, `/seguimiento`, `/devoluciones`, `/blog`, `/ayuda`, `/contacto`, `/terminos`, `/privacidad`, `/defensa-consumidor`, `/comisiones`, `/envios-vendedor`, `/quienes-somos`, `/accesibilidad`, `/trabaja-con-nosotros`, `/prensa`, `/inversores`.
- `/pago-simple`, `/pago-simple/pagar/[code]`, `/pago-simple/qr/[qrCode]`.
- `/billetera`, `/billetera/extracto`, `/billetera/qr`, `/billetera/comprobante/[id]`, `/seguimiento/[trackingNumber]`, `/comprobante-servicio`.

### Con sesión
- `/mi-cuenta` (tabs: pedidos, billetera, depositar, transferir, retirar, servicios, qr, favoritos, notificaciones).
- `/perfil`, `/perfil/pedidos`, `/perfil/direcciones`, `/perfil/favoritos`, `/perfil/notificaciones`, `/perfil/configuracion`, `/perfil/seguridad`.
- `/vendedor/dashboard`, `/vendedor/productos/nuevo`, `/vendedor/productos/[id]/editar`, `/vendedor/preguntas`, `/vendedor/estadisticas`, `/vendedor/[id]`.
- `/admin` (panel completo con tabs).
- `/chat`, `/checkout`.

### Layout condicional
- **Sin Navbar/Footer global:** `/mi-cuenta`, `/vendedor/*`, `/admin`, `/billetera`, `/pago-simple`, `/chat`, `/comprobante-servicio`. Tienen layout propio (sidebar, etc.). Coherente.

---

## 6. Dashboards (estilos, menús, funcionalidades)

### Admin (`/admin`)
- **Sidebar:** Panel de control, Usuarios, Billeteras, Cargas pendientes, Transacciones, Productos, Órdenes, Disputas, Reportes, Configuración; agrupados por sección.
- **Contenido:** Métricas, tablas, modales (usuario, orden, depósitos), gráficos (Recharts). Estilos consistentes con el resto de la app.
- **Protección:** Debe validarse en backend que solo rol admin acceda; en frontend se usa `useAuthStore` y redirección si no es admin.

### Vendedor (`/vendedor/dashboard`)
- Layout propio; acceso para rol seller/admin. Sin revisión exhaustiva de cada tab; enlaces desde Navbar y Footer son correctos.

### Mi cuenta (`/mi-cuenta`)
- Tabs: pedidos, billetera, depositar, transferir, retirar, servicios, qr, favoritos, notificaciones. Enlaces desde header y footer coherentes.

---

## 7. Carrito (drawer)

- Se abre desde el ícono del header; muestra ítems, total, enlace a checkout. "Mi Carrito" y "Tu carrito está vacío" visibles en las capturas; comportamiento esperado.

---

## 8. Ofertas (`/ofertas`)

- Texto "0 ofertas disponibles" cuando la API no devuelve ofertas (por ejemplo, DB sin seed). Filtros (Mayor descuento, Menor precio, etc.) y countdown presentes. Funcionalidad correcta; el contenido depende de datos en backend.

---

## 9. Checklist de consistencia

| Área              | Estado | Notas                                              |
|-------------------|--------|----------------------------------------------------|
| Slug Campo/Agro   | ✅ Corregido | Navbar ahora usa `agro` como backend y home.       |
| Enlaces header    | ✅     | Todas las rutas existen.                           |
| Enlaces footer    | ✅     | Rutas correctas; redes sociales en `#`.            |
| Slider home       | ✅     | 4 slides, CTAs y rutas correctas.                  |
| Countdown         | ✅     | Hasta fin del día; puede mostrar 00:00:00 al cambiar de día. |
| Categorías home   | ⚠️     | Minería e Industrial comparten slug `industria`.   |
| Layout dashboards | ✅     | Sin header/footer global; layout propio.           |
| Carrito           | ✅     | Drawer y enlaces correctos.                        |

---

## 10. Recomendaciones prioritarias

1. **Redes sociales en footer:** Sustituir `href="#"` por URLs reales o ocultar el bloque hasta tener perfiles.
2. **Categorías home:** Opcional: unificar "Minería" e "Industrial" en una sola fila o diferenciar slugs en backend si se quieren dos categorías distintas.
3. **Producción sin seed:** "Ofertas del día" y "Productos destacados" vacíos son esperables; ejecutar seed en producción (ver DEPLOY.md) para tener datos de prueba.
4. **Countdown 00:00:00:** Si se desea evitar que quede en cero hasta el próximo día, se puede reiniciar a medianoche o mostrar un mensaje tipo "Mañana más ofertas".

---

*Auditoría realizada sobre el código del repositorio y la web desplegada en https://mercadosimple-web.fly.dev/.*
