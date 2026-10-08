import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('Error: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables are required');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

const elArrocitoSettings = {
  name: 'El Arrocito',
  shortName: 'El Arrocito',
  currency: 'MXN',
  tagline: 'Sabor que se siente',
  description: 'Comida mexicana auténtica, hecha con amor',
  locationText: 'Monterrey, Nuevo León',
  logoUrl: '',
  heroImageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80',
  heroTitle: 'Bienvenido a El Arrocito',
  heroSubtitle: 'Los mejores platillos mexicanos',
  pickupLocationText: 'Recoger en Sucursal',
  adminPin: '1234',
  kitchenPin: '5678',
  primaryColor: '#dc2626',
  secondaryColor: '#f59e0b',
  accentColor: '#111827',
  backgroundColor: '#fffbeb',
  googleFontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  googleFontName: 'Poppins',
  categories: [
    { code: 'promo', displayName: 'Promociones' },
    { code: 'desayuno', displayName: 'Desayunos' },
    { code: 'comida', displayName: 'Comidas' },
    { code: 'arroz', displayName: 'Arroces' },
    { code: 'guisado', displayName: 'Guisados' },
    { code: 'bebida', displayName: 'Bebidas' },
    { code: 'antojito', displayName: 'Antojitos' },
    { code: 'postre', displayName: 'Postres' },
    { code: 'extra', displayName: 'Extras' },
  ],
  uiText: {
    loadingTitle: 'Cargando El Arrocito',
    errorTitle: 'Error al Cargar',
    retryButton: 'Intentar de Nuevo',
    menuButton: 'Menú',
    cartButton: 'Ver Carrito',
    promotionsTitle: 'Promociones del Día',
    checkoutTitle: 'Tu Pedido',
    deliveryTitle: 'Entrega',
    paymentTitle: 'Método de Pago',
    confirmOrderPrefix: 'CONFIRMAR PEDIDO',
    pickupOptionLabel: 'Paso por él',
    deliveryOptionLabel: 'A Domicilio',
    newOrderButton: 'Nuevo Pedido',
    kitchenTitle: 'Cocina',
    kitchenInProgressLabel: 'Órdenes en proceso',
    kitchenEmptyLabel: 'Sin órdenes activas',
    kitchenAcceptLabel: 'Aceptar',
    kitchenCookedLabel: 'Listo',
    kitchenDeliverCustomerLabel: 'Entregar',
    kitchenSendRiderLabel: 'Enviar',
    kitchenConfirmDeliveryLabel: 'Confirmar',
    dataTitle: 'Dashboard',
    dataRefreshLabel: 'Actualizar',
    dataLockTitle: 'Acceso Administrador',
    kitchenLockTitle: 'Acceso Cocina',
  },
  deliveryRules: {
    thresholds: [
      { km: 1, fee: 20 },
      { km: 2, fee: 30 },
      { km: 3, fee: 40 },
      { km: 5, fee: 60 },
      { km: 8, fee: 100 },
    ],
    storeLat: 25.6866,
    storeLng: -100.3161,
    promotions: [
      {
        code: 'COKE_FREE',
        description: '¡Coca-Cola GRATIS con tu pedido antes del mediodía!',
        conditions: {
          orderBeforeHour: 12,
          minOrderAmount: 100,
        },
        action: {
          type: 'free_item',
          itemCode: 'cocacola_350ml',
        },
      },
    ],
    cutoffTimes: {
      delivery: {
        lastOrderHour: 20,
        enabled: true,
      },
      pickup: {
        lastOrderHour: 21,
        enabled: true,
      },
    },
  },
  paymentSettings: {
    conektaPublicKey: '',
    mercadopagoPublicKey: '',
    codiEnabled: false,
    transferBankName: 'BBVA México',
    transferAccountNumber: 'XXXX-XXXX-XXXX',
  },
};

async function seedSettings() {
  try {
    await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Authenticated with PocketBase');

    const existing = await pb.collection('restaurant_settings').getFullList();

    if (existing.length > 0) {
      await pb.collection('restaurant_settings').update(existing[0].id, elArrocitoSettings);
      console.log('Updated existing restaurant settings');
    } else {
      await pb.collection('restaurant_settings').create(elArrocitoSettings);
      console.log('Created new restaurant settings');
    }

    console.log('El Arrocito settings seeded successfully!');
  } catch (error) {
    console.error('Error seeding settings:', error);
    process.exit(1);
  }
}

seedSettings();
