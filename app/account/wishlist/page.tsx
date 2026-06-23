'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PRODUCTS, translations } from '@/lib/constants';
import { useLanguage } from '@/lib/LanguageContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { lang } = useLanguage();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[lang] || translations.en;

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', session.user.id);

    if (data) {
      const items = data.map(d => PRODUCTS.find(p => p.slug === d.product_id)).filter(Boolean);
      setWishlist(items);
    }
    setLoading(false);
  };

  const removeItem = async (slug: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', session.user.id)
      .eq('product_id', slug);

    setWishlist(wishlist.filter(item => item.slug !== slug));
  };

  if (loading) return <div className="p-20 text-center font-serif text-2xl">Loading...</div>;

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-20">
      <h1 className="font-serif text-[48px] text-charcoal mb-12">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border">
          <Heart className="mx-auto text-oak/30 mb-4" size={48} />
          <p className="text-warm-mid">Your wishlist is empty.</p>
          <Link href="/" className="text-oak hover:underline mt-4 inline-block">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map(item => (
            <div key={item.slug} className="bg-white border border-border group">
              <div className="aspect-square relative overflow-hidden bg-cream">
                <img src={item.img} alt={item.n} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeItem(item.slug)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-[22px] text-charcoal mb-1">{item.n}</h3>
                <p className="text-oak mb-6">{item.p.toLocaleString()} Kč</p>
                <div className="flex gap-3">
                  <Link
                    href={`/product/${item.slug}`}
                    className="flex-1 bg-charcoal text-cream text-[10px] tracking-[2px] uppercase py-3 text-center hover:bg-oak-dark transition-colors"
                  >
                    View Product
                  </Link>
                  <button className="px-4 border border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-all">
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
