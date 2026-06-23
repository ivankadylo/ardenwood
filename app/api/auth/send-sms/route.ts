import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { z } from 'zod';
import { authRateLimit } from '@/lib/ratelimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const phoneSchema = z.object({
  phone: z.string().min(9).max(15),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await authRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = phoneSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }
    const { phone } = result.data;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store in phone_verifications
    const { error: dbError } = await supabase
      .from('phone_verifications')
      .insert([{ phone, code, expires_at: expiresAt }]);

    if (dbError) throw dbError;

    // Send SMS
    if (twilioClient) {
      await twilioClient.messages.create({
        body: `Your Arden Wood verification code is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } else {
      console.log('MOCK SMS:', phone, code);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('SMS Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
