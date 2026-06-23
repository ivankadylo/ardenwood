import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Arden Wood | Handcrafted Solid Oak Furniture',
  description: 'Premium handcrafted furniture made from solid European oak. Custom dining tables, coffee tables, and more. Delivered across Europe.',
  openGraph: {
    title: 'Arden Wood | Handcrafted Solid Oak Furniture',
    description: 'Premium handcrafted furniture made from solid European oak.',
    images: ['/og-image.jpg'],
  },
};

export default function Page() {
  return <HomeClient />;
}
