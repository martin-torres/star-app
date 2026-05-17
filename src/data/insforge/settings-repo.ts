import type { SettingsRepository } from '../contracts';
import type { AppSkinSettings } from '../../core/types';
import { insforge } from './client';
import { toAppSkinSettings } from './mappers';

export class InsForgeSettingsRepository implements SettingsRepository {
  async get(restaurantId?: string): Promise<AppSkinSettings | null> {
    try {
      if (!restaurantId) return null;

      // Fetch the restaurant row (branding fields live here)
      const { data: restaurant, error: rErr } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      if (rErr) throw rErr;

      // Fetch extra settings from restaurant_settings
      const { data: settings } = await insforge.database
        .from('restaurant_settings')
        .select('data')
        .eq('restaurant_id', restaurantId)
        .limit(1)
        .maybeSingle();

      return toAppSkinSettings(
        restaurant as any,
        (settings as any)?.data as Record<string, unknown> | null,
      );
    } catch (error: any) {
      if (error?.status === 404 || error?.message?.includes('not found') || error?.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
  }

  async save(settingsData: Partial<AppSkinSettings>, restaurantId?: string): Promise<AppSkinSettings> {
    if (!restaurantId) throw new Error('restaurant_id is required for InsForgeSettingsRepository.save');

    // Update straight restaurant columns for top-level branding fields
    const restaurantFields: Record<string, unknown> = {};
    if (settingsData.name !== undefined) restaurantFields.name = settingsData.name;
    if (settingsData.currency !== undefined) restaurantFields.currency = settingsData.currency;
    if (settingsData.tagline !== undefined) restaurantFields.tagline = settingsData.tagline;
    if (settingsData.description !== undefined) restaurantFields.description = settingsData.description;
    if (settingsData.logoUrl !== undefined) restaurantFields.logo_url = settingsData.logoUrl;
    if (settingsData.heroImageUrl !== undefined) restaurantFields.hero_image_url = settingsData.heroImageUrl;
    if (settingsData.heroTitle !== undefined) restaurantFields.hero_text = settingsData.heroTitle;
    if (settingsData.primaryColor !== undefined) restaurantFields.primary_color = settingsData.primaryColor;
    if (settingsData.secondaryColor !== undefined) restaurantFields.secondary_color = settingsData.secondaryColor;
    if (settingsData.accentColor !== undefined) restaurantFields.accent_color = settingsData.accentColor;
    if (settingsData.backgroundColor !== undefined) restaurantFields.background_color = settingsData.backgroundColor;
    if (settingsData.googleFontUrl !== undefined) restaurantFields.google_font_url = settingsData.googleFontUrl;
    if (settingsData.googleFontName !== undefined) restaurantFields.google_font_name = settingsData.googleFontName;
    if (settingsData.mode !== undefined) restaurantFields.mode = settingsData.mode;

    if (Object.keys(restaurantFields).length > 0) {
      await insforge.database
        .from('restaurants')
        .update(restaurantFields)
        .eq('id', restaurantId);
    }

    // Save the rest into restaurant_settings.data blob
    const extraSettings: Record<string, unknown> = {};
    const topLevelKeys = new Set([
      'name', 'currency', 'tagline', 'description', 'logoUrl', 'heroImageUrl',
      'heroTitle', 'primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor',
      'googleFontUrl', 'googleFontName', 'mode',
    ]);
    for (const [key, value] of Object.entries(settingsData)) {
      if (!topLevelKeys.has(key)) {
        extraSettings[key] = value;
      }
    }

    if (Object.keys(extraSettings).length > 0) {
      // Upsert into restaurant_settings
      const { data: existing } = await insforge.database
        .from('restaurant_settings')
        .select('id, data')
        .eq('restaurant_id', restaurantId)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const merged = { ...((existing as any).data || {}), ...extraSettings };
        await insforge.database
          .from('restaurant_settings')
          .update({ data: merged })
          .eq('id', (existing as any).id);
      } else {
        await insforge.database
          .from('restaurant_settings')
          .insert([{ restaurant_id: restaurantId, data: extraSettings }]);
      }
    }

    // Return merged result
    const result = await this.get(restaurantId);
    return result || (settingsData as AppSkinSettings);
  }
}
