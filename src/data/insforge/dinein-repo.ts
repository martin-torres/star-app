import { insforge } from './client';
import { toDiningSession, toBillRequest } from './mappers';

import type { DiningSession, BillRequest } from '../../core/types';

export class InsForgeDineInRepository {
  // ── Dining Sessions ────────────────────────────────────────────

  async getActiveSessionByTable(restaurantId: string, tableId: string): Promise<DiningSession | null> {
    const { data, error } = await insforge.database
      .from('dining_sessions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('table_id', tableId)
      .in('status', '("active","ordering","bill_requested")')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? toDiningSession(data as any) : null;
  }

  async createSession(session: Omit<DiningSession, 'id'>): Promise<DiningSession> {
    const { data, error } = await insforge.database
      .from('dining_sessions')
      .insert([{
        restaurant_id: session.restaurant_id,
        table_id: session.table_id,
        customer_name: session.customer_name,
        customer_phone: session.customer_phone,
        status: session.status,
        order_ids: session.order_ids,
        session_start: session.session_start,
      }])
      .select()
      .single();
    if (error) throw error;
    return toDiningSession(data as any);
  }

  async updateSession(id: string, data: Partial<DiningSession>): Promise<DiningSession> {
    const dbPayload: Record<string, unknown> = {};
    if (data.status !== undefined) dbPayload.status = data.status;
    if (data.order_ids !== undefined) dbPayload.order_ids = data.order_ids;
    if (data.session_end !== undefined) dbPayload.session_end = data.session_end;

    const { data: record, error } = await insforge.database
      .from('dining_sessions')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toDiningSession(record as any);
  }

  // ── Bill Requests ──────────────────────────────────────────────

  async createBillRequest(bill: Omit<BillRequest, 'id'>): Promise<BillRequest> {
    const { data, error } = await insforge.database
      .from('bill_requests')
      .insert([{
        restaurant_id: bill.restaurant_id,
        table_id: bill.table_id,
        order_ids: bill.order_ids,
        subtotal: bill.subtotal,
        tax: bill.tax,
        tip: bill.tip,
        total: bill.total,
        status: bill.status,
        payments: bill.payments,
        requested_at: bill.requested_at,
      }])
      .select()
      .single();
    if (error) throw error;
    return toBillRequest(data as any);
  }

  async getBillRequestsByTable(restaurantId: string, tableId: string): Promise<BillRequest[]> {
    const { data, error } = await insforge.database
      .from('bill_requests')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('table_id', tableId)
      .order('requested_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => toBillRequest(r as any));
  }

  async updateBillRequest(id: string, data: Partial<BillRequest>): Promise<BillRequest> {
    const dbPayload: Record<string, unknown> = {};
    if (data.status !== undefined) dbPayload.status = data.status;
    if (data.payments !== undefined) dbPayload.payments = data.payments;

    const { data: record, error } = await insforge.database
      .from('bill_requests')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toBillRequest(record as any);
  }
}
