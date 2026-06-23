'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      setLangState(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const supported = ['en', 'de', 'fr', 'cs', 'pl', 'it', 'es', 'nl', 'sk', 'uk'];
      if (supported.includes(browserLang)) {
        setLangState(browserLang);
        localStorage.setItem('lang', browserLang);
      }
    }
  }, []);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
