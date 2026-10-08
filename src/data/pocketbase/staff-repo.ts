/**
 * Staff + shifts repository.
 *
 * `staff` and `staff_shifts` are manager-only collections (all API rules are
 * superuser/authenticated) - anonymous calls are expected to fail with 403.
 */
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { eq } from './query';
import { compact } from './mappers';

export interface StaffRecord {
  id: string;
  restaurant_id: string;
  name: string;
  role: 'manager' | 'server' | 'foh' | 'kitchen' | 'bar' | 'owner';
  pin: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffShiftRecord {
  id: string;
  staff_id: string;
  restaurant_id: string;
  clock_in?: string;
  clock_out?: string;
  tables_served?: number;
  total_tips?: number;
  total_sales?: number;
  created_at?: string;
}

export interface StaffInput {
  restaurant_id: string;
  name: string;
  role: StaffRecord['role'];
  pin: string;
  is_active?: boolean;
}

export class PocketBaseStaffRepository {
  // ── Staff ─────────────────────────────────────────────────────────────────

  async list(restaurantId: string): Promise<StaffRecord[]> {
    return pb.collection(COLLECTIONS.staff).getFullList<StaffRecord>({
      filter: eq('restaurant_id', restaurantId),
      sort: 'name',
    });
  }

  async getById(id: string): Promise<StaffRecord> {
    return pb.collection(COLLECTIONS.staff).getOne<StaffRecord>(id);
  }

  async create(input: StaffInput): Promise<StaffRecord> {
    return pb.collection(COLLECTIONS.staff).create<StaffRecord>(compact({ ...input }));
  }

  async update(id: string, patch: Partial<StaffRecord>): Promise<StaffRecord> {
    return pb.collection(COLLECTIONS.staff).update<StaffRecord>(id, compact({ ...patch }));
  }

  async remove(id: string): Promise<void> {
    await pb.collection(COLLECTIONS.staff).delete(id);
  }

  // ── Shifts ────────────────────────────────────────────────────────────────

  async listShifts(staffId: string): Promise<StaffShiftRecord[]> {
    return pb.collection(COLLECTIONS.staffShifts).getFullList<StaffShiftRecord>({
      filter: eq('staff_id', staffId),
      sort: '-clock_in',
    });
  }

  async createShift(shift: {
    staff_id: string;
    restaurant_id: string;
    clock_in?: string;
  }): Promise<StaffShiftRecord> {
    return pb.collection(COLLECTIONS.staffShifts).create<StaffShiftRecord>(compact({ ...shift }));
  }

  async updateShift(id: string, patch: Partial<StaffShiftRecord>): Promise<StaffShiftRecord> {
    return pb
      .collection(COLLECTIONS.staffShifts)
      .update<StaffShiftRecord>(id, compact({ ...patch }));
  }
}
