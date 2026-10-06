import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { resolveLanguage, setLanguage as setLangStorage, type SupportedLanguage } from '../utils/languageResolver';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => resolveLanguage());

  useEffect(() => {
    const handleStorageChange = () => {
      setLanguageState(resolveLanguage());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLangStorage(lang);
    setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}