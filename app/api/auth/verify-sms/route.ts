import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { authRateLimit } from '@/lib/ratelimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

const verifySchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await authRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = verifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { phone, code, userId } = result.data;

    // Verify code
    const { data: verification, error: verifyError } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (verifyError || !verification) {
      const attemptsKey = `failed_login:${phone}`;
      const attempts = await authRateLimit.limit(attemptsKey);
      if (!attempts.success) {
        return NextResponse.json({ error: 'Account locked for 15 minutes due to too many failed attempts' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark as used
    await supabase
      .from('phone_verifications')
      .update({ used: true })
      .eq('id', verification.id);

    // Update profile
    if (userId) {
      await supabase
        .from('profiles')
        .update({ phone_verified: true })
        .eq('id', userId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
