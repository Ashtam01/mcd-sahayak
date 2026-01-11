'use client';

import { useLanguageStore } from '@/lib/store';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-sm">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md shadow-sm transition-all ${
          language === 'en'
            ? 'text-white bg-blue-600 hover:bg-blue-700'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
        }`}
      >
        ENG
      </button>
      <button
        onClick={() => handleLanguageChange('hi')}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md shadow-sm transition-all ${
          language === 'hi'
            ? 'text-white bg-blue-600 hover:bg-blue-700'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
        }`}
      >
        हिं
      </button>
    </div>
  );
}
