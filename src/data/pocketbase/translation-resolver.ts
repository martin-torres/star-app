/**
 * Translation resolver.
 *
 * The star-app PocketBase schema has no translation collections yet, so each
 * loader fails soft (the same behaviour the pre-006 resolver had): the app falls
 * back to the Spanish strings baked into the UI. Adding translation collections
 * later only requires generating them - this code already reads the right shape.
 */
import { pb } from './client';
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
      const records = await pb
        .collection('menu_item_translations')
        .getFullList<MenuItemTranslation>();
      this.menuItemTranslations.clear();
      for (const record of records) {
        if (!this.menuItemTranslations.has(record.menu_item)) {
          this.menuItemTranslations.set(record.menu_item, new Map());
        }
        this.menuItemTranslations.get(record.menu_item)!.set(record.language, record.description);
      }
    } catch {
      console.warn('⚠️ menu_item_translations collection not found, skipping translations');
    }
  }

  private async loadCategoryTranslations(): Promise<void> {
    try {
      const records = await pb
        .collection('category_translations')
        .getFullList<CategoryTranslation>();
      this.categoryTranslations.clear();
      for (const record of records) {
        if (!this.categoryTranslations.has(record.category_code)) {
          this.categoryTranslations.set(record.category_code, new Map());
        }
        this.categoryTranslations
          .get(record.category_code)!
          .set(record.language, record.display_name);
      }
    } catch {
      console.warn('⚠️ category_translations collection not found, skipping translations');
    }
  }

  private async loadUiTranslations(): Promise<void> {
    try {
      const records = await pb.collection('ui_translations').getFullList<UiTranslation>();
      this.uiTranslations.clear();
      for (const record of records) {
        if (!this.uiTranslations.has(record.key)) {
          this.uiTranslations.set(record.key, new Map());
        }
        this.uiTranslations.get(record.key)!.set(record.language, record.value);
      }
    } catch {
      console.warn('⚠️ ui_translations collection not found, skipping translations');
    }
  }

  getMenuItemDescription(menuItemId: string, language: SupportedLanguage): string | undefined {
    return this.menuItemTranslations.get(menuItemId)?.get(language);
  }

  getCategoryDisplayName(categoryCode: string, language: SupportedLanguage): string | undefined {
    return this.categoryTranslations.get(categoryCode)?.get(language);
  }

  getUiText(key: string, language: SupportedLanguage): string | undefined {
    return this.uiTranslations.get(key)?.get(language);
  }
}

let instance: TranslationResolver | null = null;

export function getTranslationResolver(): TranslationResolver {
  if (!instance) {
    instance = new TranslationResolver();
  }
  return instance;
}
