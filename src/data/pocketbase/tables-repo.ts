import type { TablesRepository } from '../contracts/tables-repo';
import type { RestaurantTable } from '../../core/types';
import { pbClient } from './client';

export class PocketBaseTablesRepository implements TablesRepository {
  async getAll(restaurantId: string): Promise<RestaurantTable[]> {
    const records = await pbClient.collection('tables').getFullList({
      filter: `restaurant_id = "${restaurantId}"`,
      sort: 'table_number',
    });
    return records.map(r => this._toTable(r as any));
  }

  async getAvailable(restaurantId: string): Promise<RestaurantTable[]> {
    const records = await pbClient.collection('tables').getFullList({
      filter: `restaurant_id = "${restaurantId}" && is_available = true`,
      sort: 'table_number',
    });
    return records.map(r => this._toTable(r as any));
  }

  async getById(id: string): Promise<RestaurantTable> {
    const record = await pbClient.collection('tables').getOne(id);
    return this._toTable(record as any);
  }

  async create(table: Omit<RestaurantTable, 'id'>): Promise<RestaurantTable> {
    const record = await pbClient.collection('tables').create(table);
    return this._toTable(record as any);
  }

  async update(id: string, data: Partial<RestaurantTable>): Promise<RestaurantTable> {
    const record = await pbClient.collection('tables').update(id, data);
    return this._toTable(record as any);
  }

  async delete(id: string): Promise<void> {
    await pbClient.collection('tables').delete(id);
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
