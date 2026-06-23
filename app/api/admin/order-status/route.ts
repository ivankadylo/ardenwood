import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json();

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
