import type { SettingsRepository } from '../contracts';
import type { AppSkinSettings } from '../../core/types';
import { insforge } from './client';

export class PocketBaseSettingsRepository implements SettingsRepository {
  async get(restaurantId?: string): Promise<AppSkinSettings | null> {
    try {
      let query = insforge.database.from('restaurant_configs').select('*');
      if (restaurantId) query = query.eq('restaurant_id', restaurantId);
      const { data, error } = await query.limit(1);
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return (data[0] as any)?.data || null;
    } catch (error: any) {
      if (error?.status === 404 || error?.message?.includes('not found') || error?.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
  }

  async save(settingsData: Partial<AppSkinSettings>, restaurantId?: string): Promise<AppSkinSettings> {
    let query = insforge.database.from('restaurant_configs').select('*');
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    const { data: existing } = await query.limit(1);

    if (existing && existing.length > 0) {
      const current = existing[0] as any;
      const merged = { ...(current.data || {}), ...settingsData };
      const { data: updated, error } = await insforge.database
        .from('restaurant_configs')
        .update({ data: merged })
        .eq('id', existing[0].id)
        .select();
      if (error) throw error;
      return ((updated as any)?.[0]?.data || merged) as AppSkinSettings;
    }

    const payload = restaurantId
      ? { restaurant_id: restaurantId, data: settingsData }
      : { data: settingsData };
    const { data: created, error } = await insforge.database
      .from('restaurant_configs')
      .insert([payload])
      .select();
    if (error) throw error;
    return ((created as any)?.[0]?.data || settingsData) as AppSkinSettings;
  }
}
