/**
 * Lectura síncrona del estado persistido (zustand persist "auth-storage").
 * Evita depender de la hidratación del store para redirigir invitados en rutas protegidas.
 */
export function hasValidClientSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string | null; isAuthenticated?: boolean } };
    const s = parsed?.state;
    return !!(s?.accessToken && s?.isAuthenticated);
  } catch {
    return false;
  }
}
