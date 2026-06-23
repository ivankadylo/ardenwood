'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (level: 'all' | 'essential') => {
    localStorage.setItem('cookie-consent', level);
    setShowBanner(false);
    // In a real app, you would also save this to the profile if logged in
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10000] bg-charcoal p-6 text-cream border-t border-oak/20 md:flex md:items-center md:justify-between">
      <div className="mb-4 md:mb-0 md:mr-8">
        <h3 className="font-serif text-xl mb-2 italic">Cookies & Privacy</h3>
        <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
        </p>
      </div>
      <div className="flex gap-4 shrink-0">
        <button
          onClick={() => handleConsent('essential')}
          className="text-[11px] uppercase tracking-[2px] py-3 px-6 border border-white/20 hover:border-white/40 transition-all"
        >
          Reject Non-Essential
        </button>
        <button
          onClick={() => handleConsent('all')}
          className="bg-oak text-[11px] uppercase tracking-[2px] py-3 px-6 text-white hover:bg-oak-dark transition-all"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
