import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { translations, TranslationKeys } from '../translations';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(() => {
    // Attempt to get language from localStorage, then browser, then default to 'en'
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('mintmark-lang') : null;
    if (storedLang && translations[storedLang]) {
      return storedLang;
    }
    const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    return translations[browserLang] ? browserLang : 'en';
  });

  const handleSetLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguage(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mintmark-lang', lang);
      }
    }
  };

  const currentTranslations = useMemo(() => translations[language] || translations.en, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};
