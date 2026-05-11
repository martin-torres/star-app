import { insforge } from '../../data/pocketbase/client';

let currentRestaurantId: string | null = null;

export const setAdminRestaurantId = (id: string | null) => {
  currentRestaurantId = id;
};

export const adminAuth = async (email: string, password: string): Promise<boolean> => {
  try {
    const { error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Admin auth failed:', error);
    return false;
  }
};

export const isAdminAuth = async (): Promise<boolean> => {
  const { data } = await insforge.auth.getCurrentUser();
  return !!data?.user;
};

const restaurantEq = () => currentRestaurantId ? (q: any) => q.eq('restaurant_id', currentRestaurantId) : (q: any) => q;
const withRestaurant = (query: any) => {
  if (currentRestaurantId) return query.eq('restaurant_id', currentRestaurantId);
  return query;
};

export const menuApi = {
  getAll: async () => {
    let query = insforge.database.from('menu_items').select('*');
    query = withRestaurant(query);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (data: any) => {
    const payload = currentRestaurantId ? { ...data, restaurant_id: currentRestaurantId } : data;
    const { data: record, error } = await insforge.database
      .from('menu_items')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return record;
  },

  update: async (id: string, data: any) => {
    const { data: record, error } = await insforge.database
      .from('menu_items')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return record;
  },

  delete: async (id: string) => {
    const { error } = await insforge.database.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  },
};

export const ordersApi = {
  getAll: async () => {
    let query = insforge.database.from('orders').select('*').order('timestamp', { ascending: false });
    query = withRestaurant(query);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  updateStatus: async (id: string, status: string) => {
    const { data: record, error } = await insforge.database
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return record;
  },
};

export const settingsApi = {
  get: async () => {
    let query = insforge.database.from('restaurant_settings').select('*');
    query = withRestaurant(query);
    const { data, error } = await query;
    if (error) throw error;
    return (data && data.length > 0) ? data[0] : null;
  },

  update: async (id: string, data: any) => {
    const { data: record, error } = await insforge.database
      .from('restaurant_settings')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return record;
  },
};

export const promosApi = {
  getAll: async () => {
    let query = insforge.database.from('promos').select('*');
    query = withRestaurant(query);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (data: any) => {
    const payload = currentRestaurantId ? { ...data, restaurant_id: currentRestaurantId } : data;
    const { data: record, error } = await insforge.database
      .from('promos')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return record;
  },

  update: async (id: string, data: any) => {
    const { data: record, error } = await insforge.database
      .from('promos')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return record;
  },

  delete: async (id: string) => {
    const { error } = await insforge.database.from('promos').delete().eq('id', id);
    if (error) throw error;
  },
};

export const tablesApi = {
  getAll: async () => {
    let query = insforge.database.from('tables').select('*').order('table_number', { ascending: true });
    query = withRestaurant(query);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (data: any) => {
    const payload = currentRestaurantId ? { ...data, restaurant_id: currentRestaurantId } : data;
    const { data: record, error } = await insforge.database
      .from('tables')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return record;
  },

  update: async (id: string, data: any) => {
    const { data: record, error } = await insforge.database
      .from('tables')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return record;
  },

  delete: async (id: string) => {
    const { error } = await insforge.database.from('tables').delete().eq('id', id);
    if (error) throw error;
  },
};
