import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

export async function POST(req: Request) {
  try {
    const { phone, code, userId } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

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
