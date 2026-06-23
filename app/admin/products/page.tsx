import { createClient } from "@/lib/auth";
import Link from "next/link";
import { Plus, Search, Filter, Edit, Trash2, Eye, ExternalLink, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ProductsList({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const supabase = createClient();
  const query = searchParams.q || "";
  const category = searchParams.category || "all";

  let dbQuery = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike("name_en", `%${query}%`);
  }

  if (category !== "all") {
    dbQuery = dbQuery.eq("category", category);
  }

  const { data: products } = await dbQuery;
  const { data: currencies } = await supabase.from("currency_rates").select("*");
  const eurRate = currencies?.find(c => c.code === 'EUR')?.rate_to_czk || 25;

  const categories = [
    { label: "All Categories", value: "all" },
    { label: "Coffee Tables", value: "coffee" },
    { label: "Dining Tables", value: "dining" },
    { label: "TV Stands", value: "tv" },
    { label: "Shelving", value: "shelving" },
    { label: "Children's Beds", value: "kids" },
    { label: "Benches", value: "benches" },
    { label: "Oak Chairs", value: "chairs" },
    { label: "Side Tables", value: "side" },
    { label: "Bathroom", value: "bathroom" },
    { label: "Pet Furniture", value: "pets" },
    { label: "Table Legs", value: "legs" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl mb-2">Products</h1>
          <p className="text-warm-mid font-sans">Manage your catalog, prices, and inventory.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-oak hover:bg-oak-dark text-white px-6 py-3 rounded-lg font-sans font-medium transition-all shadow-lg shadow-oak/20 w-fit"
        >
          <Plus size={20} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-warm-mid/10 shadow-sm flex flex-col md:flex-row gap-4">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-mid" size={18} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-cream/50 border border-warm-mid/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-oak/20 font-sans"
          />
        </form>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-mid" size={18} />
            <select
              name="category"
              className="pl-10 pr-8 py-2 bg-cream/50 border border-warm-mid/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-oak/20 font-sans appearance-none cursor-pointer"
              defaultValue={category}
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set("category", e.target.value);
                window.location.href = url.toString();
              }}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-warm-mid/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead className="bg-cream text-warm-mid text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Price (CZK/EUR)</th>
                <th className="px-6 py-4 font-medium text-center">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Views</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-mid/10">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-cream/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-lg bg-cream overflow-hidden border border-warm-mid/10">
                        {product.photos?.[0] ? (
                          <img
                            src={product.photos[0]}
                            alt={product.name_en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-warm-mid">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-charcoal truncate">{product.name_en}</p>
                        <p className="text-xs text-warm-mid">Slug: {product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 bg-cream rounded-md text-warm-mid capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold text-charcoal">{product.price_czk.toLocaleString()} Kč</p>
                    <p className="text-xs text-warm-mid">~{Math.round(product.price_czk / eurRate).toLocaleString()} €</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "inline-flex w-3 h-3 rounded-full",
                      product.in_stock ? "bg-green-500" : "bg-red-500"
                    )} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-warm-mid">
                      <Eye size={14} />
                      <span className="text-sm">{product.views_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center">
                      <div className={cn(
                        "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                        product.is_active ? "bg-oak" : "bg-warm-mid/20"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                          product.is_active ? "right-1" : "left-1"
                        )} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="p-2 text-warm-mid hover:text-oak transition-colors"
                        title="View in Shop"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-warm-mid hover:text-oak transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        className="p-2 text-warm-mid hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-warm-mid text-sm italic">
                    No products found matching your search.
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
