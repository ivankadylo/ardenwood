import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Products | Arden Wood',
  description: 'Side-by-side comparison of handcrafted solid oak furniture.',
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
