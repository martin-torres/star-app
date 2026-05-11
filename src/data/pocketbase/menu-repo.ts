import type { MenuRepository } from '../contracts';
import type { MenuCategory, MenuItem, PromoItem } from '../../core/types';
import { insforge } from './client';
import { toMenuItem, toPromoItem } from './mappers';

export class PocketBaseMenuRepository implements MenuRepository {
  async getAll(restaurantId?: string): Promise<MenuItem[]> {
    let query = insforge.database.from('menu_items').select('*').order('category').order('name');
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => toMenuItem(item));
  }

  async getByCategory(category: MenuCategory, restaurantId?: string): Promise<MenuItem[]> {
    let query = insforge.database.from('menu_items').select('*').eq('category', category).order('name');
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => toMenuItem(item));
  }

  async getById(id: string): Promise<MenuItem> {
    const { data, error } = await insforge.database.from('menu_items').select('*').eq('id', id).single();
    if (error) throw error;
    return toMenuItem(data as any);
  }

  async getActivePromos(restaurantId?: string): Promise<PromoItem[]> {
    let query = insforge.database.from('promos').select('*').eq('active', true).order('name');
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => toPromoItem(item));
  }
}
