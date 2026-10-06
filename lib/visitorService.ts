import type { VisitorRecord } from '../types';
import { visitorRepository } from '../src/data/pocketbase';

/**
 * Visitor API.
 *
 * `visitors` is create-only for anonymous clients; the server owns the counters
 * and order association (route `POST /api/star/visitor-touch`). The previous
 * implementation read-then-PATCHed the row, which the new rules reject - that is
 * the "visitors upsert" bug the database review flagged.
 */
export const visitorApi = {
  async upsertVisitor(visitorData: Partial<VisitorRecord>): Promise<VisitorRecord> {
    if (visitorData.id) {
      // Returning visitor: ask the server to bump last_visit/visit_count.
      const sessionId = visitorData.sessionId ?? '';
      await visitorRepository.touch(sessionId);

      const refreshed = await visitorRepository.getBySessionId(sessionId);
      if (refreshed) return refreshed;

      // Anonymous reads of `visitors` are denied, so return what the server
      // route implies happened rather than a stale row.
      const now = new Date().toISOString();
      return {
        id: visitorData.id,
        restaurant_id: visitorData.restaurant_id,
        ip: visitorData.ip ?? 'unknown',
        userAgent: visitorData.userAgent,
        deviceType: visitorData.deviceType,
        isPwaInstalled: visitorData.isPwaInstalled,
        sessionId,
        firstVisit: visitorData.firstVisit ?? now,
        lastVisit: now,
        visitCount: (visitorData.visitCount ?? 0) + 1,
        associatedOrders: visitorData.associatedOrders,
      };
    }

    // First visit: create the row (the hook sets first_visit/last_visit/count).
    return visitorRepository.createVisitor(visitorData);
  },

  async associateVisitorWithOrder(visitorId: string, orderId: string): Promise<void> {
    const visitor = await visitorRepository.getById(visitorId);
    if (!visitor) {
      console.warn(
        `[visitors] Cannot associate order ${orderId}: visitor ${visitorId} is not readable ` +
          'by an anonymous client (manager-only viewRule)',
      );
      return;
    }
    await visitorRepository.touch(visitor.sessionId, orderId);
  },

  async getVisitorBySessionId(sessionId: string): Promise<VisitorRecord | null> {
    return visitorRepository.getBySessionId(sessionId);
  },
};
