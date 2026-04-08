'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { LoginPageContent } from '@/components/auth/LoginPageContent';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-ms-blue border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent brand="marketplace" />
    </Suspense>
  );
}
