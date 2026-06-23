import { Metadata, ResolvingMetadata } from 'next';
import { PRODUCTS } from '@/lib/constants';
import ProductClient from './ProductClient';

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const item = PRODUCTS.find(p => p.slug === params.slug);
  if (!item) return { title: 'Product Not Found' };

  return {
    title: `${item.n} | Arden Wood`,
    description: `Shop ${item.n} handcrafted from solid European oak. Custom sizes and finishes available.`,
    openGraph: {
      images: [item.img],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductClient params={params} />;
}
