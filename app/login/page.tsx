'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
      });
      if (error) throw error;
      setError('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-md bg-white p-10 border border-border">
        <h1 className="font-serif text-3xl mb-2 text-charcoal tracking-tight">Sign In</h1>
        <p className="text-sm text-warm-mid mb-8 leading-relaxed">Welcome back. Please enter your details.</p>

        {error && (
          <div className={`mb-6 p-4 text-sm border-l-2 ${error.includes('sent') ? 'bg-green-50 text-green-600 border-green-600' : 'bg-red-50 text-red-600 border-red-600'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] uppercase tracking-wider text-warm-mid font-medium">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[10px] uppercase tracking-wider text-oak hover:underline"
              >
                Forgot?
              </button>
            </div>
            <input
              required
              type="password"
              className="w-full px-4 py-3 border border-border outline-none focus:border-oak transition-all text-sm"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-charcoal text-cream py-4 text-[11px] uppercase tracking-[2.5px] hover:bg-oak-dark transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-[13px] text-warm-mid">
            Don&apos;t have an account? <Link href="/register" className="text-oak font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
