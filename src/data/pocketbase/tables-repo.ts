import type { TablesRepository } from '../contracts/tables-repo';
import type { RestaurantTable } from '../../core/types';
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { and, eq } from './query';
import { restaurantTableToDb, toRestaurantTable, type RawRecord } from './mappers';

export class PocketBaseTablesRepository implements TablesRepository {
  async getAll(restaurantId: string): Promise<RestaurantTable[]> {
    const records = await pb
      .collection(COLLECTIONS.restaurantTables)
      .getFullList<RawRecord>({
        filter: eq('restaurant_id', restaurantId),
        sort: 'table_number',
      });
    return records.map(toRestaurantTable);
  }

  async getAvailable(restaurantId: string): Promise<RestaurantTable[]> {
    const records = await pb
      .collection(COLLECTIONS.restaurantTables)
      .getFullList<RawRecord>({
        filter: and(eq('restaurant_id', restaurantId), 'is_available = true'),
        sort: 'table_number',
      });
    return records.map(toRestaurantTable);
  }

  async getById(id: string): Promise<RestaurantTable> {
    const record = await pb.collection(COLLECTIONS.restaurantTables).getOne<RawRecord>(id);
    return toRestaurantTable(record);
  }

  async create(table: Omit<RestaurantTable, 'id'>): Promise<RestaurantTable> {
    const record = await pb
      .collection(COLLECTIONS.restaurantTables)
      .create<RawRecord>(restaurantTableToDb(table));
    return toRestaurantTable(record);
  }

  async update(id: string, data: Partial<RestaurantTable>): Promise<RestaurantTable> {
    const record = await pb
      .collection(COLLECTIONS.restaurantTables)
      .update<RawRecord>(id, restaurantTableToDb(data));
    return toRestaurantTable(record);
  }

  async delete(id: string): Promise<void> {
    await pb.collection(COLLECTIONS.restaurantTables).delete(id);
  }
}
