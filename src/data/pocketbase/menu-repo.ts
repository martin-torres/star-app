import type { MenuRepository } from '../contracts';
import type { MenuCategory, MenuItem, PromoItem } from '../../core/types';
import { pbClient } from './client';
import { toMenuItem, toPromoItem } from './mappers';

export class PocketBaseMenuRepository implements MenuRepository {
  async getAll(restaurantId?: string): Promise<MenuItem[]> {
    const filter = restaurantId
      ? `restaurant_id = "${restaurantId}"`
      : '';
    const items = await pbClient.collection('menu_items').getFullList({
      filter: filter || undefined,
      sort: 'category,name',
    });
    return items.map((item) => toMenuItem(item as any));
  }

  async getByCategory(category: MenuCategory, restaurantId?: string): Promise<MenuItem[]> {
    const filters = [`category = "${category}"`];
    if (restaurantId) filters.push(`restaurant_id = "${restaurantId}"`);
    const items = await pbClient.collection('menu_items').getFullList({
      filter: filters.join(' && '),
      sort: 'name',
    });
    return items.map((item) => toMenuItem(item as any));
  }

  async getById(id: string): Promise<MenuItem> {
    const item = await pbClient.collection('menu_items').getOne(id);
    return toMenuItem(item as any);
  }

  async getActivePromos(restaurantId?: string): Promise<PromoItem[]> {
    const filters = ['category = "promo"', 'active = true'];
    if (restaurantId) filters.push(`restaurant_id = "${restaurantId}"`);
    const items = await pbClient.collection('menu_items').getFullList({
      filter: filters.join(' && '),
      sort: 'name',
    });
    return items.map((item) => toPromoItem(item as any));
  }
}
