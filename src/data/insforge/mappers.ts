/**
 * Database → TypeScript type mappers for the 2y542jyv schema.
 *
 * The 2y542jyv schema (Dond my first project / restaurant-platform) has a
 * normalized 36-table layout. These mappers adapt its columns to the
 * star-app TypeScript types (src/core/types.ts).
 */

import type {
  MenuItem,
  Order,
  OrderStatus,
  PromoItem,
  AppSkinSettings,
  RestaurantTable,
  DiningSession,
  BillRequest,
} from '../../core/types';

type RawRecord = Record<string, unknown> & { id: string };

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Menu Items ───────────────────────────────────────────────────────────────

export const toMenuItem = (record: RawRecord): MenuItem => ({
  id: record.id,
  restaurant_id: record.restaurant_id ? asString(record.restaurant_id) : undefined,
  name: asString(record.name),
  description: asString(record.description),
  price: asNumber(record.price),
  category: (asString(record.category) || 'pasteles') as MenuItem['category'],
  /** DB column: image_url, mapped to `image` */
  image: asString(record.image_url),
  isWeightBased: asBoolean(record.is_weight_based),
  weightPricePerKg: record.weight_price_per_kg === undefined ? undefined : asNumber(record.weight_price_per_kg),
  weightInGrams: record.weight_in_grams === undefined ? undefined : asNumber(record.weight_in_grams),
  options: asJson(record.options, undefined),
  strain: asString(record.strain, undefined) as 'sativa' | 'indica' | 'hybrid' | undefined,
  /** DB column: is_available (inverted for soldOut) */
  soldOut: record.is_available !== undefined ? !asBoolean(record.is_available) : undefined,
  stock: record.stock === undefined ? undefined : asNumber(record.stock),
  trackInventory: asBoolean(record.track_inventory),
});

export const menuItemToDb = (item: Partial<MenuItem>): Record<string, unknown> => ({
  ...(item.name !== undefined && { name: item.name }),
  ...(item.description !== undefined && { description: item.description }),
  ...(item.price !== undefined && { price: item.price }),
  ...(item.image !== undefined && { image_url: item.image }),
  ...(item.category !== undefined && { category: item.category }),
  ...(item.isWeightBased !== undefined && { is_weight_based: item.isWeightBased }),
  ...(item.weightPricePerKg !== undefined && { weight_price_per_kg: item.weightPricePerKg }),
  ...(item.weightInGrams !== undefined && { weight_in_grams: item.weightInGrams }),
  ...(item.options !== undefined && { options: item.options }),
  ...(item.strain !== undefined && { strain: item.strain }),
  ...(item.soldOut !== undefined && { is_available: !item.soldOut }),
  ...(item.stock !== undefined && { stock: item.stock }),
  ...(item.trackInventory !== undefined && { track_inventory: item.trackInventory }),
});

// ── Promos (which map to PromoItem) ──────────────────────────────────────────

export const toPromoItem = (record: RawRecord): PromoItem => ({
  ...toMenuItem(record),
  category: 'promo',
  active: asBoolean(record.active),
  bundleItems: asJson(record.bundle_items, undefined),
  discountType: asString(record.discount_type, undefined) as 'fixed' | 'percent' | undefined,
  discountValue: record.discount_value === undefined ? undefined : asNumber(record.discount_value),
  originalPrice: record.original_price === undefined ? undefined : asNumber(record.original_price),
});

// ── Orders ───────────────────────────────────────────────────────────────────

export const toOrder = (record: RawRecord): Order => {
  const status = asString(record.status, 'recibido') as OrderStatus;
  const rawItems = Array.isArray(record.items) ? record.items : [];

  return {
    id: record.id,
    restaurant_id: record.restaurant_id ? asString(record.restaurant_id) : undefined,
    table_id: record.table_id ? asString(record.table_id) : undefined,
    customerName: asString(record.customer_name),
    customerAddress: asString(record.customer_address || record.customer_address),
    items: rawItems as Order['items'],
    total: asNumber(record.total),
    subtotal: record.subtotal === undefined ? undefined : asNumber(record.subtotal),
    tax: record.tax === undefined ? undefined : asNumber(record.tax),
    deliveryFee: record.delivery_fee === undefined ? undefined : asNumber(record.delivery_fee),
    status,
    paymentMethod: asString(record.payment_method, 'efectivo') as Order['paymentMethod'],
    payWithAmount: record.pay_with_amount === undefined ? undefined : asNumber(record.pay_with_amount),
    /** DB column: transfer_screenshot */
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
        : typeof record.status_timestamps === 'object' && record.status_timestamps !== null
          ? (record.status_timestamps as Order['statusTimestamps'])
          : {},
  };
};

