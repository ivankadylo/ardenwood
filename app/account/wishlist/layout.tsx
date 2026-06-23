import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist | Arden Wood',
  description: 'View your saved handcrafted solid oak furniture.',
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
