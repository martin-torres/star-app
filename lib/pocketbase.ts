/**
 * Data adapter - bridges App.tsx to the PocketBase repository layer.
 *
 * The export surface is unchanged from the pre-006 InsForge adapter
 * (`menuItemsApi`, `promosApi`, `ordersApi`, `settingsApi`, `subscribeToOrders`,
 * `tablesApi`, `restaurantsApi`, `uploadFile`, `authApi`) so App.tsx needs no
 * call-site changes. Behaviour now comes from PocketBase
 * (`src/data/pocketbase/**`); `floorPlanApi` is the one addition.
 */
import type { MenuItem, Order, OrderStatus, RestaurantTable } from '../types';
import type { AppSkinSettings } from '../src/core/types';
import type { FloorPlan } from '../src/features/floorplan/model/floorPlan';
import { COLLECTIONS } from '../src/data/pocketbase/collections';
import { pb } from '../src/data/pocketbase/client';
import {
  authRepository,
  menuRepository,
  ordersRepository,
  restaurantsRepository,
  settingsRepository,
  tablesRepository,
} from '../src/data/pocketbase';
import { floorPlanApi as floorPlanRepository } from '../src/data/pocketbase/floor-plan-repo';

// ── Promos ───────────────────────────────────────────────────────────────────

export const promosApi = {
  getActive: async (restaurantId?: string) => {
    try {
      return await menuRepository.getActivePromos(restaurantId);
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
    menuRepository.getByCategory(category as MenuItem['category'], restaurantId),
  getPromotions: async (restaurantId?: string): Promise<MenuItem[]> =>
    menuRepository.getActivePromos(restaurantId),
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
  save: async (
    settings: Partial<AppSkinSettings>,
    restaurantId?: string,
  ): Promise<AppSkinSettings> => settingsRepository.save(settings, restaurantId),
};

// ── Tables ───────────────────────────────────────────────────────────────────

export const tablesApi = {
  getAll: async (restaurantId: string): Promise<RestaurantTable[]> =>
    tablesRepository.getAll(restaurantId),
  getAvailable: async (restaurantId: string): Promise<RestaurantTable[]> =>
    tablesRepository.getAvailable(restaurantId),
  getById: async (id: string): Promise<RestaurantTable> => tablesRepository.getById(id),
  create: async (table: Omit<RestaurantTable, 'id'>): Promise<RestaurantTable> =>
    tablesRepository.create(table),
  update: async (id: string, data: Partial<RestaurantTable>): Promise<RestaurantTable> =>
    tablesRepository.update(id, data),
  delete: async (id: string): Promise<void> => tablesRepository.delete(id),
};

// ── Restaurants (direct queries) ─────────────────────────────────────────────

export const restaurantsApi = {
  getById: async (id: string) => restaurantsRepository.getById(id),
  getBySlug: async (slug: string) => restaurantsRepository.getBySlug(slug),
  getAll: async () => restaurantsRepository.getAll(),
};

// ── Floor plan (spec 006 deliverable B) ──────────────────────────────────────
//
// Consumed by `src/features/**`: the manager editor persists through savePlan and
// the customer selector reads through getPlan, so both render the same formation.
// `getPlan` returns null only for an empty restaurant id; a restaurant with no
// saved plan yet gets a default canvas and its `restaurant_tables` rows.

export const floorPlanApi = {
  getPlan: async (restaurantId: string): Promise<FloorPlan | null> => {
    if (!restaurantId) return null;
    return floorPlanRepository.getPlan(restaurantId);
  },
  savePlan: async (restaurantId: string, plan: FloorPlan): Promise<void> => {
    await floorPlanRepository.savePlan(restaurantId, plan);
  },
};

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => authRepository.login(email, password),
  logout: () => {
    authRepository.logout();
  },
  getCurrentUser: async () => authRepository.getCurrentUser(),
  isAuthenticated: () => authRepository.isAuthenticated(),
};

// ── File Upload ──────────────────────────────────────────────────────────────

export const uploadFile = async (file: File): Promise<string> => {
  const record = await pb
    .collection(COLLECTIONS.images)
    .create<{ id: string; file?: string }>({ file });
  const filename = typeof record.file === 'string' ? record.file : '';
  if (!filename) {
    throw new Error('Image upload succeeded but the server returned no filename');
  }
  return pb.files.getURL(record, filename);
};

export default pb;
