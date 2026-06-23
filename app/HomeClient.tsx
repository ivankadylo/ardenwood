'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { translations, PRODUCTS } from '@/lib/constants';
import { useLanguage } from '@/lib/LanguageContext';
import MadeToOrderBadge from '@/components/MadeToOrderBadge';
import { Heart, BarChart2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CATALOG_CATEGORIES = ["all", "coffee", "dining", "tv", "shelving", "kids", "benches", "chairs", "side", "radiator", "bathroom", "pets", "legs"];

export default function Home() {
  const { lang, setLang } = useLanguage();
  const [catalogState, setCatalogState] = useState({ cat: "all", q: "" });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const heroRef = useRef<HTMLElement>(null);

  const t = translations[lang] || translations.en;

  const filteredProducts = PRODUCTS.filter(item => {
    const inCat = catalogState.cat === 'all' || item.c === catalogState.cat;
    const q = catalogState.q.trim().toLowerCase();
    const inSearch = !q || item.n.toLowerCase().includes(q);
    return inCat && inSearch;
  });

  useEffect(() => {
    fetchWishlist();
    const storedCompare = JSON.parse(localStorage.getItem('compare_products') || '[]');
    setCompareSlugs(storedCompare);

    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / 50;
      const y = (clientY - innerHeight / 2) / 50;
      setParallax({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase.from('wishlists').select('product_id').eq('user_id', session.user.id);
    if (data) setWishlistSlugs(data.map((d: any) => d.product_id));
  };

  const toggleWishlist = async (slug: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }

    if (wishlistSlugs.includes(slug)) {
      await supabase.from('wishlists').delete().eq('user_id', session.user.id).eq('product_id', slug);
      setWishlistSlugs(wishlistSlugs.filter(s => s !== slug));
    } else {
      await supabase.from('wishlists').insert({ user_id: session.user.id, product_id: slug });
      setWishlistSlugs([...wishlistSlugs, slug]);
    }
  };

  const toggleCompare = (slug: string) => {
    let updated = [...compareSlugs];
    if (updated.includes(slug)) {
      updated = updated.filter(s => s !== slug);
    } else if (updated.length < 3) {
      updated.push(slug);
    }
    setCompareSlugs(updated);
    localStorage.setItem('compare_products', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div id="catalogRoot">
      {/* HERO */}
      <section ref={heroRef} className="hero min-h-[92vh] grid grid-cols-1 lg:grid-cols-2 relative overflow-hidden">
        <div className="hero-content flex flex-col justify-center px-10 md:px-20 py-20 relative z-[2]">
          <div className="hero-eyebrow text-[11px] tracking-[4px] uppercase text-oak mb-7 flex items-center gap-3 animate-fadeUp [animation-delay:0.1s]">
            <span className="w-10 h-[1px] bg-oak block"></span>
            <span dangerouslySetInnerHTML={{ __html: t["hero.eyebrow"] }} />
          </div>
          <h1 className="hero-title font-serif text-[clamp(52px,6vw,86px)] font-light leading-[1.05] tracking-[-1px] text-charcoal mb-8 animate-fadeUp [animation-delay:0.25s]" dangerouslySetInnerHTML={{ __html: t["hero.title"] }} />
          <p className="hero-desc text-[15px] text-warm-mid max-w-[400px] leading-[1.8] mb-12 animate-fadeUp [animation-delay:0.4s]" dangerouslySetInnerHTML={{ __html: t["hero.desc"] }} />
          <div className="hero-actions flex gap-4 items-center flex-wrap animate-fadeUp [animation-delay:0.55s]">
            <button className="btn-primary bg-charcoal text-cream border-none px-9 py-4 font-sans text-[11px] tracking-[2.5px] uppercase cursor-pointer transition-all hover:bg-oak-dark">
              {t["hero.btn1"]}
            </button>
            <button className="btn-ghost bg-none border-none text-warm-mid font-sans text-[11px] tracking-[2px] uppercase cursor-pointer flex items-center gap-2 transition-all hover:text-oak">
              {t["hero.btn2"]} <span className="text-base">→</span>
            </button>
          </div>
        </div>

        <div className="hero-visual relative overflow-hidden hidden lg:block">
          <div className="hero-visual-bg absolute inset-0 bg-[linear-gradient(135deg,#C4883A18_0%,#7A551820_100%)]"></div>
          <div className="hero-wood-texture absolute inset-10 border border-border flex items-center justify-center">
            <div
              className="wood-rings w-[300px] h-[300px] relative transition-transform duration-300 ease-out"
              style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}
            >
              <svg viewBox="0 0 300 300" className="w-full h-full opacity-35">
                <g fill="none" stroke="#B8812A" strokeWidth="0.8">
                  <ellipse cx="150" cy="150" rx="140" ry="110" />
                  <ellipse cx="150" cy="150" rx="120" ry="94" />
                  <ellipse cx="150" cy="150" rx="100" ry="78" />
                  <ellipse cx="150" cy="150" rx="82" ry="63" />
                  <ellipse cx="150" cy="150" rx="65" ry="49" />
                  <ellipse cx="150" cy="150" rx="50" ry="36" />
                  <ellipse cx="150" cy="150" rx="36" ry="25" />
                  <ellipse cx="150" cy="150" rx="23" ry="15" />
                  <ellipse cx="150" cy="150" rx="12" ry="7" />
                  <line x1="10" y1="150" x2="290" y2="150" strokeDasharray="3 8" opacity="0.4" />
                  <line x1="150" y1="40" x2="155" y2="260" strokeDasharray="2 10" opacity="0.3" />
                  <line x1="50" y1="60" x2="255" y2="240" strokeDasharray="2 12" opacity="0.2" />
                </g>
              </svg>
            </div>
          </div>
          <div className="hero-stats absolute bottom-[60px] left-[60px] flex gap-12">
            <div className="stat-item">
              <div className="stat-num font-serif text-[42px] font-light text-oak leading-none">100%</div>
              <div className="stat-label text-[10px] tracking-[2px] uppercase text-warm-mid mt-[6px]">{t["stat.solid"]}</div>
            </div>
            <div className="stat-item">
              <div className="stat-num font-serif text-[42px] font-light text-oak leading-none">EU</div>
              <div className="stat-label text-[10px] tracking-[2px] uppercase text-warm-mid mt-[6px]">{t["stat.delivery"]}</div>
            </div>
            <div className="stat-item">
              <div className="stat-num font-serif text-[42px] font-light text-oak leading-none">∞</div>
              <div className="stat-label text-[10px] tracking-[2px] uppercase text-warm-mid mt-[6px]">{t["stat.custom"]}</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip bg-charcoal py-4 overflow-hidden whitespace-nowrap">
        <div className="marquee-inner">
          {[1, 2].map((i) => (
            <div key={i} className="flex">
              {[
                "Solid European Oak", "Handcrafted in Czech Republic", "Custom Dimensions", "EU-wide Delivery", "Oil Finish · Natural", "IK Arden Group"
              ].map((text, idx) => (
                <span key={idx} className="marquee-item inline-flex items-center gap-8 px-8 text-[11px] tracking-[3px] uppercase text-white/45">
                  <span className="marquee-dot w-1 h-1 rounded-full bg-oak shrink-0"></span>{text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <section className="section px-10 md:px-20 py-24">
        <div className="section-header flex flex-col md:flex-row md:items-end justify-between gap-5 mb-16">
          <div>
            <div className="section-eyebrow text-[10px] tracking-[4px] uppercase text-oak mb-4">{t["products.eyebrow"]}</div>
            <h2 className="section-title font-serif text-[clamp(36px,4vw,56px)] font-light leading-[1.1] text-charcoal" dangerouslySetInnerHTML={{ __html: t["products.title"] }} />
          </div>
        </div>

        <div className="catalog-controls flex flex-col md:flex-row md:items-end justify-between gap-6 mb-7">
          <div className="category-tabs flex flex-wrap gap-2">
            {CATALOG_CATEGORIES.map(id => (
              <button
                key={id}
                className={`cat-tab px-4 py-[9px] border text-[10.5px] tracking-[1.3px] uppercase transition-all whitespace-nowrap ${catalogState.cat === id ? 'bg-charcoal border-charcoal text-cream' : 'bg-white border-border text-warm-mid hover:border-oak hover:text-oak'}`}
                onClick={() => setCatalogState({ ...catalogState, cat: id })}
              >
                {t[id === 'all' ? 'cat.all' : 'cat.' + id] || id}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="catalog-search w-full md:max-w-[320px] px-[18px] py-[13px] border border-border bg-white text-[13px] text-charcoal outline-none transition-all focus:border-oak"
            placeholder={t["cat.search"]}
            value={catalogState.q}
            onChange={(e) => setCatalogState({ ...catalogState, q: e.target.value })}
          />
        </div>

        <div className="catalog-count text-[11px] tracking-[1.5px] uppercase text-warm-mid mb-7">
          {t["catalog.count"].replace("{n}", filteredProducts.length)}
        </div>

        <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[2px]">
          {filteredProducts.map((item, idx) => {
            const catLabel = t['cat.' + item.c] || item.c;
            const priceStr = item.p.toLocaleString('cs-CZ').replace(/,/g, ' ');
            const priceText = item.f ? `${t["price.from"]} ${priceStr} Kč` : `${priceStr} Kč`;

            return (
              <div
                key={idx}
                className={`product-card group relative bg-white overflow-hidden ${idx === 0 ? 'lg:row-span-2' : ''}`}
              >
                <div className="absolute top-4 left-4 z-10">
                  <MadeToOrderBadge />
                </div>
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <button
                    onClick={() => toggleWishlist(item.slug)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${wishlistSlugs.includes(item.slug) ? 'bg-oak text-white' : 'bg-white text-charcoal hover:text-oak'}`}
                  >
                    <Heart size={18} fill={wishlistSlugs.includes(item.slug) ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => toggleCompare(item.slug)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${compareSlugs.includes(item.slug) ? 'bg-charcoal text-cream' : 'bg-white text-charcoal hover:text-oak'}`}
                  >
                    <BarChart2 size={18} />
                  </button>
                </div>
                <Link
                  href={item.hasDetail ? `/product/${item.slug}` : "#"}
                  className="block cursor-pointer"
                >
                  <div className={`product-img-area relative aspect-[3/4] flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.03] ${!item.img ? 'bg-[#E8DFD0]' : ''}`}>
                    {item.img ? (
                      <img src={item.img} alt={item.n} className="w-full h-full object-cover block" loading="lazy" />
                    ) : (
                      <svg className="w-16 h-16 opacity-[0.28]" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="40" width="60" height="8" rx="2" stroke="#B8812A" strokeWidth="1.5" />
                        <path d="M25 48 L18 70 M55 48 L62 70" stroke="#B8812A" strokeWidth="1.5" />
                        <path d="M20 48 L22 60 M60 48 L58 60" stroke="#B8812A" strokeWidth="1" />
                      </svg>
                    )}
                    <div className="product-overlay absolute inset-0 bg-[linear-gradient(to_top,rgba(30,26,20,0.7)_0%,transparent_50%)] opacity-0 transition-opacity duration-300 flex items-end p-7 group-hover:opacity-100">
                      <span className="text-white text-[11px] tracking-[2px] uppercase">
                        {item.hasDetail ? t['product.viewDetails'] : t['product.inquire']}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="product-info p-7 border-t border-border relative">
                  <Link href={item.hasDetail ? `/product/${item.slug}` : "#"} className="block mb-1 hover:text-oak transition-colors">
                    <div className="product-name font-serif text-[22px] text-charcoal">{item.n}</div>
                  </Link>
                  <div className="product-material text-[11px] tracking-[1.5px] text-warm-mid uppercase">{catLabel}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="product-price font-serif text-[18px] text-oak">{priceText}</div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Added to cart:', item.n);
                      }}
                      className="add-to-cart-btn bg-charcoal text-cream border-none px-4 py-2 font-sans text-[9px] tracking-[1.5px] uppercase cursor-pointer transition-all hover:bg-oak-dark"
                    >
                      {t["product.addToCart"]}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="catalog-empty py-[60px] text-center text-warm-mid text-[14px] col-span-full">
              {t["catalog.empty"]}
            </div>
          )}
        </div>
      </section>

      {/* CRAFTSMANSHIP */}
      <section className="craft-section bg-charcoal px-10 md:px-20 py-24 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="craft-content">
          <div className="craft-eyebrow text-[10px] tracking-[4px] uppercase text-oak mb-5">{t["craft.eyebrow"]}</div>
          <h2 className="craft-title font-serif text-[clamp(38px,4vw,58px)] font-light text-white leading-[1.1] mb-8" dangerouslySetInnerHTML={{ __html: t["craft.title"] }} />
          <p className="craft-text text-[15px] text-white/55 leading-[1.85] mb-12">{t["craft.text"]}</p>
          <div className="craft-features grid grid-cols-1 sm:grid-cols-2 gap-7">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="craft-feat border-t border-oak/30 pt-5">
                <div className="craft-feat-title text-[12px] tracking-[2px] uppercase text-oak-light mb-2">{t[`cf${num}.title`]}</div>
                <div className="craft-feat-text text-[13px] text-white/45 leading-[1.6]">{t[`cf${num}.text`]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="craft-visual relative h-[500px] border border-oak/20 flex items-center justify-center hidden lg:flex">
          <div className="craft-visual-inner text-center">
            <svg className="craft-wood-grain w-[240px] h-[320px] mx-auto mb-6 opacity-25" viewBox="0 0 240 320" fill="none">
              <rect x="1" y="1" width="238" height="318" rx="4" stroke="#B8812A" strokeWidth="0.5" />
              <path d="M0 30 Q60 25 120 32 Q180 40 240 28" stroke="#B8812A" strokeWidth="0.4" fill="none" />
              <path d="M0 55 Q80 48 160 58 Q200 63 240 50" stroke="#B8812A" strokeWidth="0.6" fill="none" />
              <path d="M0 78 Q40 74 120 80 Q190 86 240 72" stroke="#B8812A" strokeWidth="0.3" fill="none" />
              <path d="M0 102 Q100 95 180 105 Q210 110 240 98" stroke="#B8812A" strokeWidth="0.5" fill="none" />
              <path d="M0 128 Q70 120 150 130 Q195 136 240 122" stroke="#B8812A" strokeWidth="0.4" fill="none" />
              <path d="M0 155 Q90 148 170 158 Q205 163 240 150" stroke="#B8812A" strokeWidth="0.6" fill="none" />
              <path d="M0 180 Q50 175 130 182 Q190 188 240 174" stroke="#B8812A" strokeWidth="0.3" fill="none" />
              <ellipse cx="85" cy="100" rx="18" ry="12" stroke="#B8812A" strokeWidth="0.5" fill="none" />
              <ellipse cx="85" cy="100" rx="10" ry="6" stroke="#B8812A" strokeWidth="0.4" fill="none" />
              <ellipse cx="85" cy="100" rx="4" ry="2.5" stroke="#B8812A" strokeWidth="0.6" fill="none" />
              <path d="M0 205 Q110 198 200 208 Q220 212 240 200" stroke="#B8812A" strokeWidth="0.4" fill="none" />
              <path d="M0 232 Q60 226 140 234 Q195 240 240 226" stroke="#B8812A" strokeWidth="0.5" fill="none" />
              <path d="M0 258 Q80 252 160 260 Q205 266 240 252" stroke="#B8812A" strokeWidth="0.3" fill="none" />
              <path d="M0 285 Q100 278 180 287 Q215 292 240 278" stroke="#B8812A" strokeWidth="0.5" fill="none" />
            </svg>
            <div className="craft-caption font-serif italic text-[18px] text-white/40 tracking-[1px]">Quercus robur</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section px-10 md:px-20 py-32 text-center relative overflow-hidden">
        <div className="cta-bg-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[80px] md:text-[200px] font-light text-oak/[0.05] whitespace-nowrap pointer-events-none tracking-[-8px]">OAK</div>
        <div className="cta-eyebrow text-[10px] tracking-[4px] uppercase text-oak mb-6">{t["cta.eyebrow"]}</div>
        <h2 className="cta-title font-serif text-[clamp(42px,5vw,72px)] font-light leading-[1.1] mb-6 text-charcoal" dangerouslySetInnerHTML={{ __html: t["cta.title"] }} />
        <p className="cta-subtitle text-[15px] text-warm-mid max-w-[500px] mx-auto mb-12">{t["cta.subtitle"]}</p>
        <div className="contact-form flex flex-col md:flex-row gap-0 max-w-[520px] mx-auto mb-5">
          <input
            type="email"
            className="flex-1 px-6 py-4 border border-border bg-white text-[14px] text-charcoal outline-none focus:border-oak"
            placeholder={t["cta.email"]}
          />
          <button className="bg-oak text-white border-none px-8 py-4 font-sans text-[11px] tracking-[2px] uppercase cursor-pointer whitespace-nowrap transition-all hover:bg-oak-dark">
            {t["cta.send"]}
          </button>
        </div>
        <p className="cta-note text-[12px] text-warm-mid/60 tracking-[0.5px]">{t["cta.note"]}</p>
      </section>
    </div>
  );
}
