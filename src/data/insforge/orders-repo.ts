import type { OrdersRealtimeRepository, OrdersRepository } from '../contracts';
import type { Order, OrderStatus, OrderItem } from '../../core/types';
import { insforge } from './client';
import { toOrder, orderToDb } from './mappers';

export class InsForgeOrdersRepository
  implements OrdersRepository, OrdersRealtimeRepository
{
  async create(orderData: Omit<Order, 'id'> & { id?: string }): Promise<Order> {
    const payload = orderToDb(orderData);
    const { data, error } = await insforge.database
      .from('orders')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;

    await this._deductStock(orderData.items);

    return toOrder(data as any);
  }

  private async _deductStock(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      if (!item.id) continue;
      try {
        const { data: record, error } = await insforge.database
          .from('menu_items')
          .select('stock, track_inventory')
          .eq('id', item.id)
          .single();
        if (error || !record) continue;

        const currentStock = record.stock;
        const trackInventory = record.track_inventory;

        if (!trackInventory || currentStock === undefined || currentStock === -1 || currentStock === null) continue;

        const newStock = Math.max(0, currentStock - item.quantity);
        await insforge.database
          .from('menu_items')
          .update({ stock: newStock })
          .eq('id', item.id);
      } catch (err) {
        console.warn(`[Inventory] Failed to deduct stock for item ${item.id}:`, err);
      }
    }
  }

  async getById(id: string): Promise<Order> {
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return toOrder(data as any);
  }

  async getAll(restaurantId?: string, status?: OrderStatus): Promise<Order[]> {
    let query = insforge.database.from('orders').select('*').order('timestamp', { ascending: false });
    if (status) query = query.eq('status', status);
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((order: any) => toOrder(order));
  }

  async getActive(restaurantId?: string): Promise<Order[]> {
    let query = insforge.database
      .from('orders')
      .select('*')
      .not('status', 'in', '("entregado","paid","cancelled")')
      .order('timestamp', { ascending: false });
    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((order: any) => toOrder(order));
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data: current } = await insforge.database
      .from('orders')
      .select('status_timestamps')
      .eq('id', orderId)
      .single();
    const statusTimestamps = {
      ...(current?.status_timestamps || {}),
      [status]: Date.now(),
    };
    const { data, error } = await insforge.database
      .from('orders')
      .update({ status, status_timestamps: statusTimestamps })
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return toOrder(data as any);
  }

  async remove(orderId: string): Promise<void> {
    const { error } = await insforge.database.from('orders').delete().eq('id', orderId);
    if (error) throw error;
  }

  async subscribeToOrders(callback: (order: Order) => void): Promise<() => void> {
    const channel = insforge.realtime.connect();
    const unsubscribe = channel.subscribe('orders', (payload: any) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        callback(toOrder(payload.new as any));
      }
    });
    return () => { unsubscribe(); channel.disconnect(); };
  }
}
