import type { MenuRepository } from '../contracts';
import type { MenuCategory, MenuItem, PromoItem } from '../../core/types';
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { and, eq } from './query';
import { menuItemToDb, toMenuItem, toPromoItem, type RawRecord } from './mappers';

export class PocketBaseMenuRepository implements MenuRepository {
  async getAll(restaurantId?: string): Promise<MenuItem[]> {
    const records = await pb.collection(COLLECTIONS.menuItems).getFullList<RawRecord>({
      filter: and(restaurantId ? eq('restaurant_id', restaurantId) : ''),
      sort: 'category,name',
    });
    return records.map(toMenuItem);
  }

  async getByCategory(category: MenuCategory, restaurantId?: string): Promise<MenuItem[]> {
    const records = await pb.collection(COLLECTIONS.menuItems).getFullList<RawRecord>({
      filter: and(
        eq('category', category),
        restaurantId ? eq('restaurant_id', restaurantId) : '',
      ),
      sort: 'name',
    });
    return records.map(toMenuItem);
  }

  async getById(id: string): Promise<MenuItem> {
    const record = await pb.collection(COLLECTIONS.menuItems).getOne<RawRecord>(id);
    return toMenuItem(record);
  }

  async getActivePromos(restaurantId?: string): Promise<PromoItem[]> {
    const records = await pb.collection(COLLECTIONS.promos).getFullList<RawRecord>({
      filter: and('active = true', restaurantId ? eq('restaurant_id', restaurantId) : ''),
      sort: 'name',
    });
    return records.map(toPromoItem);
  }

  async create(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const record = await pb
      .collection(COLLECTIONS.menuItems)
      .create<RawRecord>(menuItemToDb(item));
    return toMenuItem(record);
  }

  async update(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    const record = await pb
      .collection(COLLECTIONS.menuItems)
      .update<RawRecord>(id, menuItemToDb(data));
    return toMenuItem(record);
  }

  async remove(id: string): Promise<void> {
    await pb.collection(COLLECTIONS.menuItems).delete(id);
  }
}
