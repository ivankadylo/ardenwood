import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Status | Arden Wood',
  description: 'Track the production and delivery status of your Arden Wood furniture.',
};

export default function OrderStatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
