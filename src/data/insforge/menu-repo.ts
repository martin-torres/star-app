import type { MenuRepository } from '../contracts';
import type { MenuCategory, MenuItem, PromoItem } from '../../core/types';
import { insforge } from './client';
import { toMenuItem, toPromoItem, menuItemToDb } from './mappers';

export class InsForgeMenuRepository implements MenuRepository {
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

  async update(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    const { data: record, error } = await insforge.database
      .from('menu_items')
      .update(menuItemToDb(data))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toMenuItem(record as any);
  }

  async create(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const payload = {
      restaurant_id: item.restaurant_id || null,
      ...menuItemToDb(item),
    };
    const { data, error } = await insforge.database
      .from('menu_items')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return toMenuItem(data as any);
  }

  async remove(id: string): Promise<void> {
    const { error } = await insforge.database.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  }
}
