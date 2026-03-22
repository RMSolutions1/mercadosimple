'use client';

import { useEffect, type ReactNode } from 'react';
import { hasValidClientSession } from '@/lib/auth-storage';

/**
 * Redirige a login si no hay sesión persistida coherente (localStorage auth-storage).
 * Debe envolver el árbol fuera de Suspense que use useSearchParams, para que el efecto corra al hidratar.
 */
export function ProtectedSessionGate({
  children,
  returnPath,
}: {
  children: ReactNode;
  /** Ruta a la que volver tras login (ej. /mi-cuenta) */
  returnPath: string;
}) {
  useEffect(() => {
    if (!hasValidClientSession()) {
      const loginUrl = `/auth/login?returnUrl=${encodeURIComponent(returnPath)}`;
      window.location.href = `${window.location.origin}${loginUrl}`;
    }
  }, [returnPath]);

  return <>{children}</>;
}
