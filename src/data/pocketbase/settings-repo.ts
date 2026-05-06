import type { SettingsRepository } from '../contracts';
import type { AppSkinSettings } from '../../core/types';
import { pbClient } from './client';

export class PocketBaseSettingsRepository implements SettingsRepository {
  async get(restaurantId?: string): Promise<AppSkinSettings | null> {
    try {
      const filter = restaurantId ? `restaurant_id = "${restaurantId}"` : '';
      const settings = await pbClient.collection('settings').getFullList({
        filter: filter || undefined,
      });
      if (settings.length === 0) {
        return null;
      }
      // Settings are stored in the `data` JSON field — unwrap them
      const record = settings[0] as any;
      return record?.data || null;
    } catch (error: any) {
      if (error?.status === 404 || error?.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async save(settingsData: Partial<AppSkinSettings>, restaurantId?: string): Promise<AppSkinSettings> {
    const filter = restaurantId ? `restaurant_id = "${restaurantId}"` : '';
    const existing = await pbClient.collection('settings').getFullList({
      filter: filter || undefined,
    });
    if (existing.length > 0) {
      // Update the data JSON field
      const current = existing[0] as any;
      const merged = { ...(current.data || {}), ...settingsData };
      const updated = await pbClient
        .collection('settings')
        .update(existing[0].id, { data: merged });
      return (updated as any)?.data as AppSkinSettings;
    }

    // Create new settings record with data wrapped in JSON field
    const payload = restaurantId
      ? { restaurant_id: restaurantId, data: settingsData }
      : { data: settingsData };
    const created = await pbClient.collection('settings').create(payload);
    return (created as any)?.data as AppSkinSettings;
  }
}
