/**
 * Dine-in repository: dining sessions and bill requests.
 */
import type { BillRequest, DiningSession } from '../../core/types';
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { and, eq, oneOf } from './query';
import { firstOrNull } from './read';
import {
  billRequestToDb,
  diningSessionToDb,
  toBillRequest,
  toDiningSession,
  type RawRecord,
} from './mappers';

const ACTIVE_SESSION_STATUSES = ['active', 'ordering', 'bill_requested'] as const;

export class PocketBaseDineInRepository {
  // ── Dining sessions ────────────────────────────────────────────────────────

  async getActiveSessionByTable(
    restaurantId: string,
    tableId: string,
  ): Promise<DiningSession | null> {
    const record = await firstOrNull<RawRecord>(
      COLLECTIONS.diningSessions,
      and(
        eq('restaurant_id', restaurantId),
        eq('table_id', tableId),
        oneOf('status', ACTIVE_SESSION_STATUSES),
      ),
    );
    return record ? toDiningSession(record) : null;
  }

  async createSession(session: Omit<DiningSession, 'id'>): Promise<DiningSession> {
    const record = await pb
      .collection(COLLECTIONS.diningSessions)
      .create<RawRecord>(diningSessionToDb(session));
    return toDiningSession(record);
  }

  async updateSession(id: string, data: Partial<DiningSession>): Promise<DiningSession> {
    const record = await pb
      .collection(COLLECTIONS.diningSessions)
      .update<RawRecord>(id, diningSessionToDb(data));
    return toDiningSession(record);
  }

  // ── Bill requests ─────────────────────────────────────────────────────────

  async createBillRequest(bill: Omit<BillRequest, 'id'>): Promise<BillRequest> {
    const record = await pb
      .collection(COLLECTIONS.billRequests)
      .create<RawRecord>(billRequestToDb(bill));
    return toBillRequest(record);
  }

  async getBillRequestsByTable(restaurantId: string, tableId: string): Promise<BillRequest[]> {
    const records = await pb
      .collection(COLLECTIONS.billRequests)
      .getFullList<RawRecord>({
        filter: and(eq('restaurant_id', restaurantId), eq('table_id', tableId)),
        sort: '-requested_at',
      });
    return records.map(toBillRequest);
  }

  async updateBillRequest(id: string, data: Partial<BillRequest>): Promise<BillRequest> {
    const record = await pb
      .collection(COLLECTIONS.billRequests)
      .update<RawRecord>(id, billRequestToDb(data));
    return toBillRequest(record);
  }
}
