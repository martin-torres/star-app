import type { TablesRepository } from '../contracts/tables-repo';
import type { RestaurantTable } from '../../core/types';
import { insforge } from './client';
import { toRestaurantTable } from './mappers';

export class InsForgeTablesRepository implements TablesRepository {
  async getAll(restaurantId: string): Promise<RestaurantTable[]> {
    const { data, error } = await insforge.database
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number', { ascending: true });
    if (error) throw error;
    return (data || []).map(r => toRestaurantTable(r as any));
  }

  async getAvailable(restaurantId: string): Promise<RestaurantTable[]> {
    const { data, error } = await insforge.database
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('table_number', { ascending: true });
    if (error) throw error;
    return (data || []).map(r => toRestaurantTable(r as any));
  }

  async getById(id: string): Promise<RestaurantTable> {
    const { data, error } = await insforge.database
      .from('restaurant_tables')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toRestaurantTable(data as any);
  }

  async create(table: Omit<RestaurantTable, 'id'>): Promise<RestaurantTable> {
    const { data, error } = await insforge.database
      .from('restaurant_tables')
      .insert([table])
      .select()
      .single();
    if (error) throw error;
    return toRestaurantTable(data as any);
  }

  async update(id: string, data: Partial<RestaurantTable>): Promise<RestaurantTable> {
    const { data: record, error } = await insforge.database
      .from('restaurant_tables')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toRestaurantTable(record as any);
  }

  async delete(id: string): Promise<void> {
    const { error } = await insforge.database.from('restaurant_tables').delete().eq('id', id);
    if (error) throw error;
  }
}
