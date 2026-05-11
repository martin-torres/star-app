import type { AppSkinSettings, UiTextSettings } from './types';

export interface ResolvedUiSettings {
  name: string;
  currency: string;
  shortName: string;
  tagline: string;
  description: string;
  locationText: string;
  logoUrl: string;
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  pickupLocationText: string;
  adminPin: string;
  kitchenPin: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  googleFontUrl?: string;
  googleFontName?: string;
  uiText: Required<UiTextSettings>;
  categories: Array<{ code: string; displayName: string }>;
  deliveryRules: {
    thresholds?: Array<{ km: number; fee: number }>;
    storeLat?: number;
    storeLng?: number;
  };
  paymentSettings?: {
    conektaPublicKey?: string;
    mercadopagoPublicKey?: string;
    codiEnabled?: boolean;
    transferBankName?: string;
    transferAccountNumber?: string;
  };
}

const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800&h=1200';

const DEFAULT_UI_TEXT: Required<UiTextSettings> = {
  loadingTitle: 'Cargando Menú',
  errorTitle: 'Error al Cargar',
  retryButton: 'Intentar de Nuevo',
  menuButton: 'Menú',
  cartButton: 'Ver Carrito',
  promotionsTitle: 'Promociones',
  checkoutTitle: 'Tu Pedido',
  deliveryTitle: 'Entrega',
  paymentTitle: 'Pago',
  confirmOrderPrefix: 'CONFIRMAR PEDIDO',
  pickupOptionLabel: 'Paso por él',
  deliveryOptionLabel: 'A Domicilio',
  newOrderButton: 'Nuevo Pedido',
  kitchenTitle: 'Panel Cocina',
  kitchenInProgressLabel: 'Órdenes en proceso',
  kitchenEmptyLabel: 'Sin órdenes activas',
  kitchenAcceptLabel: 'Aceptar Comanda',
  kitchenCookedLabel: 'Marcar Cocinado',
  kitchenDeliverCustomerLabel: 'Entregar Cliente',
  kitchenSendRiderLabel: 'Enviar Moto',
  kitchenConfirmDeliveryLabel: 'Confirmar Entrega',
  dataTitle: 'Analíticas',
  dataRefreshLabel: 'Actualizar',
  dataLockTitle: 'Solo Dueño',
  kitchenLockTitle: 'Acceso Cocina',
};

export const resolveUiSettings = (
  settings: AppSkinSettings | null | undefined
): ResolvedUiSettings => ({
  name: settings?.name || 'Restaurant',
  currency: settings?.currency || 'MXN',
  shortName: settings?.shortName || settings?.name || 'Restaurant',
  tagline: settings?.tagline || '',
  description: settings?.description || '',
  locationText: settings?.locationText || 'Tu Ciudad',
  logoUrl: settings?.logoUrl || '',
  heroImageUrl: settings?.heroImageUrl || DEFAULT_HERO,
  heroTitle: settings?.heroTitle || 'Bienvenido',
  heroSubtitle: settings?.heroSubtitle || '',
  pickupLocationText: settings?.pickupLocationText || 'Recoger en Sucursal',
  adminPin: settings?.adminPin || '0000',
  kitchenPin: settings?.kitchenPin || '0000',
  primaryColor: settings?.primaryColor || '#f59e0b',
  secondaryColor: settings?.secondaryColor || '#ea580c',
  accentColor: settings?.accentColor || '#111827',
  backgroundColor: settings?.backgroundColor || '#f8fafc',
  googleFontUrl: settings?.googleFontUrl,
  googleFontName: settings?.googleFontName,
  uiText: { ...DEFAULT_UI_TEXT, ...(settings?.uiText || {}) },
  categories:
    settings?.categories && settings.categories.length > 0
      ? settings.categories
      : [
          { code: 'pasteles', displayName: 'Pasteles' },
          { code: 'postres', displayName: 'Postres' },
          { code: 'especial', displayName: 'Especialidades' },
          { code: 'promo', displayName: 'Promociones' },
        ],
  deliveryRules: settings?.deliveryRules || {},
  paymentSettings: settings?.paymentSettings,
});
