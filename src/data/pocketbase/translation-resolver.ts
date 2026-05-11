import { insforge } from './client';
import type { SupportedLanguage } from '../../utils/languageResolver';

export interface MenuItemTranslation {
  menu_item: string;
  language: SupportedLanguage;
  description: string;
}

export interface CategoryTranslation {
  category_code: string;
  language: SupportedLanguage;
  display_name: string;
}

export interface UiTranslation {
  key: string;
  language: SupportedLanguage;
  value: string;
}

export class TranslationResolver {
  private menuItemTranslations: Map<string, Map<SupportedLanguage, string>> = new Map();
  private categoryTranslations: Map<string, Map<SupportedLanguage, string>> = new Map();
  private uiTranslations: Map<string, Map<SupportedLanguage, string>> = new Map();

  async loadAll(): Promise<void> {
    await Promise.all([
      this.loadMenuItemTranslations(),
      this.loadCategoryTranslations(),
      this.loadUiTranslations(),
    ]);
  }

  private async loadMenuItemTranslations(): Promise<void> {
    try {
      const { data: records, error } = await insforge.database
        .from('menu_item_translations')
        .select('*');
      if (error) throw error;
      
      this.menuItemTranslations.clear();
      for (const record of (records || []) as MenuItemTranslation[]) {
        if (!this.menuItemTranslations.has(record.menu_item)) {
          this.menuItemTranslations.set(record.menu_item, new Map());
        }
        this.menuItemTranslations.get(record.menu_item)!.set(record.language, record.description);
      }
    } catch (e: any) {
      console.warn('⚠️ menu_item_translations collection not found, skipping translations');
    }
  }

  private async loadCategoryTranslations(): Promise<void> {
    try {
      const { data: records, error } = await insforge.database
        .from('category_translations')
        .select('*');
      if (error) throw error;
      
      this.categoryTranslations.clear();
      for (const record of (records || []) as CategoryTranslation[]) {
        if (!this.categoryTranslations.has(record.category_code)) {
          this.categoryTranslations.set(record.category_code, new Map());
        }
        this.categoryTranslations.get(record.category_code)!.set(record.language, record.display_name);
      }
    } catch (e: any) {
      console.warn('⚠️ category_translations collection not found, skipping translations');
    }
  }

  private async loadUiTranslations(): Promise<void> {
    try {
      const { data: records, error } = await insforge.database
        .from('ui_translations')
        .select('*');
      if (error) throw error;
      
      this.uiTranslations.clear();
      for (const record of (records || []) as UiTranslation[]) {
        if (!this.uiTranslations.has(record.key)) {
          this.uiTranslations.set(record.key, new Map());
        }
        this.uiTranslations.get(record.key)!.set(record.language, record.value);
      }
    } catch (e: any) {
      console.warn('⚠️ ui_translations collection not found, skipping translations');
    }
  }

  getMenuItemDescription(menuItemId: string, language: SupportedLanguage): string | undefined {
    const translations = this.menuItemTranslations.get(menuItemId);
    const result = translations?.get(language);
    console.log(`🔍 Translation lookup: item="${menuItemId}", lang="${language}", result="${result}"`);
    return result;
  }

  getCategoryDisplayName(categoryCode: string, language: SupportedLanguage): string | undefined {
    const translations = this.categoryTranslations.get(categoryCode);
    return translations?.get(language);
  }

  getUiText(key: string, language: SupportedLanguage): string | undefined {
    const translations = this.uiTranslations.get(key);
    return translations?.get(language);
  }
}

let instance: TranslationResolver | null = null;

export function getTranslationResolver(): TranslationResolver {
  if (!instance) {
    instance = new TranslationResolver();
  }
  return instance;
}