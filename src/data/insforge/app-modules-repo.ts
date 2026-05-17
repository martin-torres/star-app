import { insforge } from './client';

export interface AppModuleRecord {
  id: string;
  restaurant_id: string;
  slug: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export class InsForgeAppModulesRepository {
  async list(restaurantId: string): Promise<AppModuleRecord[]> {
    const { data, error } = await insforge.database
      .from('app_modules')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at');
    if (error) throw error;
    return (data || []) as any;
  }

  async getBySlug(restaurantId: string, slug: string): Promise<AppModuleRecord | null> {
    const { data, error } = await insforge.database
      .from('app_modules')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data ? (data as any) : null;
  }

  async upsert(record: {
    restaurant_id: string;
    slug: string;
    enabled?: boolean;
    settings?: Record<string, unknown>;
  }): Promise<AppModuleRecord> {
    const existing = await this.getBySlug(record.restaurant_id, record.slug);
    if (existing) {
      const patch: Record<string, unknown> = {};
      if (record.enabled !== undefined) patch.enabled = record.enabled;
      if (record.settings !== undefined) patch.settings = record.settings;
      const { data, error } = await insforge.database
        .from('app_modules')
        .update(patch)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as any;
    }
    const { data, error } = await insforge.database
      .from('app_modules')
      .insert([record])
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }
}
