'use client';
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/productos?categorySlug=${params.slug}`);
  }, [params.slug, router]);

  return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-ms-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
