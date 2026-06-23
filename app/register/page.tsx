'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: SMS Verify
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gdpr: false,
    marketing: false,
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Registration failed');

      setUserId(data.user.id);

      // Create profile (triggered by Supabase usually, but we ensure it here or update)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          gdpr_consent: formData.gdpr,
          marketing_consent: formData.marketing,
        }]);

      if (profileError) throw profileError;

      // Send SMS
      const res = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      if (!res.ok) throw new Error('Failed to send verification SMS');

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, code: verificationCode, userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Verification failed');
      }

      router.push('/account');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-md bg-white p-10 border border-border">
        <h1 className="font-serif text-3xl mb-2 text-charcoal tracking-tight">Create Account</h1>
        <p className="text-sm text-warm-mid mb-8 leading-relaxed">Join the Arden Wood community and access exclusive benefits.</p>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm border-l-2 border-red-600">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-warm-mid mb-2 font-medium">Full Name</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 border border-border outline-none focus:border-oak transition-all text-sm"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-warm-mid mb-2 font-medium">Email Address</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 border border-border outline-none focus:border-oak transition-all text-sm"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-warm-mid mb-2 font-medium">Password</label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 border border-border outline-none focus:border-oak transition-all text-sm"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-warm-mid mb-2 font-medium">Phone Number</label>
              <input
                required
                type="tel"
                placeholder="+420..."
                className="w-full px-4 py-3 border border-border outline-none focus:border-oak transition-all text-sm"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  required
                  type="checkbox"
                  className="mt-1 accent-oak"
                  checked={formData.gdpr}
                  onChange={e => setFormData({ ...formData, gdpr: e.target.checked })}
                />
                <span className="text-[12px] text-warm-mid leading-relaxed">
                  I agree to the processing of personal data (GDPR). *
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 accent-oak"
                  checked={formData.marketing}
                  onChange={e => setFormData({ ...formData, marketing: e.target.checked })}
                />
                <span className="text-[12px] text-warm-mid leading-relaxed">
                  I want to receive marketing news and exclusive offers.
                </span>
              </label>
            </div>

            <button
              disabled={loading}
              className="w-full bg-charcoal text-cream py-4 text-[11px] uppercase tracking-[2.5px] hover:bg-oak-dark transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <p className="text-sm text-warm-mid mb-6">We&apos;ve sent a 6-digit verification code to <span className="font-medium text-charcoal">{formData.phone}</span>.</p>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-warm-mid mb-2 font-medium">Verification Code</label>
              <input
                required
                type="text"
                maxLength={6}
                className="w-full px-4 py-3 border border-border outline-none focus:border-oak transition-all text-center text-xl tracking-[10px]"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-charcoal text-cream py-4 text-[11px] uppercase tracking-[2.5px] hover:bg-oak-dark transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Verifying...' : 'Verify & Complete'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-[11px] uppercase tracking-[2px] text-warm-mid hover:text-oak py-2"
            >
              Back
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-[13px] text-warm-mid">
            Already have an account? <Link href="/login" className="text-oak font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
