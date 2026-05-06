export type OrderStatus =
  | 'recibido'
  | 'preparando'
  | 'empaquetando'
  | 'listo'
  | 'en_camino'
  | 'entregado'
  | 'pendiente_pago'
  | 'paid'
  | 'cancelled';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'conekta' | 'mercadopago' | 'codi';
export type DeliveryType = 'domicilio' | 'sucursal';
export type MenuCategory = 
  | 'gummies' | 'candy' | 'chocolate' | 'drinks' | 'present'
  | 'greenhouse_premium' | 'greenhouse_selecta' | 'living_soil' | 'hydro'
  | 'edibles' | 'prerolls' | 'infusionados' | 'hash_holes' | 'extractos' | 'vapes' | 'psicodelia';

export type RestaurantMode = 'to-go' | 'dine-in' | 'both';
export type OrderType = 'pickup' | 'delivery' | 'dine-in';

export interface BundleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PromoItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'promo';
  image: string;
  active: boolean;
  bundleItems?: BundleItem[];
  discountType?: 'fixed' | 'percent';
  discountValue?: number;
  originalPrice?: number;
}

export interface MenuItem {
  id: string;
  restaurant_id?: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  isWeightBased?: boolean;
  weightPricePerKg?: number;
  weightInGrams?: number;
  options?: ItemOption[];
  strain?: 'sativa' | 'indica' | 'hybrid';
  soldOut?: boolean;
  /** Current stock count. -1 = unlimited (default). */
  stock?: number;
  /** Whether inventory tracking is enabled for this item. */
  trackInventory?: boolean;
}

export interface ItemOption {
  id: string;
  label: string;
  price: number;
  quantity?: number;
  unit?: string;
  dosage?: string;
  weight?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  weightInGrams?: number;
  selectedOption?: ItemOption;
  isBundle?: boolean;
  bundleItems?: BundleItem[];
}

export interface Order {
  id: string;
  collectionId?: string;
  collectionName?: string;
  restaurant_id?: string;
  table_id?: string;
  customerName: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  payWithAmount?: number;
  transferScreenshot?: string;
  deliveryDistanceKm?: number;
  order_type?: OrderType;
  notes?: string;
  sessionId?: string;
  timestamp: number;
  statusTimestamps: Partial<Record<OrderStatus, number>>;
}

export interface VisitorRecord {
  id: string;
  restaurant_id?: string;
  ip: string;
  userAgent?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  isPwaInstalled?: boolean;
  sessionId: string;
  firstVisit: string;
  lastVisit: string;
  visitCount: number;
  associatedOrders?: string[];
}

export interface CustomerInfo {
  name: string;
  address: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface UiTextSettings {
  loadingTitle?: string;
  errorTitle?: string;
  retryButton?: string;
  menuButton?: string;
  cartButton?: string;
  promotionsTitle?: string;
  checkoutTitle?: string;
  deliveryTitle?: string;
  paymentTitle?: string;
  confirmOrderPrefix?: string;
  pickupOptionLabel?: string;
  deliveryOptionLabel?: string;
  newOrderButton?: string;
  kitchenTitle?: string;
  kitchenInProgressLabel?: string;
  kitchenEmptyLabel?: string;
  kitchenAcceptLabel?: string;
  kitchenCookedLabel?: string;
  kitchenDeliverCustomerLabel?: string;
  kitchenSendRiderLabel?: string;
  kitchenConfirmDeliveryLabel?: string;
  dataTitle?: string;
  dataRefreshLabel?: string;
  dataLockTitle?: string;
  kitchenLockTitle?: string;
}

export interface Promotion {
  code: string;
  description: string;
  conditions: {
    orderBeforeHour?: number;
    orderAfterHour?: number;
    minOrderAmount?: number;
    daysOfWeek?: number[];
  };
  action: {
    type: 'free_item' | 'discount_percent' | 'discount_fixed';
    itemCode?: string;
    value?: number;
  };
}

export interface CutoffTime {
  lastOrderHour: number;
  enabled: boolean;
}

export interface PaymentProof {
  type: 'transfer_screenshot' | 'bank_receipt' | 'atm_receipt';
  file: File | string;
  bankName?: string;
  authorizationCode?: string;
}

export interface AppSkinSettings {
  name: string;
  currency?: string;
  shortName?: string;
  tagline?: string;
  description?: string;
  locationText?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  pickupLocationText?: string;
  adminPin?: string;
  kitchenPin?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  googleFontUrl?: string;
  googleFontName?: string;
  categories?: Array<{
    code: string;
    displayName: string;
  }>;
  uiText?: UiTextSettings;
  deliveryRules?: {
    thresholds?: Array<{
      km: number;
      fee: number;
    }>;
    storeLat?: number;
    storeLng?: number;
    promotions?: Promotion[];
    cutoffTimes?: {
      delivery?: CutoffTime;
      pickup?: CutoffTime;
    };
  };
  paymentSettings?: {
    conektaPublicKey?: string;
    mercadopagoPublicKey?: string;
    codiEnabled?: boolean;
    transferBankName?: string;
    transferAccountNumber?: string;
  };
  visitorTrackingEnabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramNotificationsEnabled?: boolean;
  /** Restaurant operating mode */
  mode?: RestaurantMode;
}

// ============================================================
// DINE-IN / TABLE TYPES
// ============================================================

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  table_number: number;
  display_name?: string;
  seats: number;
  location?: 'patio' | 'window' | 'balcony' | 'middle' | 'bar' | 'private' | 'outdoor';
  qr_code_url?: string;
  x?: number;
  y?: number;
  is_available: boolean;
}

export interface DiningSession {
  id: string;
  restaurant_id: string;
  table_id: string;
  customer_name?: string;
  customer_phone?: string;
  status: 'active' | 'ordering' | 'bill_requested' | 'paid' | 'closed';
  order_ids: string[];
  session_start: number;
  session_end?: number;
}

export interface BillRequest {
  id: string;
  restaurant_id: string;
  table_id: string;
  order_ids: string[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: 'requested' | 'processing' | 'paid' | 'cancelled';
  payments: BillPayment[];
  requested_at: number;
}

export interface BillPayment {
  userId: string;
  userName: string;
  amount: number;
  paidAt: number;
  items?: string[];
}

export type DineInStage =
  | 'qr-scan'
  | 'restaurant-info'
  | 'table-selection'
  | 'dining'
  | 'bill'
  | 'payment-complete';
