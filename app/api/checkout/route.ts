import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkoutRateLimit } from '@/lib/ratelimit';

const checkoutSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
  })),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await checkoutRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Mock checkout logic
    return NextResponse.json({ success: true, message: 'Checkout processed (mock)' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
