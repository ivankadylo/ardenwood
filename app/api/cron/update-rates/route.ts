import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/CZK');
    const data = await res.json();
    const eurRate = data.rates.EUR;

    if (eurRate) {
      const { error } = await supabase
        .from('currency_rates')
        .update({
          rate_to_czk: (1 / eurRate).toFixed(4),
          updated_at: new Date().toISOString()
        })
        .eq('code', 'EUR');

      if (error) throw error;
    }

    return NextResponse.json({ success: true, rate: eurRate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
