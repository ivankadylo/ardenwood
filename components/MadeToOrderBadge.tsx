'use client';

export default function MadeToOrderBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur-sm border border-oak/20 rounded-full shadow-sm animate-fadeIn">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-oak opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-oak"></span>
      </span>
      <span className="text-[9px] tracking-[1px] uppercase font-medium text-charcoal/80">
        Made to Order · ~4 weeks
      </span>
    </div>
  );
}
