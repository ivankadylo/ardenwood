import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Arden Wood',
  description: 'Sign in to your Arden Wood account to manage your orders and wishlist.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
