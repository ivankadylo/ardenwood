import { createClient } from "@/lib/auth";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Plus,
  List,
  Percent,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = createClient();

  // Fetch Stats
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: ordersToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const { count: ordersMonth } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth.toISOString());

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_czk, total_eur')
    .eq('payment_status', 'paid');

  const totalRevenueCZK = revenueData?.reduce((sum, order) => sum + (order.total_czk || 0), 0) || 0;
  const totalRevenueEUR = revenueData?.reduce((sum, order) => sum + (order.total_eur || 0), 0) || 0;

  // Recent Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      shipping_name,
      items,
      total_czk,
      status,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // Top Viewed Products
  const { data: topProducts } = await supabase
    .from('products')
    .select('id, name_en, views_count')
    .order('views_count', { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Registrations", value: totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Orders Today", value: ordersToday || 0, icon: ShoppingBag, color: "text-oak", bg: "bg-oak/10" },
    { label: "Orders This Month", value: ordersMonth || 0, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Revenue", value: `${totalRevenueCZK.toLocaleString()} Kč / ${totalRevenueEUR.toLocaleString()} €`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const quickActions = [
    { label: "Add Product", href: "/admin/products/new", icon: Plus },
    { label: "View All Orders", href: "/admin/orders", icon: List },
    { label: "Manage Discounts", href: "/admin/discounts", icon: Percent },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-4xl mb-2">Dashboard</h1>
        <p className="text-warm-mid font-sans">Welcome back to the ArdenWood management console.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-warm-mid/10 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-lg", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-sm text-warm-mid font-sans font-medium">{stat.label}</p>
                <p className="text-xl font-sans font-semibold mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="flex items-center justify-between p-6 bg-white rounded-xl border border-warm-mid/10 hover:border-oak hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cream rounded-lg group-hover:bg-oak/10 transition-colors">
                <action.icon size={20} className="text-charcoal group-hover:text-oak" />
              </div>
              <span className="font-sans font-medium text-charcoal">{action.label}</span>
            </div>
            <ChevronRight size={18} className="text-warm-mid group-hover:text-oak" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-warm-mid/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-warm-mid/10 flex items-center justify-between">
            <h2 className="font-serif text-xl">Recent Orders</h2>
            <Link href="/admin/orders" className="text-oak hover:underline font-sans text-sm font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="bg-cream text-warm-mid text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-mid/10">
                {recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-charcoal">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-charcoal">{order.shipping_name || 'Guest'}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{order.total_czk.toLocaleString()} Kč</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        order.status === 'delivered' ? "bg-green-100 text-green-700" :
                        order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-warm-mid">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-warm-mid text-sm italic">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-warm-mid/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-warm-mid/10">
            <h2 className="font-serif text-xl">Top Viewed Products</h2>
          </div>
          <div className="divide-y divide-warm-mid/10 font-sans">
            {topProducts?.map((product, i) => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-cream/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-xs font-bold text-oak">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{product.name_en}</p>
                  <p className="text-xs text-warm-mid">{product.views_count} views</p>
                </div>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <div className="p-10 text-center text-warm-mid text-sm italic">No products viewed yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
