/**
 * SEO: base URL y constantes para metadata, sitemap y robots.
 * En producción definir NEXT_PUBLIC_SITE_URL (ej. https://mercadosimple-web.fly.dev).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '') ||
  'https://mercadosimple-web.fly.dev';

export const SITE_NAME = 'Mercado Simple';
export const DEFAULT_TITLE = 'Mercado Simple - Compra y vende lo que quieras | Argentina';
export const DEFAULT_DESCRIPTION =
  'Marketplace argentino con Compra Protegida y Pago Simple. Comprá y vendé electrónica, moda, deportes, agro y más. Envío a todo el país.';

export const TWITTER_HANDLE = '@mercadosimple';

/** Rutas estáticas para sitemap (públicas, indexables). */
export const STATIC_SITEMAP_PATHS = [
  '',
  '/productos',
  '/ofertas',
  '/pago-simple',
  '/como-comprar',
  '/como-vender',
  '/como-pagar',
  '/empezar-a-vender',
  '/proteccion-comprador',
  '/devoluciones',
  '/quienes-somos',
  '/contacto',
  '/ayuda',
  '/blog',
  '/terminos',
  '/privacidad',
  '/accesibilidad',
  '/defensa-consumidor',
  '/envios-vendedor',
  '/comisiones',
  '/seguimiento',
  '/trabaja-con-nosotros',
  '/prensa',
  '/inversores',
  '/categorias/tecnologia',
  '/categorias/smartphones',
  '/categorias/moda',
  '/categorias/deportes',
  '/categorias/hogar',
  '/categorias/gaming',
  '/categorias/agro',
];
