'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useWalletStore } from '@/store/wallet.store';

export function Providers({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { fetchCart } = useCartStore();
  const { fetchWallet } = useWalletStore();

  useEffect(() => {
    if (accessToken && isAuthenticated) {
      fetchCart();
      fetchWallet();
    }
  }, [accessToken, isAuthenticated, fetchCart, fetchWallet]);

  return <>{children}</>;
}
