'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { translations, PRODUCTS } from '@/lib/constants';
import { PRODUCT_DETAILS } from '@/lib/product-details';
import { useLanguage } from '@/lib/LanguageContext';
import MadeToOrderBadge from '@/components/MadeToOrderBadge';
import { Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const EDGE_DEFS = [["natural", "Přírodní hrana"], ["straight", "Rovná hrana"]];
const SHADE_DEFS = [["honey", "Medový"], ["light", "Světlý"], ["dark", "Tmavý - transparentní"]];
const FRAME_DEFS = [["black", "Černá"], ["white", "Bílá"]];
const PLACEHOLDER_COLORS: any = { natural: "#C9A36A", straight: "#B8812A", honey: "#C99A52", light: "#E3CDA0", dark: "#4A3324", black: "#222222", white: "#F2EFE8" };

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const slug = params.slug;
  const item = PRODUCTS.find(p => p.slug === slug);
  const d = PRODUCT_DETAILS[slug];

  const [mainPhoto, setMainPhoto] = useState(d?.photos?.[0]);
  const [selectedEdge, setSelectedEdge] = useState('natural');
  const [selectedShade, setSelectedShade] = useState('dark');
  const [selectedFrame, setSelectedFrame] = useState('black');
  const [dimensions, setDimensions] = useState({ width: 80, length: 120 });
  const [eurRate, setEurRate] = useState<any>(null);

  useEffect(() => {
    supabase.from('currency_rates').select('*').eq('code', 'EUR').single().then(({ data }) => {
      if (data) setEurRate(data);
    });
  }, []);

  if (!item || !d) {
    return <div className="p-20 text-center">Product not found.</div>;
  }

  const t = translations[lang] || translations.en;

  const basePrice = item.p;
  const extraWidth = Math.max(0, dimensions.width - 80);
  const extraLength = Math.max(0, dimensions.length - 120);
  const pricePerCm = 50; // Placeholder until DB column is fully utilized
  const totalPrice = basePrice + (extraWidth + extraLength) * pricePerCm;

  const formatPrice = (price: number, fromFlag: boolean) => {
    const num = price.toLocaleString('cs-CZ').replace(/,/g, ' ');
    return fromFlag ? `${t["price.from"]} ${num} Kč` : `${num} Kč`;
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": item.n,
    "image": [item.img, ...(d.photos || [])],
    "description": d.desc,
    "sku": item.slug,
    "brand": {
      "@type": "Brand",
      "name": "Arden Wood"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://ardenwood.eu/product/${item.slug}`,
      "priceCurrency": "CZK",
      "price": totalPrice,
      "availability": (item as any).in_stock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  const renderEdgeIcon = (value: string) => {
    const color = PLACEHOLDER_COLORS[value] || '#B8812A';
    const path = value === 'natural'
      ? 'M6 70 Q20 55 14 40 Q8 25 22 14 L94 14 Q86 30 92 45 Q98 60 86 70 Z'
      : 'M14 14 L86 14 L86 70 L14 70 Z';
    return (
      <svg viewBox="0 0 100 84" style={{ background: color }} className="w-full h-full">
        <path d={path} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" />
      </svg>
    );
  };

  const related = PRODUCTS.filter(p => p.c === item.c && p.slug !== item.slug && p.hasDetail).slice(0, 3);

  return (
    <div id="detailRoot" className="bg-cream min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pd-topbar bg-charcoal px-10 py-5 flex items-center justify-between">
        <button onClick={() => router.back()} className="pd-backlink bg-none border-none text-white/70 font-sans text-[11px] tracking-[1.5px] uppercase flex items-center gap-2 hover:text-oak-light transition-all">
          &larr; Back to Collection
        </button>
        <div className="pd-wordmark font-serif text-[20px] text-cream tracking-[1px]">ARDEN WOOD</div>
      </div>

      <div className="pd-wrap max-w-[1180px] mx-auto px-10 py-14 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16">
        <div>
          <div className="pd-gallery-main aspect-square overflow-hidden bg-[#E8DFD0] border border-border">
            <img src={mainPhoto} alt={item.n} className="w-full h-full object-cover block" />
          </div>
          {d.photos.length > 1 && (
            <div className="pd-thumbstrip flex gap-3 mt-4 flex-wrap">
              {d.photos.map((u: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setMainPhoto(u)}
                  className={`pd-thumbbtn w-16 h-16 p-0 border border-border bg-none cursor-pointer overflow-hidden transition-all ${mainPhoto === u ? 'opacity-100 border-oak' : 'opacity-60 hover:opacity-85'}`}
                >
                  <img src={u} alt={`${item.n} ${i + 1}`} className="w-full h-full object-cover block" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-infocol pt-1">
          <div className="mb-4">
            <MadeToOrderBadge />
          </div>
          <div className="pd-cattag text-[11px] tracking-[2px] uppercase text-oak-dark mb-4">{d.catLabel}</div>
          <h1 className="pd-title font-serif text-[36px] font-normal leading-[1.15] mb-4 text-charcoal">{item.n}</h1>
          <p className="pd-desc text-[14px] text-warm-mid mb-8 max-w-[480px] leading-relaxed">{d.desc}</p>

          {d.edge && (
            <div className="pd-variant-group mb-7">
              <div className="pd-variant-title font-sans text-[16px] font-medium text-charcoal mb-4">Hrana desky</div>
              <div className="pd-swatch-row flex gap-4 flex-wrap">
                {EDGE_DEFS.map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSelectedEdge(v)}
                    className={`pd-swatch-tile group flex flex-col items-center gap-2 w-24 font-sans ${selectedEdge === v ? 'selected' : ''}`}
                  >
                    <span className="pd-swatch-media relative w-24 h-24 border-2 overflow-hidden bg-[#E8DFD0] transition-all border-transparent group-[.selected]:border-charcoal">
                      {renderEdgeIcon(v)}
                      {selectedEdge === v && <span className="pd-swatch-check absolute top-[6px] right-[6px] w-[22px] h-[22px] rounded-full bg-charcoal/80 text-white text-[13px] flex items-center justify-center">✓</span>}
                    </span>
                    <span className={`pd-swatch-label text-[11.5px] text-center leading-tight transition-all ${selectedEdge === v ? 'text-charcoal font-medium' : 'text-warm-mid'}`}>{l}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {d.shade && (
            <div className="pd-variant-group mb-7">
              <div className="pd-variant-title font-sans text-[16px] font-medium text-charcoal mb-4">Odstín desky</div>
              <div className="pd-swatch-row flex gap-4 flex-wrap">
                {SHADE_DEFS.map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSelectedShade(v)}
                    className={`pd-swatch-tile group flex flex-col items-center gap-2 w-24 font-sans ${selectedShade === v ? 'selected' : ''}`}
                  >
                    <span className="pd-swatch-media relative w-24 h-24 border-2 overflow-hidden transition-all border-transparent group-[.selected]:border-charcoal">
                      <div className="w-full h-full" style={{ background: PLACEHOLDER_COLORS[v] }}></div>
                      {selectedShade === v && <span className="pd-swatch-check absolute top-[6px] right-[6px] w-[22px] h-[22px] rounded-full bg-charcoal/80 text-white text-[13px] flex items-center justify-center">✓</span>}
                    </span>
                    <span className={`pd-swatch-label text-[11.5px] text-center leading-tight transition-all ${selectedShade === v ? 'text-charcoal font-medium' : 'text-warm-mid'}`}>{l}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {d.frame && (
            <div className="pd-variant-group mb-7">
              <div className="pd-variant-title font-sans text-[16px] font-medium text-charcoal mb-4">Barva podnoží</div>
              <div className="pd-swatch-row flex gap-4 flex-wrap">
                {FRAME_DEFS.map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSelectedFrame(v)}
                    className={`pd-swatch-tile group flex flex-col items-center gap-2 w-24 font-sans ${selectedFrame === v ? 'selected' : ''}`}
                  >
                    <span className="pd-swatch-media relative w-24 h-24 border-2 overflow-hidden transition-all border-transparent group-[.selected]:border-charcoal">
                      <div className="w-full h-full" style={{ background: PLACEHOLDER_COLORS[v] }}></div>
                      {selectedFrame === v && <span className="pd-swatch-check absolute top-[6px] right-[6px] w-[22px] h-[22px] rounded-full bg-charcoal/80 text-white text-[13px] flex items-center justify-center">✓</span>}
                    </span>
                    <span className={`pd-swatch-label text-[11.5px] text-center leading-tight transition-all ${selectedFrame === v ? 'text-charcoal font-medium' : 'text-warm-mid'}`}>{l}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(item.c === 'dining' || item.c === 'coffee') && (
            <div className="pd-variant-group mb-7">
              <div className="pd-variant-title font-sans text-[16px] font-medium text-charcoal mb-4">Custom Dimensions (cm)</div>
              <div className="space-y-6 max-w-[400px]">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[12px] uppercase tracking-wider text-warm-mid">
                    <span>Width</span>
                    <span className="text-charcoal font-medium">{dimensions.width} cm</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="60" max="120" step="5"
                      value={dimensions.width}
                      onChange={(e) => setDimensions({ ...dimensions, width: parseInt(e.target.value) })}
                      className="flex-1 accent-oak"
                    />
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions({ ...dimensions, width: parseInt(e.target.value) || 60 })}
                      className="w-16 px-2 py-1 border border-border text-[13px] outline-none focus:border-oak"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[12px] uppercase tracking-wider text-warm-mid">
                    <span>Length</span>
                    <span className="text-charcoal font-medium">{dimensions.length} cm</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range" min="80" max="300" step="10"
                      value={dimensions.length}
                      onChange={(e) => setDimensions({ ...dimensions, length: parseInt(e.target.value) })}
                      className="flex-1 accent-oak"
                    />
                    <input
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => setDimensions({ ...dimensions, length: parseInt(e.target.value) || 80 })}
                      className="w-16 px-2 py-1 border border-border text-[13px] outline-none focus:border-oak"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pd-price-row font-serif text-[30px] text-oak-dark my-7 flex items-center gap-6">
            <span>{formatPrice(totalPrice, false)}</span>
            {eurRate && (
              <div className="group relative flex items-center gap-2 text-[18px] text-warm-mid/60 cursor-help">
                <span>{(totalPrice / eurRate.rate_to_czk).toFixed(0)} €</span>
                <Info size={14} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-charcoal text-white text-[10px] tracking-[1px] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Rate updated: {new Date(eurRate.updated_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="pd-cta-row mb-2">
            <button
              onClick={() => {
                console.log('Added to cart with custom dimensions:', {
                  product: item.n,
                  price: totalPrice,
                  dimensions: `${dimensions.width}x${dimensions.length} cm`,
                  options: { edge: selectedEdge, shade: selectedShade, frame: selectedFrame }
                });
              }}
              className="btn-primary bg-charcoal text-cream px-9 py-4 font-sans text-[11px] tracking-[2.5px] uppercase cursor-pointer hover:bg-oak-dark transition-all"
            >
              Add to Cart
            </button>
          </div>

          <p className="pd-note-text text-[12px] text-warm-mid mt-5 max-w-[420px] leading-relaxed">
            Every piece is made to order from solid oak in our workshop in the Beskydy Mountains, Czech Republic. Need a custom size or finish? Write to us at <a href="mailto:info@ardenwood.eu" className="text-oak-dark border-b border-border hover:text-oak transition-colors">info@ardenwood.eu</a>.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pd-related-section max-w-[1180px] mx-auto mt-16 px-10 pb-20 pt-12 border-t border-border">
          <div className="pd-related-eyebrow text-[11px] tracking-[2px] uppercase text-oak-dark mb-6">You May Also Like</div>
          <div className="pd-related-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {related.map(r => (
              <Link key={r.slug} href={`/product/${r.slug}`} className="pd-related-card group block">
                <div className="pd-related-img aspect-square overflow-hidden bg-[#E8DFD0] mb-3">
                  <img src={r.img} alt={r.n} className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-[1.05]" loading="lazy" />
                </div>
                <div className="pd-related-name font-serif text-[17px] mb-1 text-charcoal">{r.n}</div>
                <div className="pd-related-price text-[12px] text-warm-mid">{formatPrice(r.p, r.f)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="pd-footer bg-charcoal text-white/55 py-8 px-10 text-center text-[12px]">
        © 2026 Arden Wood — Handcrafted Oak Furniture. Demo catalog built with real product data.
      </div>
    </div>
  );
}
