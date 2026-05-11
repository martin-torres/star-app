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
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (typeof value === 'object') return value as T;
  return fallback;
};

export const toMenuItem = (record: RawRecord): MenuItem => ({
  id: record.id,
  restaurant_id: record.restaurant_id ? asString(record.restaurant_id) : undefined,
  name: asString(record.name),
  description: asString(record.description),
  price: asNumber(record.price),
  category: (asString(record.category) || 'pasteles') as MenuItem['category'],
  image: asString(record.image),
  isWeightBased: asBoolean(record.is_weight_based),
  weightPricePerKg: record.weight_price_per_kg === undefined ? undefined : asNumber(record.weight_price_per_kg),
  options: asJson(record.options, undefined),
  strain: asString(record.strain, undefined) as 'sativa' | 'indica' | 'hybrid' | undefined,
  soldOut: asBoolean(record.sold_out),
  stock: record.stock === undefined ? undefined : asNumber(record.stock),
  trackInventory: asBoolean(record.track_inventory),
});

export const toPromoItem = (record: RawRecord): PromoItem => ({
  ...toMenuItem(record),
  category: 'promo',
  active: asBoolean(record.active),
  bundleItems: asJson(record.bundle_items, undefined),
  discountType: asString(record.discount_type, undefined) as 'fixed' | 'percent' | undefined,
  discountValue: record.discount_value === undefined ? undefined : asNumber(record.discount_value),
  originalPrice: record.original_price === undefined ? undefined : asNumber(record.original_price),
});

export const toOrder = (record: RawRecord): Order => {
  const status = asString(record.status, 'recibido') as OrderStatus;
  const rawItems = Array.isArray(record.items) ? record.items : [];

  return {
    id: record.id,
    collectionId: record.collection_id ? asString(record.collection_id) : undefined,
    collectionName: 'orders',
    restaurant_id: record.restaurant_id ? asString(record.restaurant_id) : undefined,
    table_id: record.table_id ? asString(record.table_id) : undefined,
    customerName: asString(record.customer_name),
    customerAddress: asString(record.customer_address),
    items: rawItems as Order['items'],
    total: asNumber(record.total),
    subtotal: record.subtotal === undefined ? undefined : asNumber(record.subtotal),
    tax: record.tax === undefined ? undefined : asNumber(record.tax),
    deliveryFee: record.delivery_fee === undefined ? undefined : asNumber(record.delivery_fee),
    status,
    paymentMethod: asString(record.payment_method, 'efectivo') as Order['paymentMethod'],
    payWithAmount: record.pay_with_amount === undefined ? undefined : asNumber(record.pay_with_amount),
    transferScreenshot: record.transfer_screenshot
      ? asString(record.transfer_screenshot)
      : undefined,
    deliveryDistanceKm:
      record.delivery_distance_km === undefined ? undefined : asNumber(record.delivery_distance_km),
    order_type: record.order_type ? asString(record.order_type) as Order['order_type'] : undefined,
    notes: record.notes ? asString(record.notes) : undefined,
    sessionId: record.session_id ? asString(record.session_id) : undefined,
    timestamp: asNumber(record.timestamp, Date.now()),
    statusTimestamps:
      typeof record.status_timestamps === 'object' && record.status_timestamps !== null
        ? (record.status_timestamps as Order['statusTimestamps'])
        : typeof record.statusTimestamps === 'object' && record.statusTimestamps !== null
          ? (record.statusTimestamps as Order['statusTimestamps'])
          : {},
  };
};
