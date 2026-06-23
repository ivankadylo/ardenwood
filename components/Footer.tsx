import Link from 'next/link';

export default function Footer() {
  return (
    <>
      <footer className="bg-charcoal px-10 md:px-20 pt-[60px] pb-10 grid grid-cols-1 md:grid-cols-4 gap-[60px]">
        <div className="col-span-1 md:col-span-1">
          <div className="text-2xl font-serif tracking-[4px] text-white uppercase mb-4">
            Arden<span className="text-oak">Wood</span>
          </div>
          <p className="text-[13px] text-white/35 leading-[1.7] mb-7 max-w-[260px]">
            Handcrafted oak furniture from the heart of Europe. Delivered across the EU.
          </p>
          <p className="text-[11px] text-white/20 leading-[1.6]">
            © 2024 IK Arden Group s.r.o.<br />
            Ostrava, Czech Republic<br />
            ardenwood.eu
          </p>
        </div>

        <div>
          <div className="text-[10px] tracking-[3px] uppercase text-oak mb-5">Products</div>
          <ul className="list-none space-y-[10px]">
            {['Tables', 'Doors', 'Shelving', 'Kitchen', 'Custom'].map((item) => (
              <li key={item}>
                <Link href="#" className="text-[13px] text-white/40 hover:text-oak-light transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[10px] tracking-[3px] uppercase text-oak mb-5">Information</div>
          <ul className="list-none space-y-[10px]">
            {['About Us', 'Our Process', 'Delivery', 'Wood Care', 'FAQ'].map((item) => (
              <li key={item}>
                <Link href="#" className="text-[13px] text-white/40 hover:text-oak-light transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-[10px] tracking-[3px] uppercase text-oak mb-5">Contact</div>
          <ul className="list-none space-y-[10px]">
            <li><a href="mailto:info@ardenwood.eu" className="text-[13px] text-white/40 hover:text-oak-light transition-colors">info@ardenwood.eu</a></li>
            <li><Link href="#" className="text-[13px] text-white/40 hover:text-oak-light transition-colors">Instagram</Link></li>
            <li><Link href="#" className="text-[13px] text-white/40 hover:text-oak-light transition-colors">TikTok</Link></li>
            <li><Link href="#" className="text-[13px] text-white/40 hover:text-oak-light transition-colors">Get a Quote</Link></li>
          </ul>
        </div>
      </footer>

      <div className="bg-charcoal px-10 md:px-20 py-5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex gap-4">
          <Link href="/privacy" className="text-[11px] text-white/20 tracking-[0.5px] hover:text-white/40">Privacy Policy</Link>
          <Link href="/cookies" className="text-[11px] text-white/20 tracking-[0.5px] hover:text-white/40">Cookie Policy</Link>
          <Link href="/terms" className="text-[11px] text-white/20 tracking-[0.5px] hover:text-white/40">Terms & Conditions</Link>
        </div>
        <span className="text-[11px] text-white/20 tracking-[0.5px]">
          ardenwood.eu · Solid European Oak Furniture
        </span>
      </div>
    </>
  );
}
