import { insforge } from './client';

export interface FloorPlanRecord {
  id: string;
  restaurant_id: string;
  canvas_w: number;
  canvas_h: number;
  grid_size: number;
  created_at: string;
  updated_at: string;
}

export class InsForgeFloorPlanRepository {
  async getByRestaurant(restaurantId: string): Promise<FloorPlanRecord | null> {
    const { data, error } = await insforge.database
      .from('floor_plans')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? (data as any) : null;
  }

  async getById(id: string): Promise<FloorPlanRecord> {
    const { data, error } = await insforge.database
      .from('floor_plans')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as any;
  }

  async create(plan: {
    restaurant_id: string;
    canvas_w?: number;
    canvas_h?: number;
    grid_size?: number;
  }): Promise<FloorPlanRecord> {
    const { data, error } = await insforge.database
      .from('floor_plans')
      .insert([plan])
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async update(id: string, patch: Partial<FloorPlanRecord>): Promise<FloorPlanRecord> {
    const { data, error } = await insforge.database
      .from('floor_plans')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async remove(id: string): Promise<void> {
    const { error } = await insforge.database.from('floor_plans').delete().eq('id', id);
    if (error) throw error;
  }
}
