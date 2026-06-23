'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/constants';
import { useLanguage } from '@/lib/LanguageContext';
import { Clock, Package, Truck, CheckCircle } from 'lucide-react';

export default function OrderStatusPage({ params }: { params: { id: string } }) {
  const { lang } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[lang] || translations.en;

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) setOrder(data);
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!order) return <div className="p-20 text-center">Order not found.</div>;

  const createdAt = new Date(order.created_at);
  const productionEnd = new Date(createdAt.getTime() + 28 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((productionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const steps = [
    { id: 'pending', label: 'Confirmed', icon: CheckCircle },
    { id: 'in_production', label: 'In Production', icon: Clock },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: Package },
  ];

  const currentIdx = steps.findIndex(s => s.id === order.status);

  return (
    <div className="max-w-[800px] mx-auto px-10 py-20">
      <h1 className="font-serif text-[42px] text-charcoal mb-4">Order Status</h1>
      <p className="text-warm-mid mb-12 uppercase tracking-widest text-[11px]">Order #{order.id.slice(0,8)}</p>

      <div className="bg-white border border-border p-10 mb-12">
        <div className="flex justify-between items-center mb-12">
          {steps.map((step, idx) => (
            <div key={step.id} className={`flex flex-col items-center gap-3 relative ${idx <= currentIdx ? 'text-oak' : 'text-warm-mid/30'}`}>
              <step.icon size={24} />
              <span className="text-[10px] tracking-[1px] uppercase font-medium">{step.label}</span>
              {idx < steps.length - 1 && (
                <div className={`absolute left-full top-[12px] w-[calc(800px/4-60px)] h-[1px] ${idx < currentIdx ? 'bg-oak' : 'bg-border'}`}></div>
              )}
            </div>
          ))}
        </div>

        {order.status === 'in_production' && (
          <div className="bg-cream p-8 text-center border border-oak/10">
            <div className="text-[11px] tracking-[2px] uppercase text-oak mb-2">Estimated completion in</div>
            <div className="text-[48px] font-serif text-charcoal leading-none mb-2">{daysLeft} Days</div>
            <div className="text-[13px] text-warm-mid">Our craftsmen are working on your piece.</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-[14px]">
        <div>
          <h4 className="font-serif text-[20px] mb-4">Shipping Address</h4>
          <p className="text-warm-mid leading-relaxed">
            {order.shipping_name}<br />
            {order.shipping_address}<br />
            {order.shipping_zip} {order.shipping_city}<br />
            {order.shipping_country}
          </p>
        </div>
        <div>
          <h4 className="font-serif text-[20px] mb-4">Order Summary</h4>
          <div className="space-y-2">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-warm-mid">
                <span>{item.n} x{item.quantity || 1}</span>
                <span>{item.price?.toLocaleString()} Kč</span>
              </div>
            ))}
            <div className="pt-4 border-t border-border flex justify-between font-medium text-charcoal">
              <span>Total</span>
              <span>{order.total_czk.toLocaleString()} Kč</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
