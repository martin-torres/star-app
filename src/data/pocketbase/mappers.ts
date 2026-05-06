import type { MenuItem, Order, OrderStatus, PromoItem } from '../../core/types';

type RawRecord = Record<string, unknown> & { id: string };

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
};

const asJson = <T>(value: unknown, fallback: T): T => {
  if (value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (typeof value === 'object' && value !== null) return value as T;
  return fallback;
};

export const toMenuItem = (record: RawRecord): MenuItem => ({
  id: record.id,
  restaurant_id: record.restaurant_id ? asString(record.restaurant_id) : undefined,
  name: asString(record.name),
  description: asString(record.description),
  price: asNumber(record.price),
  category: (asString(record.category) || 'gummies') as MenuItem['category'],
  image: asString(record.image),
  isWeightBased: asBoolean(record.isWeightBased),
  weightPricePerKg: record.weightPricePerKg === undefined ? undefined : asNumber(record.weightPricePerKg),
  options: asJson(record.options, undefined),
  strain: asString(record.strain, undefined) as 'sativa' | 'indica' | 'hybrid' | undefined,
  soldOut: record.soldOut === 1 ? true : asBoolean(record.soldOut),
  stock: record.stock === undefined ? undefined : asNumber(record.stock),
  trackInventory: asBoolean(record.track_inventory),
});

export const toPromoItem = (record: RawRecord): PromoItem => ({
  ...toMenuItem(record),
  category: 'promo',
  active: asBoolean(record.active),
  bundleItems: asJson(record.bundleItems, undefined),
  discountType: asString(record.discountType, undefined) as 'fixed' | 'percent' | undefined,
  discountValue: record.discountValue === undefined ? undefined : asNumber(record.discountValue),
  originalPrice: record.originalPrice === undefined ? undefined : asNumber(record.originalPrice),
});

export const toOrder = (record: RawRecord): Order => {
  const status = asString(record.status, 'recibido') as OrderStatus;
  const rawItems = Array.isArray(record.items) ? record.items : [];

  return {
    id: record.id,
    collectionId: record.collectionId ? asString(record.collectionId) : undefined,
    collectionName: record.collectionName ? asString(record.collectionName) : undefined,
    restaurant_id: record.restaurant_id ? asString(record.restaurant_id) : undefined,
    table_id: record.table_id ? asString(record.table_id) : undefined,
    customerName: asString(record.customerName),
    customerAddress: asString(record.customerAddress),
    items: rawItems as Order['items'],
    total: asNumber(record.total),
    subtotal: record.subtotal === undefined ? undefined : asNumber(record.subtotal),
    tax: record.tax === undefined ? undefined : asNumber(record.tax),
    deliveryFee: record.deliveryFee === undefined ? undefined : asNumber(record.deliveryFee),
    status,
    paymentMethod: asString(record.paymentMethod, 'efectivo') as Order['paymentMethod'],
    payWithAmount: record.payWithAmount === undefined ? undefined : asNumber(record.payWithAmount),
    transferScreenshot: record.transferScreenshot
      ? asString(record.transferScreenshot)
      : undefined,
    deliveryDistanceKm:
      record.deliveryDistanceKm === undefined ? undefined : asNumber(record.deliveryDistanceKm),
    order_type: record.order_type ? asString(record.order_type) as Order['order_type'] : undefined,
    notes: record.notes ? asString(record.notes) : undefined,
    sessionId: record.sessionId ? asString(record.sessionId) : undefined,
    timestamp: asNumber(record.timestamp, Date.now()),
    statusTimestamps:
      typeof record.statusTimestamps === 'object' && record.statusTimestamps !== null
        ? (record.statusTimestamps as Order['statusTimestamps'])
        : {},
  };
};
