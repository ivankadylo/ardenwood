'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, BarChart2, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/lib/constants';

export default function ComparisonBar() {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  useEffect(() => {
    const checkSelection = () => {
      const stored = JSON.parse(localStorage.getItem('compare_products') || '[]');
      setSelectedSlugs(stored);
    };

    checkSelection();
    window.addEventListener('storage', checkSelection);
    const interval = setInterval(checkSelection, 1000);
    return () => {
      window.removeEventListener('storage', checkSelection);
      clearInterval(interval);
    };
  }, []);

  if (selectedSlugs.length < 2) return null;

  const items = selectedSlugs.map(slug => PRODUCTS.find(p => p.slug === slug)).filter(Boolean);

  const remove = (slug: string) => {
    const updated = selectedSlugs.filter(s => s !== slug);
    localStorage.setItem('compare_products', JSON.stringify(updated));
    setSelectedSlugs(updated);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-charcoal text-cream z-[200] border-t border-oak/30 shadow-2xl animate-slideUp">
      <div className="max-w-[1200px] mx-auto px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-oak/20 flex items-center justify-center text-oak">
            <BarChart2 size={24} />
          </div>
          <div>
            <h4 className="font-serif text-[18px]">Compare Products</h4>
            <p className="text-[11px] tracking-[1px] uppercase text-white/50">{selectedSlugs.length} items selected</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {items.map((item: any) => (
            <div key={item.slug} className="relative group">
              <div className="w-16 h-16 border border-white/10 overflow-hidden">
                <img src={item.img} alt={item.n} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => remove(item.slug)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-oak text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {selectedSlugs.length < 3 && (
            <div className="w-16 h-16 border border-dashed border-white/20 flex items-center justify-center text-white/20">
              <span className="text-[10px]">Add</span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              localStorage.removeItem('compare_products');
              setSelectedSlugs([]);
            }}
            className="text-[11px] tracking-[2px] uppercase text-white/40 hover:text-white transition-colors"
          >
            Clear All
          </button>
          <Link
            href="/compare"
            className="bg-oak text-white px-8 py-3 text-[11px] tracking-[2px] uppercase flex items-center gap-2 hover:bg-oak-dark transition-all"
          >
            Compare Now <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
