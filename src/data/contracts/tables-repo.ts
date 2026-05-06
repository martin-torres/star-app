import type { RestaurantTable } from '../../core/types';

export interface TablesRepository {
  getAll(restaurantId: string): Promise<RestaurantTable[]>;
  getAvailable(restaurantId: string): Promise<RestaurantTable[]>;
  getById(id: string): Promise<RestaurantTable>;
  create(table: Omit<RestaurantTable, 'id'>): Promise<RestaurantTable>;
  update(id: string, data: Partial<RestaurantTable>): Promise<RestaurantTable>;
  delete(id: string): Promise<void>;
}
