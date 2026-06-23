import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Arden Wood',
  description: 'How we protect and manage your personal data.',
};

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-10 py-24">
      <h1 className="font-serif text-4xl mb-8">Privacy Policy</h1>
      <p className="text-warm-mid leading-relaxed mb-6">This is a placeholder for the Privacy Policy.</p>
    </div>
  );
}
