'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Evita condiciones de carrera con zustand/persist: antes de hidratar, isAuthenticated puede ser false
 * y luego pasar a true al leer localStorage, cancelando redirecciones a login.
 */
export function useAuthHydrationReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const p = useAuthStore.persist;
    if (!p || typeof p.hasHydrated !== 'function') {
      setReady(true);
      return;
    }
    if (p.hasHydrated()) {
      setReady(true);
      return;
    }
    const done = () => setReady(true);
    const unsub = p.onFinishHydration(done);
    // React 18 Strict Mode desmonta y vuelve a montar: el timeout corto puede cancelarse antes de disparar.
    // Polling + tope largo asegura que nunca quedemos en "spinner" eterno sin hidratar.
    const poll = window.setInterval(() => {
      if (p.hasHydrated()) {
        window.clearInterval(poll);
        done();
      }
    }, 50);
    const failSafe = window.setTimeout(() => {
      window.clearInterval(poll);
      done();
    }, 3000);
    return () => {
      window.clearInterval(poll);
      window.clearTimeout(failSafe);
      unsub();
    };
  }, []);
  return ready;
}
