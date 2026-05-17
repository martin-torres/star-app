import type { VisitorRecord } from '../types';
import { insforge } from '../src/data/insforge/client';

export const visitorApi = {
  async upsertVisitor(visitorData: Partial<VisitorRecord>): Promise<VisitorRecord> {
    const { data: existingRecords } = await insforge.database
      .from('visitors')
      .select('*')
      .eq('sessionId', visitorData.sessionId)
      .limit(1);

    if (existingRecords && existingRecords.length > 0) {
      const record = existingRecords[0];
      const { data, error } = await insforge.database
        .from('visitors')
        .update({
          ...visitorData,
          last_visit: new Date().toISOString(),
          visit_count: (record.visit_count || 0) + 1
        })
        .eq('id', record.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await insforge.database
        .from('visitors')
        .insert([{
          first_visit: new Date().toISOString(),
          last_visit: new Date().toISOString(),
          visit_count: 1,
          ...visitorData
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async associateVisitorWithOrder(visitorId: string, orderId: string): Promise<void> {
    try {
      const { data: visitor, error } = await insforge.database
        .from('visitors')
        .select('*')
        .eq('id', visitorId)
        .single();
      if (error || !visitor) throw error || new Error('Visitor not found');
      const currentOrders = (visitor.associated_orders as string[]) || [];
      if (!currentOrders.includes(orderId)) {
        await insforge.database
          .from('visitors')
          .update({ associated_orders: [...currentOrders, orderId] })
          .eq('id', visitorId);
      }
    } catch (error) {
      console.error('Error associating visitor with order:', error);
      throw error;
    }
  },

  async getVisitorBySessionId(sessionId: string): Promise<VisitorRecord | null> {
    try {
      const { data, error } = await insforge.database
        .from('visitors')
        .select('*')
        .eq('sessionId', sessionId)
        .limit(1);
      if (error) throw error;
      return (data && data.length > 0) ? data[0] : null;
    } catch (error) {
      console.error('Error fetching visitor by session ID:', error);
      return null;
    }
  }
};