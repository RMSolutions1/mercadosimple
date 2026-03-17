'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useWalletStore } from '@/store/wallet.store';

export function Providers({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWallet } = useWalletStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWallet();
    }
  }, [isAuthenticated, fetchCart, fetchWallet]);

  return <>{children}</>;
}
