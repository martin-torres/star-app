import { insforge } from './client';

export interface PromoRecord {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed' | 'bundle';
  discount_value?: number;
  original_price?: number;
  image_url?: string;
  category?: string;
  active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoInput {
  restaurant_id: string;
  name: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed' | 'bundle';
  discount_value?: number;
  original_price?: number;
  image_url?: string;
  category?: string;
  active?: boolean;
  starts_at?: string;
  ends_at?: string;
}

export class InsForgePromosRepository {
  async list(restaurantId: string, activeOnly?: boolean): Promise<PromoRecord[]> {
    let query = insforge.database
      .from('promos')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    if (activeOnly) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as any;
  }

  async getById(id: string): Promise<PromoRecord> {
    const { data, error } = await insforge.database
      .from('promos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as any;
  }

  async create(input: PromoInput): Promise<PromoRecord> {
    const { data, error } = await insforge.database
      .from('promos')
      .insert([input])
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async update(id: string, patch: Partial<PromoRecord>): Promise<PromoRecord> {
    const { data, error } = await insforge.database
      .from('promos')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async remove(id: string): Promise<void> {
    const { error } = await insforge.database.from('promos').delete().eq('id', id);
    if (error) throw error;
  }
}
