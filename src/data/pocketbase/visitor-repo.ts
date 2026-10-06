/**
 * Visitor repository.
 *
 * `visitors` is deliberately NOT directly writable by anonymous clients
 * (`schema.py`: createRule "" / updateRule null). Creating the first row works;
 * the "returning visitor" bump and order association go through the server route
 * `POST /api/star/visitor-touch` so a customer cannot edit another visitor's
 * counters (review `security-reviewer.md` T4/T6, plan A2).
 */
import type { VisitorRecord } from '../../core/types';
import { POCKETBASE_URL, pb } from './client';
import { COLLECTIONS } from './collections';
import { eq } from './query';
import { firstOrNull } from './read';
import { toVisitorRecord, visitorToDb, type RawRecord } from './mappers';

export class PocketBaseVisitorRepository {
  /** First visit: create the row. Counters are set by the server hook. */
  async createVisitor(data: Partial<VisitorRecord>): Promise<VisitorRecord> {
    const record = await pb
      .collection(COLLECTIONS.visitors)
      .create<RawRecord>(visitorToDb(data));
    return toVisitorRecord(record);
  }

  /**
   * Anonymous clients cannot read `visitors` (viewRule is manager-only), so a
   * 403 resolves to `null` rather than throwing - callers already treat a
   * missing visitor as "new visitor".
   */
  async getById(id: string): Promise<VisitorRecord | null> {
    if (!id) return null;
    try {
      const record = await pb.collection(COLLECTIONS.visitors).getOne<RawRecord>(id);
      return toVisitorRecord(record);
    } catch (error) {
      const status = (error as { status?: number } | null)?.status;
      if (status !== 403 && status !== 404) {
        console.warn('[visitors] Could not read visitor row:', error);
      }
      return null;
    }
  }

  async getBySessionId(sessionId: string): Promise<VisitorRecord | null> {
    if (!sessionId) return null;
    try {
      const record = await firstOrNull<RawRecord>(
        COLLECTIONS.visitors,
        eq('sessionId', sessionId),
      );
      return record ? toVisitorRecord(record) : null;
    } catch (error) {
      const status = (error as { status?: number } | null)?.status;
      if (status !== 403 && status !== 404) {
        console.warn('[visitors] Could not read visitor row:', error);
      }
      return null;
    }
  }

  /** Server-owned counter bump / order association. */
  async touch(sessionId: string, orderId?: string): Promise<boolean> {
    if (!sessionId) return false;
    try {
      const response = await fetch(`${POCKETBASE_URL}/api/star/visitor-touch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderId ? { sessionId, orderId } : { sessionId }),
      });
      if (!response.ok) {
        console.warn(`[visitors] visitor-touch responded ${response.status}`);
      }
      return response.ok;
    } catch (error) {
      console.warn('[visitors] visitor-touch request failed:', error);
      return false;
    }
  }
}
