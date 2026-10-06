import type { SettingsRepository } from '../contracts';
import type { AppSkinSettings } from '../../core/types';
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { eq } from './query';
import { asRecord, firstOrNull, isNotFound } from './read';
import {
  appSkinSettingsToExtraData,
  appSkinSettingsToRestaurantFields,
  toAppSkinSettings,
  type RawRecord,
} from './mappers';

export class PocketBaseSettingsRepository implements SettingsRepository {
  /**
   * Resolve the restaurant row for a given id/slug, or fall back to the demo
   * restaurant / the first row so a URL without `?restaurant_id=` still shows
   * branding instead of an unstyled app.
   */
  private async resolveRestaurant(restaurantId?: string): Promise<RawRecord | null> {
    if (restaurantId) {
      try {
        return await pb.collection(COLLECTIONS.restaurants).getOne<RawRecord>(restaurantId);
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }
      return firstOrNull<RawRecord>(COLLECTIONS.restaurants, eq('slug', restaurantId));
    }

    const demoSlug = (import.meta.env.VITE_DEMO_RESTAURANT as string | undefined)?.trim();
    if (demoSlug) {
      const demo = await firstOrNull<RawRecord>(COLLECTIONS.restaurants, eq('slug', demoSlug));
      if (demo) return demo;
    }

    const list = await pb
      .collection(COLLECTIONS.restaurants)
      .getList<RawRecord>(1, 1, { sort: 'created_at' });
    return list.items[0] ?? null;
  }

  async get(restaurantId?: string): Promise<AppSkinSettings | null> {
    try {
      const restaurant = await this.resolveRestaurant(restaurantId);
      if (!restaurant) return null;

      const settingsRow = await firstOrNull<RawRecord>(
        COLLECTIONS.restaurantSettings,
        eq('restaurant_id', restaurant.id),
      );

      return toAppSkinSettings(restaurant, asRecord(settingsRow?.data));
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async save(
    settingsData: Partial<AppSkinSettings>,
    restaurantId?: string,
  ): Promise<AppSkinSettings> {
    if (!restaurantId) {
      throw new Error('restaurant_id is required to save restaurant settings');
    }

    const restaurant = await this.resolveRestaurant(restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant "${restaurantId}" was not found`);
    }

    // Branding lives on the `restaurants` row...
    const restaurantFields = appSkinSettingsToRestaurantFields(settingsData);
    if (Object.keys(restaurantFields).length > 0) {
      await pb.collection(COLLECTIONS.restaurants).update(restaurant.id, restaurantFields);
    }

    // ...everything else goes into the restaurant_settings.data blob.
    const extraSettings = appSkinSettingsToExtraData(settingsData);
    if (Object.keys(extraSettings).length > 0) {
      const existing = await firstOrNull<RawRecord>(
        COLLECTIONS.restaurantSettings,
        eq('restaurant_id', restaurant.id),
      );
      const merged = { ...(asRecord(existing?.data) ?? {}), ...extraSettings };
      if (existing) {
        await pb.collection(COLLECTIONS.restaurantSettings).update(existing.id, { data: merged });
      } else {
        await pb
          .collection(COLLECTIONS.restaurantSettings)
          .create({ restaurant_id: restaurant.id, data: merged });
      }
    }

    const result = await this.get(restaurant.id);
    return result ?? (settingsData as AppSkinSettings);
  }
}
