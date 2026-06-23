import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | Arden Wood',
  description: 'Join Arden Wood for exclusive benefits and customized solid oak furniture.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
