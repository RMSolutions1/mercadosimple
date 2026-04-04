'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { LoginPageContent } from '@/components/auth/LoginPageContent';

export default function PagoSimpleLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent brand="psp" />
    </Suspense>
  );
}
