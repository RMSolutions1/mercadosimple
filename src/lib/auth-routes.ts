/**
 * Auth UI: marketplace (Mercado Simple) vs PSP (Pago Simple).
 * Misma API y credenciales; solo cambia marca y rutas de formularios.
 */
export type AuthBrand = 'marketplace' | 'psp';

const BASE = {
  marketplace: '/auth',
  psp: '/pago-simple/auth',
} as const;

export function authPath(brand: AuthBrand, segment: 'login' | 'registro' | 'recuperar'): string {
  return `${BASE[brand]}/${segment}`;
}

/** Email de reset sigue apuntando a una sola URL en backend. */
export function resetPasswordPath(token: string): string {
  return `/auth/reset-password/${token}`;
}

export function withQuery(path: string, params: URLSearchParams | Record<string, string | undefined>): string {
  const sp = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams();
  if (!(params instanceof URLSearchParams)) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') sp.set(k, v);
    });
  }
  const q = sp.toString();
  return q ? `${path}?${q}` : path;
}

/**
 * Sesión inválida en el cliente: login con la marca acorde a la ruta actual y returnUrl a esta página.
 */
export function redirectToLoginPreserveReturn(): void {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname + window.location.search;
  const brand: AuthBrand = path.startsWith('/pago-simple') ? 'psp' : 'marketplace';
  const login = authPath(brand, 'login');
  window.location.href = `${login}?returnUrl=${encodeURIComponent(path)}`;
}
