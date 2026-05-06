import PocketBase from 'pocketbase';

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090');

pb.autoCancellation(false);

let currentRestaurantId: string | null = null;
let isAuth = false;

export const setAdminRestaurantId = (id: string | null) => {
  currentRestaurantId = id;
};

export const adminAuth = async (email: string, password: string): Promise<boolean> => {
  try {
    await pb.collection('_superusers').authWithPassword(email, password);
    isAuth = true;
    return true;
  } catch (error) {
    console.error('Admin auth failed:', error);
    return false;
  }
};

export const isAdminAuth = (): boolean => isAuth && pb.authStore.isValid;

const restaurantFilter = () => currentRestaurantId ? `restaurant_id = "${currentRestaurantId}"` : '';
const restaurantField = (data: any) => currentRestaurantId ? { ...data, restaurant_id: currentRestaurantId } : data;

export const menuApi = {
  getAll: async () => {
    const filter = restaurantFilter();
    const records = await pb.collection('menu_items').getFullList({
      filter: filter || undefined,
    });
    return records;
  },

  create: async (data: any) => {
    const record = await pb.collection('menu_items').create(restaurantField(data));
    return record;
  },

  update: async (id: string, data: any) => {
    const record = await pb.collection('menu_items').update(id, data);
    return record;
  },

  delete: async (id: string) => {
    await pb.collection('menu_items').delete(id);
  },
};

export const ordersApi = {
  getAll: async () => {
    const filter = restaurantFilter();
    const records = await pb.collection('orders').getFullList({
      filter: filter || undefined,
    });
    return records;
  },

  updateStatus: async (id: string, status: string) => {
    const record = await pb.collection('orders').update(id, { status });
    return record;
  },
};

export const settingsApi = {
  get: async () => {
    const filter = restaurantFilter();
    const records = await pb.collection('restaurant_settings').getFullList({
      filter: filter || undefined,
    });
    return records[0] || null;
  },

  update: async (id: string, data: any) => {
    const record = await pb.collection('restaurant_settings').update(id, data);
    return record;
  },
};

export const promosApi = {
  getAll: async () => {
    const filter = restaurantFilter();
    const records = await pb.collection('promos').getFullList({
      filter: filter || undefined,
    });
    return records;
  },

  create: async (data: any) => {
    const record = await pb.collection('promos').create(restaurantField(data));
    return record;
  },

  update: async (id: string, data: any) => {
    const record = await pb.collection('promos').update(id, data);
    return record;
  },

  delete: async (id: string) => {
    await pb.collection('promos').delete(id);
  },
};

export const tablesApi = {
  getAll: async () => {
    const filter = restaurantFilter();
    const records = await pb.collection('tables').getFullList({
      filter: filter || undefined,
      sort: 'table_number',
    });
    return records;
  },

  create: async (data: any) => {
    const record = await pb.collection('tables').create(restaurantField(data));
    return record;
  },

  update: async (id: string, data: any) => {
    const record = await pb.collection('tables').update(id, data);
    return record;
  },

  delete: async (id: string) => {
    await pb.collection('tables').delete(id);
  },
};

export default pb;
