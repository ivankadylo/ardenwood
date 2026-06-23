import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { generalRateLimit } from '@/lib/ratelimit';

const statusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['pending','confirmed','in_production','shipped','delivered','cancelled']),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await generalRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = statusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { orderId, status } = result.data;

    const { data: order } = await supabase
      .from('orders')
      .select('*, profiles(email, full_name)')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const email = order.guest_email || order.profiles?.email;
    const name = order.shipping_name || order.profiles?.full_name || 'Customer';

    if (!email) {
       return NextResponse.json({ message: 'No email found, skipped notification' });
    }

    console.log(`[SIMULATION] Sending status update email to ${email}`);
    console.log(`Dear ${name}, your order #${orderId.slice(0, 8)} status has changed to: ${status.toUpperCase()}`);

    return NextResponse.json({ success: true, message: 'Notification sent (simulated)' });
  } catch (error: any) {
    console.error('Error in order-status API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
