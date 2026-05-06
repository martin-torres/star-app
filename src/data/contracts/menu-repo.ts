import type { MenuCategory, MenuItem, PromoItem } from '../../core/types';

export interface MenuRepository {
  getAll(restaurantId?: string): Promise<MenuItem[]>;
  getByCategory(category: MenuCategory, restaurantId?: string): Promise<MenuItem[]>;
  getById(id: string): Promise<MenuItem>;
  getActivePromos(restaurantId?: string): Promise<PromoItem[]>;
}