export const orderToDb = (order: Omit<Order, 'id'> & { id?: string }): Record<string, unknown> => {
  const now = Date.now();
  return {
    ...(order.restaurant_id !== undefined && { restaurant_id: order.restaurant_id }),
    ...(order.table_id !== undefined && { table_id: order.table_id }),
    customer_name: order.customerName || '',
    customer_address: order.customerAddress || '',
    items: order.items || [],
    total: order.total || 0,
    delivery_fee: order.deliveryFee || 0,
    delivery_distance_km: order.deliveryDistanceKm || 0,
    status: order.status || 'recibido',
    payment_method: order.paymentMethod || 'efectivo',
    pay_with_amount: order.payWithAmount || 0,
    order_type: order.order_type || 'pickup',
    notes: order.notes || '',
    session_id: order.sessionId || '',
    transfer_screenshot: order.transferScreenshot || '',
    timestamp: now,
    status_timestamps: { recibido: now },
  };
};

// ── Restaurant Tables ────────────────────────────────────────────────────────

export const toRestaurantTable = (record: RawRecord): RestaurantTable => ({
  id: record.id,
  restaurant_id: asString(record.restaurant_id || ''),
  table_number: asNumber(record.table_number, 0),
  display_name: record.display_name ? asString(record.display_name) : undefined,
  seats: asNumber(record.seats, 1),
  location: record.location as RestaurantTable['location'],
  qr_code_url: record.qr_code_url ? asString(record.qr_code_url) : undefined,
  x: record.x !== undefined ? asNumber(record.x) : undefined,
  y: record.y !== undefined ? asNumber(record.y) : undefined,
  is_available: record.is_available === true || record.is_available === undefined,
});

// ── Settings (restaurant → AppSkinSettings) ───────────────────────────────────

/**
 * Maps a `restaurants` row + optional `restaurant_settings` blob → AppSkinSettings.
 *
 * In the 2y542jyv schema the top-level branding fields live on the `restaurants`
 * table directly. Specialized/extra settings go into `restaurant_settings.data`.
 */
export const toAppSkinSettings = (
  restaurant: RawRecord | null,
  settingsData?: Record<string, unknown> | null,
): AppSkinSettings | null => {
  if (!restaurant) return null;
  return {
    name: asString(restaurant.name),
    currency: restaurant.currency ? asString(restaurant.currency) : undefined,
    tagline: restaurant.tagline ? asString(restaurant.tagline) : undefined,
    description: restaurant.description ? asString(restaurant.description) : undefined,
    logoUrl: restaurant.logo_url ? asString(restaurant.logo_url) : undefined,
    heroImageUrl: restaurant.hero_image_url ? asString(restaurant.hero_image_url) : undefined,
    heroTitle: restaurant.hero_text ? asString(restaurant.hero_text) : undefined,
    primaryColor: restaurant.primary_color ? asString(restaurant.primary_color) : undefined,
    secondaryColor: restaurant.secondary_color ? asString(restaurant.secondary_color) : undefined,
    accentColor: restaurant.accent_color ? asString(restaurant.accent_color) : undefined,
    backgroundColor: restaurant.background_color ? asString(restaurant.background_color) : undefined,
    googleFontUrl: restaurant.google_font_url ? asString(restaurant.google_font_url) : undefined,
    googleFontName: restaurant.google_font_name ? asString(restaurant.google_font_name) : undefined,
    mode: restaurant.mode as AppSkinSettings['mode'],
    // Extra settings from restaurant_settings.data (if any)
    ...(settingsData || {}),
  };
};

// ── Dining Sessions ──────────────────────────────────────────────────────────

export const toDiningSession = (record: RawRecord): DiningSession => ({
  id: record.id,
  restaurant_id: asString(record.restaurant_id || ''),
  table_id: asString(record.table_id || ''),
  customer_name: record.customer_name ? asString(record.customer_name) : undefined,
  customer_phone: record.customer_phone ? asString(record.customer_phone) : undefined,
  status: (asString(record.status, 'active') as DiningSession['status']),
  order_ids: asJson<string[]>(record.order_ids, []),
  session_start: asNumber(record.session_start, Date.now()),
  session_end: record.session_end ? asNumber(record.session_end) : undefined,
});

// ── Bill Requests ───────────────────────────────────────────────────────────

export const toBillRequest = (record: RawRecord): BillRequest => ({
  id: record.id,
  restaurant_id: asString(record.restaurant_id || ''),
  table_id: asString(record.table_id || ''),
  order_ids: asJson<string[]>(record.order_ids, []),
  subtotal: asNumber(record.subtotal, 0),
  tax: asNumber(record.tax, 0),
  tip: asNumber(record.tip, 0),
  total: asNumber(record.total, 0),
  status: (asString(record.status, 'requested') as BillRequest['status']),
  payments: asJson(record.payments, []),
  requested_at: asNumber(record.requested_at, Date.now()),
});
