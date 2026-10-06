import type { OrderStatus } from './types';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pendiente_pago: ['recibido'],
  recibido: ['preparando', 'entregado'],
  preparando: ['empaquetando', 'entregado'],
  empaquetando: ['listo', 'entregado'],
  listo: ['en_camino', 'entregado'],
  en_camino: ['entregado'],
  entregado: [],
  paid: [],
  cancelled: [],
};

export const canTransitionOrderStatus = (
  current: OrderStatus,
  next: OrderStatus
): boolean => TRANSITIONS[current].includes(next);
