import { insforge } from './client';

export interface StaffRecord {
  id: string;
  restaurant_id: string;
  name: string;
  role: 'manager' | 'server' | 'foh' | 'kitchen' | 'bar' | 'owner';
  pin: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffShiftRecord {
  id: string;
  staff_id: string;
  restaurant_id: string;
  clock_in: string;
  clock_out?: string;
  tables_served: number;
  total_tips: number;
  total_sales: number;
  notes?: string;
  created_at: string;
}

export interface StaffInput {
  restaurant_id: string;
  name: string;
  role: StaffRecord['role'];
  pin: string;
  is_active?: boolean;
}

export class InsForgeStaffRepository {
  // ── Staff ────────────────────────────────────────────────────────────────────

  async list(restaurantId: string): Promise<StaffRecord[]> {
    const { data, error } = await insforge.database
      .from('staff')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name');
    if (error) throw error;
    return (data || []) as any;
  }

  async getById(id: string): Promise<StaffRecord> {
    const { data, error } = await insforge.database
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as any;
  }

  async create(input: StaffInput): Promise<StaffRecord> {
    const { data, error } = await insforge.database
      .from('staff')
      .insert([input])
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async update(id: string, patch: Partial<StaffRecord>): Promise<StaffRecord> {
    const { data, error } = await insforge.database
      .from('staff')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async remove(id: string): Promise<void> {
    const { error } = await insforge.database.from('staff').delete().eq('id', id);
    if (error) throw error;
  }

  // ── Shifts ───────────────────────────────────────────────────────────────────

  async listShifts(staffId: string): Promise<StaffShiftRecord[]> {
    const { data, error } = await insforge.database
      .from('staff_shifts')
      .select('*')
      .eq('staff_id', staffId)
      .order('clock_in', { ascending: false });
    if (error) throw error;
    return (data || []) as any;
  }

  async createShift(shift: {
    staff_id: string;
    restaurant_id: string;
    clock_in?: string;
  }): Promise<StaffShiftRecord> {
    const { data, error } = await insforge.database
      .from('staff_shifts')
      .insert([shift])
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async updateShift(id: string, patch: Partial<StaffShiftRecord>): Promise<StaffShiftRecord> {
    const { data, error } = await insforge.database
      .from('staff_shifts')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }
}
