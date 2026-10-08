import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || '';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || '';

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('Error: Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

async function fixCollections() {
  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  console.log('Authenticated\n');

  // Restaurant Settings Collection
  try {
    const existing = await pb.collections.getOne('restaurant_settings');
    
    await pb.collections.update('restaurant_settings', {
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'shortName', type: 'text' },
        { name: 'currency', type: 'text' },
        { name: 'tagline', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'locationText', type: 'text' },
        { name: 'logoUrl', type: 'text' },
        { name: 'heroImageUrl', type: 'text' },
        { name: 'heroTitle', type: 'text' },
        { name: 'heroSubtitle', type: 'text' },
        { name: 'pickupLocationText', type: 'text' },
        { name: 'adminPin', type: 'text' },
        { name: 'kitchenPin', type: 'text' },
        { name: 'primaryColor', type: 'text' },
        { name: 'secondaryColor', type: 'text' },
        { name: 'accentColor', type: 'text' },
        { name: 'backgroundColor', type: 'text' },
        { name: 'googleFontUrl', type: 'text' },
        { name: 'googleFontName', type: 'text' },
        { name: 'categories', type: 'json' },
        { name: 'uiText', type: 'json' },
        { name: 'deliveryRules', type: 'json' },
        { name: 'paymentSettings', type: 'json' },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    console.log('✅ Updated: restaurant_settings');
  } catch (e) {
    console.error('❌ Error restaurant_settings:', e.message);
  }

  // Menu Items Collection
  try {
    await pb.collections.update('menu_items', {
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'number', required: true },
        { name: 'category', type: 'text', required: true },
        { name: 'image', type: 'text' },
        { name: 'active', type: 'bool' },
        { name: 'isWeightBased', type: 'bool' },
        { name: 'weightPricePerKg', type: 'number' },
        { name: 'stock', type: 'number' },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    console.log('✅ Updated: menu_items');
  } catch (e) {
    console.error('❌ Error menu_items:', e.message);
  }

  // Orders Collection
  try {
    await pb.collections.update('orders', {
      schema: [
        { name: 'customerName', type: 'text', required: true },
        { name: 'customerAddress', type: 'text' },
        { name: 'items', type: 'json', required: true },
        { name: 'total', type: 'number', required: true },
        { name: 'status', type: 'select', options: { values: ['recibido', 'preparando', 'empaquetando', 'listo', 'en_camino', 'entregado', 'pendiente_pago'] } },
        { name: 'paymentMethod', type: 'select', options: { values: ['efectivo', 'tarjeta', 'transferencia', 'conekta', 'mercadopago', 'codi'] } },
        { name: 'payWithAmount', type: 'number' },
        { name: 'transferScreenshot', type: 'file' },
        { name: 'deliveryDistanceKm', type: 'number' },
        { name: 'deliveryFee', type: 'number' },
        { name: 'timestamp', type: 'number' },
        { name: 'statusTimestamps', type: 'json' },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    console.log('✅ Updated: orders');
  } catch (e) {
    console.error('❌ Error orders:', e.message);
  }

  // Promos Collection
  try {
    await pb.collections.create({
      name: 'promos',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'number' },
        { name: 'category', type: 'text' },
        { name: 'image', type: 'text' },
        { name: 'active', type: 'bool' },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    console.log('✅ Created: promos');
  } catch (e) {
    if (e.data?.data?.name?.code === 'validation_not_unique') {
      console.log('⏭️  Already exists: promos');
    } else {
      console.error('❌ Error promos:', e.message);
    }
  }

  console.log('\n✅ All collections updated with schema!');
}

fixCollections();
