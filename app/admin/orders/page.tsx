import { createClient } from "@/lib/auth";
import Link from "next/link";
import { Search, Filter, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function OrdersList({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const supabase = createClient();
  const query = searchParams.q || "";
  const status = searchParams.status || "all";

  let dbQuery = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(`shipping_name.ilike.%${query}%,guest_email.ilike.%${query}%`);
  }

  if (status !== "all") {
    dbQuery = dbQuery.eq("status", status);
  }

  const { data: orders } = await dbQuery;

  const statuses = [
    { label: "All Statuses", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "In Production", value: "in_production" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl mb-2">Orders</h1>
        <p className="text-warm-mid font-sans">Track and manage customer orders.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-warm-mid/10 shadow-sm flex flex-col md:flex-row gap-4">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-mid" size={18} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by customer name or email..."
            className="w-full pl-10 pr-4 py-2 bg-cream/50 border border-warm-mid/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-oak/20 font-sans"
          />
        </form>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-mid" size={18} />
            <select
              name="status"
              className="pl-10 pr-8 py-2 bg-cream/50 border border-warm-mid/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-oak/20 font-sans appearance-none cursor-pointer"
              defaultValue={status}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set("status", e.target.value);
                window.location.href = url.toString();
              }}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-warm-mid/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-cream text-warm-mid text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-mid/10">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-cream/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-medium text-charcoal">#{order.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">{order.shipping_name || 'Guest'}</p>
                      <p className="text-xs text-warm-mid">{order.guest_email || 'Verified User'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-charcoal">{order.total_czk.toLocaleString()} Kč</p>
                    {order.total_eur && <p className="text-xs text-warm-mid">{order.total_eur.toLocaleString()} €</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      order.payment_status === 'paid' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      order.status === 'delivered' ? "bg-green-100 text-green-700" :
                      order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                      order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-warm-mid">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-2 p-2 text-warm-mid hover:text-oak transition-colors"
                    >
                      <Eye size={18} />
                      <span className="text-xs font-medium">Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-warm-mid text-sm italic">
                    No orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
