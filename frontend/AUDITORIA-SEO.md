# Auditoría SEO — Mercado Simple

## Resumen

Auditoría de extremo a extremo y mejoras aplicadas para optimizar el SEO del frontend (Next.js).

---

## 1. Metadata global (layout raíz)

- **Título** con template: `%s | Mercado Simple` para páginas hijas.
- **Description** y **keywords** por defecto.
- **openGraph**: locale `es_AR`, url, siteName, title, description, imagen (`/og-image.png`).
- **Twitter**: card `summary_large_image`, creator.
- **robots**: index, follow; **alternates.canonical** base.
- **viewport** y **themeColor** para móvil.
- **metadataBase** con `SITE_URL` para URLs absolutas correctas.

**Recomendación:** Añadir en `public/` una imagen **og-image.png** de 1200×630 px para redes sociales.

---

## 2. Sitemap y robots

- **`/sitemap.xml`** generado en `app/sitemap.ts`:
  - Rutas estáticas (home, productos, pago-simple, categorías, legales, etc.).
  - Productos dinámicos vía API (`/products?limit=3000`), con `lastModified`, `changeFrequency` y `priority`.
- **`/robots.txt`** en `app/robots.ts`:
  - `allow: /` para crawlers.
  - `disallow`: `/auth/`, `/admin`, `/vendedor/`, `/mi-cuenta`, `/perfil/`, `/checkout`, `/chat`, `/billetera/`.
  - `sitemap` y `host` con la URL del sitio.

La URL base del sitio se toma de **`NEXT_PUBLIC_SITE_URL`** (en Fly.io: `https://mercadosimple-web.fly.dev`).

---

## 3. Meta tags por página

Layouts con metadata específica:

| Ruta | Title / descripción |
|------|----------------------|
| `/` | Layout raíz (Mercado Simple - Compra y vende...) |
| `/productos` | Productos — Comprá tecnología, moda, deportes... |
| `/productos/[slug]` | **generateMetadata**: título y descripción del producto desde API |
| `/pago-simple` | Pago Simple — Billetera digital, cobrá con links y QR |
| `/auth/*` | Ingresar / Registro + **noindex** |
| `/blog` | Blog — Consejos de ventas, e-commerce... |
| `/contacto` | Contacto — Mercado Simple |
| `/quienes-somos` | Quiénes somos |
| `/terminos` | Términos y Condiciones |
| `/privacidad` | Política de Privacidad |

En producto se usa **canonical** y **Open Graph** con imagen del producto cuando existe.

---

## 4. Datos estructurados (JSON-LD)

- **Layout raíz:**
  - **Organization**: name, url, logo, description, address (país AR).
  - **WebSite**: name, url, description, **SearchAction** (target `/productos?search={search_term_string}`).
- **Página de producto** (`/productos/[slug]`):
  - **Product**: name, description, image, url, **Offer** (price, priceCurrency ARS, availability), category, aggregateRating si aplica.

---

## 5. Ajustes técnicos

- **Canonical**: definido en layout raíz y en layouts de pago-simple, productos, blog, contacto, quienes-somos, terminos, privacidad.
- **Idioma**: `<html lang="es">` en layout raíz.
- **H1**: Páginas auditadas tienen un único h1 coherente (producto, contacto, blog, etc.). Home usa el título del banner como h1.
- **Imágenes**: En detalle de producto se usa `alt={product.title}`; en home los banners usan `alt={banner.title}`.

---

## 6. Archivos creados/modificados

| Archivo | Acción |
|---------|--------|
| `src/lib/seo.ts` | Nuevo: SITE_URL, constantes, STATIC_SITEMAP_PATHS |
| `src/app/layout.tsx` | Metadata completa, viewport, JSON-LD Organization + WebSite |
| `src/app/sitemap.ts` | Nuevo: sitemap estático + productos desde API |
| `src/app/robots.ts` | Nuevo: reglas y sitemap |
| `src/app/productos/[slug]/layout.tsx` | Nuevo: generateMetadata para producto |
| `src/app/productos/[slug]/page.tsx` | ProductStructuredData (JSON-LD Product) |
| `src/components/seo/ProductStructuredData.tsx` | Nuevo: componente JSON-LD Product |
| `src/app/pago-simple/layout.tsx` | Nuevo: metadata Pago Simple |
| `src/app/auth/layout.tsx` | Nuevo: metadata + noindex |
| `src/app/productos/layout.tsx` | Nuevo: metadata listado productos |
| `src/app/blog/layout.tsx` | Nuevo: metadata blog |
| `src/app/contacto/layout.tsx` | Nuevo: metadata contacto |
| `src/app/quienes-somos/layout.tsx` | Nuevo: metadata quienes-somos |
| `src/app/terminos/layout.tsx` | Nuevo: metadata términos |
| `src/app/privacidad/layout.tsx` | Nuevo: metadata privacidad |
| `frontend/fly.toml` | NEXT_PUBLIC_SITE_URL para build y runtime |

---

## 7. Verificación post-despliegue

1. **Sitemap:** `https://mercadosimple-web.fly.dev/sitemap.xml`
2. **Robots:** `https://mercadosimple-web.fly.dev/robots.txt`
3. **Meta en producto:** Ver código fuente de cualquier `/productos/[slug]` y comprobar `<title>`, `<meta name="description">`, `og:image`, canonical.
4. **JSON-LD:** En código fuente, buscar `application/ld+json` (Organization, WebSite, Product en ficha de producto).
5. **Herramientas:** Google Search Console (enviar sitemap), Rich Results Test, Facebook Sharing Debugger.

---

## 8. Próximas mejoras opcionales

- Añadir **BreadcrumbList** en producto y categorías.
- Imagen **og-image.png** 1200×630 en `public/`.
- **hreflang** si en el futuro hay versiones en otro idioma.
- Revisar **Core Web Vitals** (LCP, CLS, FID) y optimizar imágenes (next/image donde aplique).
