import type { OrdersRealtimeRepository, OrdersRepository } from '../contracts';
import type { Order, OrderStatus, OrderItem } from '../../core/types';
import { pbClient } from './client';
import { toOrder } from './mappers';

export class PocketBaseOrdersRepository
  implements OrdersRepository, OrdersRealtimeRepository
{
  async create(orderData: Omit<Order, 'id'> & { id?: string }): Promise<Order> {
    const id = orderData.id || Math.random().toString(36).slice(2, 8).toUpperCase();
    const order = await pbClient.collection('orders').create({
      ...orderData,
      id,
      timestamp: Date.now(),
      statusTimestamps: {
        recibido: Date.now(),
      },
    });

    // Auto-deduct stock for inventory-tracked items
    await this._deductStock(orderData.items);

    return toOrder(order as any);
  }

  /** Deduct stock for each item in the order that has inventory tracking enabled. */
  private async _deductStock(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      if (!item.id) continue;
      try {
        const record = await pbClient.collection('menu_items').getOne(item.id);
        const currentStock = record.stock;
        const trackInventory = record.track_inventory;

        // Skip if not tracking inventory or stock is unlimited (-1/undefined)
        if (!trackInventory || currentStock === undefined || currentStock === -1 || currentStock === null) continue;

        const newStock = Math.max(0, currentStock - item.quantity);
        await pbClient.collection('menu_items').update(item.id, { stock: newStock });
      } catch (err) {
        console.warn(`[Inventory] Failed to deduct stock for item ${item.id}:`, err);
      }
    }
  }

  async getById(id: string): Promise<Order> {
    const order = await pbClient.collection('orders').getOne(id);
    return toOrder(order as any);
  }

  async getAll(restaurantId?: string, status?: OrderStatus): Promise<Order[]> {
    const filters: string[] = [];
    if (status) filters.push(`status = "${status}"`);
    if (restaurantId) filters.push(`restaurant_id = "${restaurantId}"`);
    const orders = await pbClient.collection('orders').getFullList({
      filter: filters.length > 0 ? filters.join(' && ') : undefined,
      sort: '-timestamp',
    });
    return orders.map((order) => toOrder(order as any));
  }

  async getActive(restaurantId?: string): Promise<Order[]> {
    const filters: string[] = ["status != 'entregado' && status != 'paid' && status != 'cancelled'"];
    if (restaurantId) filters.push(`restaurant_id = "${restaurantId}"`);
    const orders = await pbClient.collection('orders').getFullList({
      filter: filters.join(' && '),
      sort: '-timestamp',
    });
    return orders.map((order) => toOrder(order as any));
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const currentOrder = await pbClient.collection('orders').getOne(orderId);
    const statusTimestamps = {
      ...(currentOrder.statusTimestamps || {}),
      [status]: Date.now(),
    };

    const order = await pbClient.collection('orders').update(orderId, {
      status,
      statusTimestamps,
    });
    return toOrder(order as any);
  }

  async remove(orderId: string): Promise<void> {
    await pbClient.collection('orders').delete(orderId);
  }

  async subscribeToOrders(callback: (order: Order) => void): Promise<() => void> {
    return pbClient.collection('orders').subscribe('*', (event) => {
      callback(toOrder(event.record as any));
    });
  }
}
