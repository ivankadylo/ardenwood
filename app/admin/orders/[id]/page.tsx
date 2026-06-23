import { createClient } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, Mail, MapPin, Phone, CreditCard, Calendar, Package } from "lucide-react";
import { notFound } from "next/navigation";
import OrderStatusUpdate from "@/components/admin/OrderStatusUpdate";
import { cn } from "@/lib/utils";

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, profiles(*)")
    .eq("id", params.id)
    .single();

  if (!order) {
    notFound();
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <Link href="/admin/orders" className="flex items-center gap-2 text-warm-mid hover:text-oak transition-colors mb-4 font-sans text-sm font-medium">
          <ChevronLeft size={16} />
          Back to Orders
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl mb-2">Order Detail</h1>
            <p className="text-warm-mid font-mono text-sm tracking-tight">ID: {order.id}</p>
          </div>
          <div className="w-full md:w-64">
            <OrderStatusUpdate orderId={order.id} initialStatus={order.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-warm-mid/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-warm-mid/10 bg-cream/30">
              <h2 className="font-serif text-xl">Order Items</h2>
            </div>
            <div className="divide-y divide-warm-mid/10">
              {items.map((item: any, i: number) => (
                <div key={i} className="p-6 flex gap-6">
                  <div className="w-24 h-24 bg-cream rounded-xl border border-warm-mid/10 overflow-hidden flex-shrink-0">
                    {item.img ? (
                      <img src={item.img} alt={item.n} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warm-mid">
                        <Package size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-sans font-bold text-charcoal">{item.n}</h3>
                      <p className="text-xs text-warm-mid mt-1 uppercase tracking-wider">{item.c}</p>
                      {item.options && (
                         <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(item.options).map(([key, val]: any) => (
                               <span key={key} className="text-[10px] px-2 py-0.5 bg-cream rounded font-medium text-warm-mid capitalize">
                                  {key}: {val}
                               </span>
                            ))}
                         </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm font-sans font-medium text-warm-mid">Qty: {item.q || 1}</p>
                      <p className="font-sans font-bold text-charcoal">{item.p?.toLocaleString()} Kč</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-cream/30 space-y-3">
              <div className="flex justify-between text-warm-mid font-sans">
                <span>Subtotal</span>
                <span>{order.total_czk.toLocaleString()} Kč</span>
              </div>
              <div className="flex justify-between text-warm-mid font-sans">
                <span>Shipping</span>
                <span>0 Kč</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-warm-mid/10">
                <span className="font-serif text-xl text-charcoal">Total</span>
                <div className="text-right">
                   <p className="font-sans text-2xl font-bold text-oak">{order.total_czk.toLocaleString()} Kč</p>
                   {order.total_eur && <p className="text-sm text-warm-mid font-medium">~ {order.total_eur.toLocaleString()} €</p>}
                </div>
              </div>
            </div>
          </div>

          {order.note && (
            <div className="bg-white rounded-2xl border border-warm-mid/10 shadow-sm p-6">
              <h2 className="font-serif text-lg mb-4">Customer Note</h2>
              <p className="font-sans text-warm-mid italic leading-relaxed">"{order.note}"</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-warm-mid/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-warm-mid/10 bg-cream/30">
              <h2 className="font-serif text-xl">Customer Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-cream rounded-lg text-warm-mid">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-warm-mid uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-medium text-charcoal">{order.guest_email || order.profiles?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-cream rounded-lg text-warm-mid">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-warm-mid uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-sm font-medium text-charcoal">{order.profiles?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-cream rounded-lg text-warm-mid">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-warm-mid uppercase tracking-widest mb-1">Shipping Address</p>
                  <p className="text-sm font-medium text-charcoal leading-relaxed">
                    {order.shipping_name}<br />
                    {order.shipping_address}<br />
                    {order.shipping_city}, {order.shipping_zip}<br />
                    {order.shipping_country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-mid/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-warm-mid/10 bg-cream/30">
              <h2 className="font-serif text-xl">Order Meta</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-cream rounded-lg text-warm-mid">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-warm-mid uppercase tracking-widest mb-1">Payment Status</p>
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-1",
                    order.payment_status === 'paid' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {order.payment_status}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-cream rounded-lg text-warm-mid">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-warm-mid uppercase tracking-widest mb-1">Date Placed</p>
                  <p className="text-sm font-medium text-charcoal">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
