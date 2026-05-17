import { insforge } from './client';

export interface FloorPropRecord {
  id: string;
  restaurant_id: string;
  floor_plan_id?: string;
  prop_type: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  created_at: string;
}

export class InsForgeFloorPropsRepository {
  async list(restaurantId: string, floorPlanId?: string): Promise<FloorPropRecord[]> {
    let query = insforge.database
      .from('floor_props')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at');
    if (floorPlanId) query = query.eq('floor_plan_id', floorPlanId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as any;
  }

  async getById(id: string): Promise<FloorPropRecord> {
    const { data, error } = await insforge.database
      .from('floor_props')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as any;
  }

  async create(prop: {
    restaurant_id: string;
    floor_plan_id?: string;
    prop_type: string;
    label?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
  }): Promise<FloorPropRecord> {
    const { data, error } = await insforge.database
      .from('floor_props')
      .insert([prop])
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async update(id: string, patch: Partial<FloorPropRecord>): Promise<FloorPropRecord> {
    const { data, error } = await insforge.database
      .from('floor_props')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async remove(id: string): Promise<void> {
    const { error } = await insforge.database.from('floor_props').delete().eq('id', id);
    if (error) throw error;
  }
}
