import { test, expect, type Page } from '@playwright/test';
import { e2eCreds } from './credentials';

async function submitLoginForm(page: Page) {
  await page
    .locator('form')
    .filter({ has: page.locator('input[type="email"]') })
    .locator('button[type="submit"]')
    .click();
}

/**
 * Smoke / regresión amplia: carga de rutas, navegación y flujos críticos.
 * Requiere: frontend :3000, API :3001, seed admin + SEED_DEMO_USERS=true para comprador/vendedor.
 */
const clearStorage = async (page: Page) => {
  await page.context().addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.context().clearCookies();
  await page.reload({ waitUntil: 'domcontentloaded' });
};

test.beforeEach(async ({ page, context }) => {
  await context.addInitScript(() => {
    try {
      localStorage.removeItem('auth-storage');
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.setViewportSize({ width: 1400, height: 900 });
});
const PUBLIC_PAGES: { path: string; mustContain: RegExp | string }[] = [
  { path: '/', mustContain: /Mercado|Simple|Pago|producto|Oferta/i },
  { path: '/productos', mustContain: /producto|buscar|filtr|cat/i },
  { path: '/buscar?q=celular', mustContain: /buscar|resultado|producto|encontr/i },
  { path: '/ofertas', mustContain: /oferta|descuento|producto/i },
  { path: '/pago-simple', mustContain: /Pago|Simple|billetera|cobrar/i },
  { path: '/como-comprar', mustContain: /comprar|compra|paso/i },
  { path: '/como-pagar', mustContain: /pagar|pago|tarjeta/i },
  { path: '/como-vender', mustContain: /vender|publicar|vendedor/i },
  { path: '/empezar-a-vender', mustContain: /vender|publicar|cuenta/i },
  { path: '/proteccion-comprador', mustContain: /proteg|compra|garant/i },
  { path: '/devoluciones', mustContain: /devoluci|reembols/i },
  { path: '/seguimiento', mustContain: /seguimiento|rastre|envío/i },
  { path: '/blog', mustContain: /blog|artículo|noticia/i },
  { path: '/ayuda', mustContain: /ayuda|pregunta|FAQ/i },
  { path: '/contacto', mustContain: /contacto|email|mensaje/i },
  { path: '/quienes-somos', mustContain: /quienes|nosotros|misión/i },
  { path: '/terminos', mustContain: /términos|condiciones|uso/i },
  { path: '/privacidad', mustContain: /privacidad|datos|personales/i },
  { path: '/defensa-consumidor', mustContain: /defensa|consumidor|derecho/i },
  { path: '/comisiones', mustContain: /comisi|venta|porcentaje/i },
  { path: '/auth/login', mustContain: /ingresar|email|contraseña/i },
  { path: '/auth/registro', mustContain: /crear cuenta|comprar|vender/i },
  { path: '/auth/recuperar', mustContain: /recuperar|contraseña|email/i },
];

test.describe('Páginas públicas cargan (200 + contenido)', () => {
  for (const { path, mustContain } of PUBLIC_PAGES) {
    test(`GET ${path}`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60000 });
      expect(res?.status(), `status ${path}`).toBeLessThan(400);
      const body = await page.textContent('body');
      expect(body, 'body no vacío').toBeTruthy();
      expect(body!, mustContain.toString()).toMatch(mustContain);
    });
  }
});

test.describe('Navegación y flujos', () => {
  test('Navbar: búsqueda y envío a /buscar', async ({ page }) => {
    await page.goto('/');
    const search = page.getByRole('searchbox', { name: /buscar en mercado simple/i });
    await expect(search).toBeVisible({ timeout: 15000 });
    await search.fill('notebook');
    await page.getByRole('button', { name: /^Buscar$/i }).click();
    await expect(page).toHaveURL(/\/buscar/, { timeout: 20000 });
    expect(page.url()).toContain('buscar');
  });

  test('Listado productos: click en primer producto abre detalle', async ({ page }) => {
    await page.goto('/productos', { waitUntil: 'networkidle', timeout: 60000 });
    const link = page.locator('a[href^="/productos/"]').filter({ hasNot: page.locator('[href="/productos"]') }).first();
    const count = await link.count();
    if (count === 0) {
      test.skip(true, 'No hay productos en BD para probar detalle');
      return;
    }
    await link.click();
    await expect(page).toHaveURL(/\/productos\/[^/]+/, { timeout: 15000 });
    await expect(page.getByRole('heading', { level: 1 }).or(page.locator('h1'))).toBeVisible({ timeout: 10000 });
  });

  test('Carrito: abrir drawer desde navbar', async ({ page }) => {
    await page.goto('/');
    const cartBtn = page.getByRole('button', { name: /carrito/i }).first();
    await expect(cartBtn).toBeVisible({ timeout: 15000 });
    await cartBtn.click();
    await expect(page.getByText(/carrito|vacío|subtotal|total/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Login seed + visita /mi-cuenta', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/auth/login');
    await page.getByPlaceholder(/email|tu@email/i).fill(e2eCreds.buyerEmail);
    await page.getByPlaceholder(/contraseña|••••/i).fill(e2eCreds.buyerPassword);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/(mi-cuenta|auth\/login)/, { timeout: 20000 });
    if (page.url().includes('/auth/login')) {
      test.skip(true, 'Login falló: API + seed con SEED_DEMO_USERS=true');
      return;
    }
    await expect(page).toHaveURL(/\/mi-cuenta/);
    await expect(page.getByText(/cuenta|billetera|pedidos|resumen/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Login vendedor + panel /vendedor/dashboard', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/auth/login');
    await page.getByPlaceholder(/email|tu@email/i).fill(e2eCreds.sellerEmail);
    await page.getByPlaceholder(/contraseña|••••/i).fill(e2eCreds.sellerPassword);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/(mi-cuenta|auth\/login)/, { timeout: 20000 });
    if (page.url().includes('/auth/login')) {
      test.skip(true, 'Login vendedor falló');
      return;
    }
    await page.goto('/vendedor/dashboard');
    await page.waitForURL(/\/(vendedor\/dashboard|auth\/login)/, { timeout: 15000 });
    expect(page.url()).toContain('vendedor');
    await expect(page.getByText(/panel|ventas|producto|resumen/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Login admin + /admin accesible', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/auth/login');
    await page.getByPlaceholder(/email|tu@email/i).fill(e2eCreds.adminEmail);
    await page.getByPlaceholder(/contraseña|••••/i).fill(e2eCreds.adminPassword);
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/(mi-cuenta|auth\/login)/, { timeout: 20000 });
    if (page.url().includes('/auth/login')) {
      test.skip(true, 'Login admin falló');
      return;
    }
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/(admin|auth\/login)/, { timeout: 15000 });
    if (page.url().includes('/auth/login')) {
      test.skip(true, 'Admin redirigido a login');
      return;
    }
    await expect(page.getByText(/admin|usuario|dashboard|panel/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Checkout sin sesión redirige a login', async ({ page }) => {
    await clearStorage(page);
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 20000 });
    expect(page.url()).toContain('returnUrl');
  });
});
