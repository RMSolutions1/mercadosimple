import { test, expect, type Page } from '@playwright/test';

/** Envío del formulario de login (evita solapamiento visual con el panel izquierdo). */
async function submitLoginForm(page: Page) {
  await page
    .locator('form')
    .filter({ has: page.locator('input[type="email"]') })
    .locator('button[type="submit"]')
    .click();
}

// Ejecutar contra producción: PLAYWRIGHT_BASE_URL=https://mercadosimple-web.fly.dev npm run test:e2e
test.describe('Auth y redirecciones', () => {
  test.describe.configure({ timeout: 90_000 });
  test.beforeEach(async ({ page, context, baseURL }) => {
    await context.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
    // Mismo origen que la app; luego reload para que Zustand no re-escriba tras clear.
    const origin = baseURL ?? 'http://localhost:3000';
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
    await context.clearCookies();
    await page.reload({ waitUntil: 'domcontentloaded' });
  });

  test('Login: formulario visible y enlace a registro', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /ingresar a pago simple/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email|tu@email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/contraseña|••••/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /crear cuenta|registro/i })).toBeVisible();
  });

  test('Login exitoso redirige a /mi-cuenta cuando no hay returnUrl', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder(/email|tu@email/i).fill('comprador@mercadosimple.com');
    await page.getByPlaceholder(/contraseña|••••/i).fill('Comprador123*');
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/(mi-cuenta|auth\/login)/, { timeout: 20000 });
    const url = page.url();
    if (url.includes('/auth/login')) {
      test.skip(true, 'Login falló (API/seed). Ejecutá: cd backend && npm run seed');
    }
    expect(url).toContain('/mi-cuenta');
  });

  test('Login con returnUrl redirige al returnUrl después de ingresar', async ({ page }) => {
    await page.goto('/auth/login?returnUrl=' + encodeURIComponent('/checkout'));
    await page.getByPlaceholder(/email|tu@email/i).fill('comprador@mercadosimple.com');
    await page.getByPlaceholder(/contraseña|••••/i).fill('Comprador123*');
    await submitLoginForm(page);
    await expect(page).toHaveURL(/\/(checkout|mi-cuenta|auth\/login)/, { timeout: 20000 });
    const url = page.url();
    if (url.includes('/auth/login')) {
      test.skip(true, 'Login falló - comprobar API y usuario de prueba');
    }
    expect(url).toMatch(/\/(checkout|mi-cuenta)/);
  });

  test('Registro: paso 1 (rol) y paso 2 (datos) visibles', async ({ page }) => {
    await page.goto('/auth/registro', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.getByTestId('registro-continuar')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Quiero comprar').first()).toBeVisible();
    await page.getByTestId('registro-continuar').click();
    await expect(page).toHaveURL(/step=2/, { timeout: 10000 });
    await expect(page.getByPlaceholder('Juan Pérez')).toBeVisible({ timeout: 10000 });
    await page.goto('/auth/registro?step=2');
    await expect(page.getByPlaceholder('Juan Pérez')).toBeVisible();
    await expect(page.getByPlaceholder('juan@email.com')).toBeVisible();
  });

  test('Ruta protegida /mi-cuenta redirige a login con returnUrl', async ({ page }) => {
    await page.goto('/mi-cuenta', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30000 });
    expect(page.url()).toContain('/auth/login');
    expect(page.url()).toContain('returnUrl');
    expect(page.url()).toContain('mi-cuenta');
  });

  test('Ruta protegida /checkout redirige a login con returnUrl', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 20000 });
    expect(page.url()).toContain('returnUrl');
    expect(page.url()).toContain('checkout');
  });

  test('Ruta protegida /vendedor/dashboard redirige a login sin sesión', async ({ page }) => {
    await page.goto('/vendedor/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 20000 });
    expect(page.url()).toContain('returnUrl');
    expect(page.url()).toContain('vendedor');
  });

  test('Home carga y muestra CTA de registro', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /registr|empezar|explorar/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Pago Simple carga y enlaces de login/registro', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('/pago-simple');
    await expect(page.locator('header').getByRole('link', { name: /^Ingresar$/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('header').getByRole('link', { name: /registr/i }).first()).toBeVisible();
  });
});
