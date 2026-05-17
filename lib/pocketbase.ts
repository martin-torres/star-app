/**
 * Data adapter — bridges App.tsx to the InsForge repository layer.
 *
 * This file was originally `lib/pocketbase.ts`. It now imports from
 * `src/data/insforge/` which queries the 2y542jyv schema (restaurant-platform
 * 36-table layout) via @insforge/sdk.
 *
 * The adapter API surface stays the same so App.tsx needs no changes.
 */

import type { MenuItem, Order, OrderStatus, RestaurantTable } from '../types';
import type { AppSkinSettings } from '../src/core/types';
import {
  InsForgeMenuRepository,
  InsForgeOrdersRepository,
  InsForgeSettingsRepository,
  InsForgeTablesRepository,
  insforge,
} from '../src/data/insforge';

const menuRepository = new InsForgeMenuRepository();
const ordersRepository = new InsForgeOrdersRepository();
const settingsRepository = new InsForgeSettingsRepository();
const tablesRepository = new InsForgeTablesRepository();

// ── Promos ───────────────────────────────────────────────────────────────────

export const promosApi = {
  getActive: async (restaurantId?: string): Promise<any[]> => {
    try {
      const items = await menuRepository.getActivePromos(restaurantId);
      return items.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price: r.price || 0,
        category: 'promo',
        image: r.image || '',
        active: r.active,
      }));
    } catch (error) {
      console.error('Error fetching promos:', error);
      return [];
    }
  },
};

// ── Menu Items ───────────────────────────────────────────────────────────────

export const menuItemsApi = {
  getAll: async (restaurantId?: string): Promise<MenuItem[]> =>
    menuRepository.getAll(restaurantId),
  getByCategory: async (category: string, restaurantId?: string): Promise<MenuItem[]> =>
    menuRepository.getByCategory(category as any, restaurantId),
  getPromotions: async (restaurantId?: string): Promise<MenuItem[]> =>
    (await menuRepository.getActivePromos(restaurantId)) as any as MenuItem[],
  getById: async (id: string): Promise<MenuItem> => menuRepository.getById(id),
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  create: async (orderData: Omit<Order, 'id'> & { id?: string }): Promise<Order> =>
    ordersRepository.create(orderData),
  getAll: async (restaurantId?: string, status?: OrderStatus): Promise<Order[]> =>
    ordersRepository.getAll(restaurantId, status),
  getActive: async (restaurantId?: string): Promise<Order[]> =>
    ordersRepository.getActive(restaurantId),
  getById: async (id: string): Promise<Order> => ordersRepository.getById(id),
  updateStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> =>
    ordersRepository.updateStatus(orderId, newStatus),
  delete: async (orderId: string): Promise<boolean> => {
    await ordersRepository.remove(orderId);
    return true;
  },
};

export const subscribeToOrders = (callback: (order: Order) => void) =>
  ordersRepository.subscribeToOrders(callback);

// ── Settings ─────────────────────────────────────────────────────────────────

export const settingsApi = {
  get: async (restaurantId?: string): Promise<AppSkinSettings | null> =>
    settingsRepository.get(restaurantId),
  save: async (settings: Partial<AppSkinSettings>, restaurantId?: string): Promise<AppSkinSettings> =>
    settingsRepository.save(settings, restaurantId),
};

// ── Tables ───────────────────────────────────────────────────────────────────

export const tablesApi = {
  getAll: async (restaurantId: string): Promise<RestaurantTable[]> =>
    tablesRepository.getAll(restaurantId),
  getAvailable: async (restaurantId: string): Promise<RestaurantTable[]> =>
    tablesRepository.getAvailable(restaurantId),
  getById: async (id: string): Promise<RestaurantTable> =>
    tablesRepository.getById(id),
  create: async (table: Omit<RestaurantTable, 'id'>): Promise<RestaurantTable> =>
    tablesRepository.create(table),
  update: async (id: string, data: Partial<RestaurantTable>): Promise<RestaurantTable> =>
    tablesRepository.update(id, data),
  delete: async (id: string): Promise<void> =>
    tablesRepository.delete(id),
};

// ── Restaurants (direct queries) ──────────────────────────────────────────────

export const restaurantsApi = {
  getById: async (id: string) => {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },
  getBySlug: async (slug: string) => {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('slug', slug);
      if (error) throw error;
      return (data && data.length > 0) ? data[0] : null;
    } catch {
      return null;
    }
  },
  getAll: async () => {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('*');
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },
};

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) =>
    insforge.auth.signInWithPassword({ email, password }),
  logout: () => {
    insforge.auth.signOut();
  },
  getCurrentUser: async () => {
    const { data } = await insforge.auth.getCurrentUser();
    return data?.user || null;
  },
  isAuthenticated: () => {
    return !!insforge.getHttpClient().getHeaders()['Authorization'];
  },
};

// ── File Upload ──────────────────────────────────────────────────────────────

export const uploadFile = async (file: File): Promise<string> => {
  const path = `screenshots/${Date.now()}_${file.name}`;
  const { data, error } = await insforge.storage.from('images').upload(path, file);
  if (error) throw error;
  return insforge.storage.from('images').getPublicUrl(path);
};

export default insforge;
