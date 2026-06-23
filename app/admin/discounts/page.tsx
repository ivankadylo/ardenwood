import { createClient } from "@/lib/auth";
import { Percent, Tag, ShieldCheck, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DiscountManagement() {
  const supabase = createClient();

  const { data: discountedProducts } = await supabase
    .from('products')
    .select('id, name_en, discount_percent, discount_for_members_only, price_czk, category')
    .gt('discount_percent', 0)
    .order('discount_percent', { ascending: false });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-4xl mb-2">Discount Management</h1>
        <p className="text-warm-mid font-sans">Set promotional prices and member-only deals.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-warm-mid/10 shadow-sm">
        <div className="flex items-center gap-3 mb-6 text-charcoal">
          <Percent className="text-oak" size={24} />
          <h2 className="font-serif text-2xl">Global Member Discount</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-sans font-medium text-warm-mid">Discount for all registered users (%)</label>
            <input
              type="number"
              defaultValue={5}
              className="w-full px-4 py-3 bg-cream border border-warm-mid/10 rounded-xl font-sans font-bold text-xl outline-none"
            />
          </div>
          <button className="bg-charcoal text-white px-8 py-3 rounded-xl font-sans font-medium hover:bg-charcoal/90 transition-all shadow-lg">
            Save Global Settings
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 text-charcoal">
          <Tag className="text-oak" size={24} />
          <h2 className="font-serif text-2xl">Active Product Discounts</h2>
        </div>

        <div className="bg-white rounded-xl border border-warm-mid/10 shadow-sm overflow-hidden">
          <table className="w-full text-left font-sans">
            <thead className="bg-cream text-warm-mid text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Original Price</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Sale Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-mid/10">
              {discountedProducts?.map((product) => {
                const salePrice = Math.round(product.price_czk * (1 - product.discount_percent / 100));
                return (
                  <tr key={product.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-charcoal">{product.name_en}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-sm text-warm-mid">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-warm-mid line-through">{product.price_czk.toLocaleString()} Kč</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">-{product.discount_percent}%</span>
                    </td>
                    <td className="px-6 py-4">
                      {product.discount_for_members_only ? (
                        <div className="flex items-center gap-1.5 text-oak font-medium text-xs">
                          <ShieldCheck size={14} />
                          Members Only
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                          <ShoppingBag size={14} />
                          Public Sale
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-charcoal">
                      {salePrice.toLocaleString()} Kč
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
