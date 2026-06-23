'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, User, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { useLanguage } from '@/lib/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

export default function Navbar() {
  const { lang, setLang } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isUserOpen, setIsUserOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="flex items-center justify-between px-10 py-7 border-b border-border sticky top-0 bg-cream/95 backdrop-blur-md z-[100]">
      <Link href="/" className="text-[28px] font-serif tracking-[4px] uppercase text-charcoal">
        Arden<span className="text-oak">Wood</span>
      </Link>

      <ul className="hidden lg:flex gap-9 list-none">
        {['Collection', 'Craftsmanship', 'Custom Order', 'About', 'Contact'].map((item) => (
          <li key={item}>
            <Link href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[11px] tracking-[2px] uppercase text-warm-mid hover:text-oak transition-colors">
              {item}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-6">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="text-warm-mid hover:text-oak transition-colors flex items-center gap-1"
          >
            <Globe size={18} />
            <ChevronDown size={12} />
          </button>
          {isLangOpen && (
            <div className="absolute right-0 mt-4 w-48 bg-white border border-border shadow-xl py-2 z-[110]">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setIsLangOpen(false);
                    // Add logic to change language globally
                  }}
                  className="w-full text-left px-4 py-2 text-[12px] flex items-center gap-3 hover:bg-cream transition-colors"
                >
                  <span>{l.flag}</span>
                  <span className={lang === l.code ? 'text-oak font-medium' : 'text-charcoal'}>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsUserOpen(!isUserOpen)}
              className="w-10 h-10 rounded-full bg-charcoal text-cream flex items-center justify-center text-sm font-medium border border-oak/20 hover:border-oak transition-all"
            >
              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </button>
            {isUserOpen && (
              <div className="absolute right-0 mt-4 w-48 bg-white border border-border shadow-xl py-2 z-[110]">
                <div className="px-4 py-2 border-b border-border mb-1">
                  <p className="text-[10px] text-warm-mid uppercase tracking-wider">Signed in as</p>
                  <p className="text-[12px] font-medium truncate">{profile?.full_name || user.email}</p>
                </div>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="block px-4 py-2 text-[12px] text-oak hover:bg-cream transition-colors font-medium">
                    Admin Panel
                  </Link>
                )}
                <Link href="/account" className="block px-4 py-2 text-[12px] text-charcoal hover:bg-cream transition-colors">
                  My Account
                </Link>
                <Link href="/orders" className="block px-4 py-2 text-[12px] text-charcoal hover:bg-cream transition-colors">
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-[12px] text-red-600 hover:bg-cream transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[11px] tracking-[2px] uppercase text-warm-mid hover:text-oak transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-[11px] tracking-[2px] uppercase text-warm-mid hover:text-oak transition-colors">
              Register
            </Link>
          </div>
        )}

        <button className="hidden sm:block text-[11px] tracking-[2px] uppercase py-[11px] px-6 border border-oak text-oak hover:bg-oak hover:text-white transition-all font-sans">
          Get a Quote
        </button>
      </div>
    </nav>
  );
}
