'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowLeft, Check } from 'lucide-react';
import { PRODUCTS, translations } from '@/lib/constants';
import { PRODUCT_DETAILS } from '@/lib/product-details';
import { useLanguage } from '@/lib/LanguageContext';

export default function ComparePage() {
  const { lang } = useLanguage();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const t = translations[lang] || translations.en;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('compare_products') || '[]');
    setSelectedSlugs(stored);
  }, []);

  const items = selectedSlugs.map(slug => ({
    ...PRODUCTS.find(p => p.slug === slug),
    details: PRODUCT_DETAILS[slug]
  })).filter(item => item.slug);

  const remove = (slug: string) => {
    const updated = selectedSlugs.filter(s => s !== slug);
    localStorage.setItem('compare_products', JSON.stringify(updated));
    setSelectedSlugs(updated);
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1200px] mx-auto px-10 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-warm-mid hover:text-oak transition-colors mb-12">
          <ArrowLeft size={14} /> Back to Collection
        </Link>

        <h1 className="font-serif text-[56px] text-charcoal mb-4">Product Comparison</h1>
        <p className="text-warm-mid mb-16 max-w-[600px]">Side-by-side analysis of our handcrafted solid oak pieces to help you make the perfect choice for your home.</p>

        {items.length < 2 ? (
          <div className="text-center py-32 border border-dashed border-border">
            <p className="text-warm-mid">Select at least 2 products to compare.</p>
            <Link href="/" className="text-oak hover:underline mt-4 inline-block font-medium">Return to Catalog</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white border border-border">
              <thead>
                <tr>
                  <th className="p-8 text-left border-b border-border bg-cream/30 w-[200px]">
                    <div className="text-[10px] tracking-[3px] uppercase text-oak">Feature</div>
                  </th>
                  {items.map((item: any) => (
                    <th key={item.slug} className="p-8 border-l border-b border-border min-w-[300px]">
                      <div className="relative group">
                        <button
                          onClick={() => remove(item.slug)}
                          className="absolute -top-4 -right-4 w-8 h-8 bg-white border border-border text-charcoal rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                        >
                          <X size={14} />
                        </button>
                        <div className="aspect-square mb-6 overflow-hidden bg-cream">
                          <img src={item.img} alt={item.n} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-serif text-[24px] text-charcoal leading-tight">{item.n}</h3>
                        <p className="text-oak mt-2 font-serif text-[20px]">{item.p.toLocaleString()} Kč</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-8 font-sans font-medium text-[13px] border-b border-border bg-cream/10">Category</td>
                  {items.map((item: any) => (
                    <td key={item.slug} className="p-8 text-[14px] text-warm-mid border-l border-b border-border uppercase tracking-widest text-[11px]">
                      {item.c}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-8 font-sans font-medium text-[13px] border-b border-border bg-cream/10">Edge Options</td>
                  {items.map((item: any) => (
                    <td key={item.slug} className="p-8 text-[14px] text-warm-mid border-l border-b border-border">
                      {item.details?.edge ? <div className="flex items-center gap-2 text-green-600"><Check size={16} /> Yes</div> : 'No'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-8 font-sans font-medium text-[13px] border-b border-border bg-cream/10">Shade Options</td>
                  {items.map((item: any) => (
                    <td key={item.slug} className="p-8 text-[14px] text-warm-mid border-l border-b border-border">
                      {item.details?.shade ? <div className="flex items-center gap-2 text-green-600"><Check size={16} /> Yes</div> : 'No'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-8 font-sans font-medium text-[13px] border-b border-border bg-cream/10">Metal Frame</td>
                  {items.map((item: any) => (
                    <td key={item.slug} className="p-8 text-[14px] text-warm-mid border-l border-b border-border">
                      {item.details?.frame ? <div className="flex items-center gap-2 text-green-600"><Check size={16} /> Yes</div> : 'No'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-8 font-sans font-medium text-[13px] border-b border-border bg-cream/10">Action</td>
                  {items.map((item: any) => (
                    <td key={item.slug} className="p-8 border-l border-b border-border text-center">
                      <Link
                        href={`/product/${item.slug}`}
                        className="inline-block bg-charcoal text-cream px-6 py-3 text-[10px] tracking-[2px] uppercase hover:bg-oak-dark transition-all"
                      >
                        Buy Now
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
