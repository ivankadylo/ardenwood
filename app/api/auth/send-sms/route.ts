import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

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
