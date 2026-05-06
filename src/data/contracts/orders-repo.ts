import type { Order, OrderStatus } from '../../core/types';

export interface OrdersRepository {
  create(order: Omit<Order, 'id'> & { id?: string }): Promise<Order>;
  getById(id: string): Promise<Order>;
  getAll(restaurantId?: string, status?: OrderStatus): Promise<Order[]>;
  getActive(restaurantId?: string): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
  remove(orderId: string): Promise<void>;
}

export type OrdersSubscription = (order: Order) => void;

export interface OrdersRealtimeRepository {
  subscribeToOrders(callback: OrdersSubscription): Promise<() => void>;
}
