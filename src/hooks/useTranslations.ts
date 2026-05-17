import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslationResolver } from '../data/insforge/translation-resolver';
import type { SupportedLanguage } from '../utils/languageResolver';

export function useTranslations() {
  const { language } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(`🌐 useTranslations hook called - current language: "${language}"`);

  useEffect(() => {
    const resolver = getTranslationResolver();
    
    resolver.loadAll()
      .then(() => {
        console.log(`✅ Translations loaded`);
        setLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load translations:', err);
        setError(err.message);
        setLoaded(true);
      });
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const resolver = getTranslationResolver();
    const translated = resolver.getUiText(key, language);
    const result = translated ?? fallback ?? key;
    console.log(`🔤 UI Translation: key="${key}", lang="${language}", result="${result}"`);
    return result;
  }, [language]);

  const getItemDescription = useCallback((itemId: string, fallback?: string): string => {
    const resolver = getTranslationResolver();
    const translated = resolver.getMenuItemDescription(itemId, language);
    return translated ?? fallback ?? '';
  }, [language]);

  const getCategoryName = useCallback((categoryCode: string, fallback?: string): string => {
    const resolver = getTranslationResolver();
    const translated = resolver.getCategoryDisplayName(categoryCode, language);
    return translated ?? fallback ?? categoryCode;
  }, [language]);

  return {
    language,
    loaded,
    error,
    t,
    getItemDescription,
    getCategoryName,
  };
}
