// React hook for translations
'use client';

import { useEffect, useState } from 'react';
import { useLanguageStore } from './store';
import { t, getLanguage, type Translations } from './i18n';

export function useTranslation(): Translations {
  const { language } = useLanguageStore();
  const [translations, setTranslations] = useState<Translations>(() => {
    // Initialize with current language from i18n (handles SSR/hydration)
    if (typeof window !== 'undefined') {
      return t();
    }
    // Fallback for SSR
    const currentLang = getLanguage();
    return t();
  });

  useEffect(() => {
    // Update translations when language changes in store
    setTranslations(t());
    
    // Also listen for language change events (from i18n module)
    const handleLanguageChange = () => {
      setTranslations(t());
    };
    
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, [language]);

  return translations;
}
