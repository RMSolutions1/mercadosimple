'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function PagoSimpleRegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #0F172A, #2563EB)' }}
        >
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm brand="psp" />
    </Suspense>
  );
}
