import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Arden Wood',
  description: 'Terms and conditions for using our website and purchasing our furniture.',
};

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-10 py-24">
      <h1 className="font-serif text-4xl mb-8">Terms & Conditions</h1>
      <p className="text-warm-mid leading-relaxed mb-6">This is a placeholder for the Terms & Conditions.</p>
    </div>
  );
}
