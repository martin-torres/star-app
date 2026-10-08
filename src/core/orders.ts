import type { OrderStatus } from './types';

/** Kitchen + payment transitions used by the live UI (skips unused empaquetando). */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente_pago: ['recibido', 'cancelled'],
  recibido: ['preparando', 'entregado', 'paid', 'cancelled'],
  preparando: ['listo', 'empaquetando', 'entregado', 'paid'],
  empaquetando: ['listo', 'entregado'],
  listo: ['en_camino', 'entregado', 'paid'],
  en_camino: ['entregado'],
  entregado: [],
  paid: [],
  cancelled: [],
};

export const canTransitionOrderStatus = (
  current: OrderStatus,
  next: OrderStatus
): boolean => (TRANSITIONS[current] || []).includes(next);
