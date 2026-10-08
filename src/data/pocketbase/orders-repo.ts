import type { OrdersRealtimeRepository, OrdersRepository } from '../contracts';
import type { Order, OrderStatus, OrderItem } from '../../core/types';
import type { RecordSubscription } from 'pocketbase';
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { and, eq, neq } from './query';
import { orderToDb, toOrder, type RawRecord } from './mappers';

/** Statuses that mean "no longer on the board". */
const CLOSED_STATUSES: OrderStatus[] = ['entregado', 'paid', 'cancelled'];

export class PocketBaseOrdersRepository implements OrdersRepository, OrdersRealtimeRepository {
  /**
   * Create an order. Status/total/timestamp are computed by the PocketBase hook
   * (`db/pocketbase/pb_hooks/star_security.pb.js`), so `orderToDb` deliberately
   * omits them - a forged `status: "paid"` or `total: 0` never leaves the client.
   */
  async create(orderData: Omit<Order, 'id'> & { id?: string }): Promise<Order> {
    const record = await pb
      .collection(COLLECTIONS.orders)
      .create<RawRecord>(orderToDb(orderData));

    await this._deductStock(orderData.items);

    return toOrder(record);
  }

  /**
   * Best-effort client-side stock deduction. `menu_items` is not writable by
   * anonymous customers (updateRule is null) and inventory is really the
   * server's job, so a failure here is logged, never thrown.
   */
  private async _deductStock(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      if (!item.id) continue;
      try {
        const record = await pb
          .collection(COLLECTIONS.menuItems)
          .getOne<RawRecord>(item.id);
        const currentStock = record.stock;
        const trackInventory = record.track_inventory === true;

        if (
          !trackInventory ||
          typeof currentStock !== 'number' ||
          currentStock === -1 ||
          currentStock <= 0
        ) {
          continue;
        }

        const newStock = Math.max(0, currentStock - item.quantity);
        await pb.collection(COLLECTIONS.menuItems).update(item.id, { stock: newStock });
      } catch (err) {
        console.warn(`[Inventory] Failed to deduct stock for item ${item.id}:`, err);
      }
    }
  }

  async getById(id: string): Promise<Order> {
    const record = await pb.collection(COLLECTIONS.orders).getOne<RawRecord>(id);
    return toOrder(record);
  }

  async getAll(restaurantId?: string, status?: OrderStatus): Promise<Order[]> {
    const records = await pb.collection(COLLECTIONS.orders).getFullList<RawRecord>({
      filter: and(
        status ? eq('status', status) : '',
        restaurantId ? eq('restaurant_id', restaurantId) : '',
      ),
      sort: '-timestamp',
    });
    return records.map(toOrder);
  }

  async getActive(restaurantId?: string): Promise<Order[]> {
    const records = await pb.collection(COLLECTIONS.orders).getFullList<RawRecord>({
      filter: and(
        ...CLOSED_STATUSES.map((status) => neq('status', status)),
        restaurantId ? eq('restaurant_id', restaurantId) : '',
      ),
      sort: '-timestamp',
    });
    return records.map(toOrder);
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const current = await pb.collection(COLLECTIONS.orders).getOne<RawRecord>(orderId);
    const previousTimestamps =
      typeof current.status_timestamps === 'object' && current.status_timestamps !== null
        ? (current.status_timestamps as Order['statusTimestamps'])
        : {};

    const record = await pb.collection(COLLECTIONS.orders).update<RawRecord>(orderId, {
      status,
      status_timestamps: { ...previousTimestamps, [status]: Date.now() },
    });
    return toOrder(record);
  }

  async remove(orderId: string): Promise<void> {
    await pb.collection(COLLECTIONS.orders).delete(orderId);
  }

  /**
   * Realtime order feed.
   *
   * The pre-006 implementation called `.subscribe()` on the Promise returned by
   * `realtime.connect()` - a real bug that never delivered an event. PocketBase
   * exposes realtime per collection: `pb.collection('orders').subscribe(...)`
   * resolves to the unsubscribe function.
   *
   * NOTE: this requires the caller to be allowed to read `orders`. Anonymous
   * customers cannot (by design - see schema.py `orders.listRule = null`), so
   * the customer tracking screen needs the `/api/star/order-status` route
   * (deliverable A2). A failed subscribe degrades to a no-op and logs loudly.
   */
  async subscribeToOrders(callback: (order: Order) => void): Promise<() => void> {
    try {
      const unsubscribe = await pb
        .collection(COLLECTIONS.orders)
        .subscribe('*', (event: RecordSubscription<RawRecord>) => {
          if (event.action === 'create' || event.action === 'update') {
            callback(toOrder(event.record));
          }
        });

      return () => {
        void unsubscribe();
      };
    } catch (error) {
      console.warn(
        '[orders] Realtime subscription failed (anonymous reads are disabled for `orders`; ' +
          'use the /api/star/order-status route for customer tracking):',
        error,
      );
      return () => {};
    }
  }
}
