'use client';
export const dynamic = 'force-dynamic';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function BilleteraRedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    router.replace(tab ? `/mi-cuenta?tab=${tab}` : '/mi-cuenta?tab=billetera');
  }, [router, searchParams]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function BilleteraPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <BilleteraRedirectInner />
    </Suspense>
  );
}
