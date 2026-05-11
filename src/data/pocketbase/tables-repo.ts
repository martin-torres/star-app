import type { TablesRepository } from '../contracts/tables-repo';
import type { RestaurantTable } from '../../core/types';
import { insforge } from './client';

export class PocketBaseTablesRepository implements TablesRepository {
  async getAll(restaurantId: string): Promise<RestaurantTable[]> {
    const { data, error } = await insforge.database
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number', { ascending: true });
    if (error) throw error;
    return (data || []).map(r => this._toTable(r));
  }

  async getAvailable(restaurantId: string): Promise<RestaurantTable[]> {
    const { data, error } = await insforge.database
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('table_number', { ascending: true });
    if (error) throw error;
    return (data || []).map(r => this._toTable(r));
  }

  async getById(id: string): Promise<RestaurantTable> {
    const { data, error } = await insforge.database
      .from('tables')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return this._toTable(data);
  }

  async create(table: Omit<RestaurantTable, 'id'>): Promise<RestaurantTable> {
    const { data, error } = await insforge.database
      .from('tables')
      .insert([table])
      .select()
      .single();
    if (error) throw error;
    return this._toTable(data);
  }

  async update(id: string, data: Partial<RestaurantTable>): Promise<RestaurantTable> {
    const { data: record, error } = await insforge.database
      .from('tables')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this._toTable(record);
  }

  async delete(id: string): Promise<void> {
    const { error } = await insforge.database.from('tables').delete().eq('id', id);
    if (error) throw error;
  }

  private _toTable(r: Record<string, unknown> & { id: string }): RestaurantTable {
    return {
      id: r.id,
      restaurant_id: String(r.restaurant_id || ''),
      table_number: Number(r.table_number || 0),
      display_name: r.display_name ? String(r.display_name) : undefined,
      seats: Number(r.seats || 1),
      location: r.location as RestaurantTable['location'],
      qr_code_url: r.qr_code_url ? String(r.qr_code_url) : undefined,
      x: r.x !== undefined ? Number(r.x) : undefined,
      y: r.y !== undefined ? Number(r.y) : undefined,
      is_available: r.is_available === true || r.is_available === undefined,
    };
  }
}
