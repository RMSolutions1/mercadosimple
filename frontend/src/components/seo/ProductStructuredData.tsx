'use client';

import { SITE_URL } from '@/lib/seo';

type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  slug?: string;
  images?: string[];
  image?: string;
  category?: { name: string };
  rating?: number;
  condition?: string;
};

export function ProductStructuredData({ product }: { product: Product }) {
  const image = product.images?.[0] || product.image || '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description?.replace(/<[^>]*>/g, '').slice(0, 500) || product.title,
    image: image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : undefined,
    url: `${SITE_URL}/productos/${product.slug || product.id}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'ARS',
      availability: 'https://schema.org/InStock',
    },
    ...(product.category && { category: product.category.name }),
    ...(product.rating != null && { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, bestRating: 5 } }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
