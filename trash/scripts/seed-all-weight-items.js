import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');

// Set admin auth
await pb.admins.authWithPassword(
  process.env.PB_ADMIN_EMAIL || 'trulum@proton.me',
  process.env.PB_ADMIN_PASSWORD || 'z9BtVngz7MpN@Vpu*v6k'
);

console.log('✅ Connected to PocketBase as admin\n');

// Weight-based menu items
const weightItems = [
  {
    name: 'Chicharrón',
    description: '',
    price: 0, // Weight-based items have 0 base price
    category: 'especialidades',
    image: '',
    isWeightBased: true,
    weightPricePerKg: 580,
    active: true,
  },
  {
    name: 'Carnitas',
    description: '',
    price: 0, // Weight-based items have 0 base price
    category: 'especialidades',
    image: '',
    isWeightBased: true,
    weightPricePerKg: 580,
    active: true,
  },
  {
    name: 'Morcón',
    description: '',
    price: 0, // Weight-based items have 0 base price
    category: 'especialidades',
    image: '',
    isWeightBased: true,
    weightPricePerKg: 420,
    active: true,
  },
  {
    name: 'Higado',
    description: '',
    price: 0, // Weight-based items have 0 base price
    category: 'especialidades',
    image: '',
    isWeightBased: true,
    weightPricePerKg: 250,
    active: true,
  },
];

async function seedAll() {
  try {
    console.log('🌱 Seeding weight-based menu items and category...\n');

    // Step 1: Add items
    console.log('📝 Step 1: Creating menu items...');
    for (const item of weightItems) {
      try {
        const created = await pb.collection('menu_items').create(item);
        console.log(`   ✅ ${created.name} (${created.weightPricePerKg} MXN/kg)`);
      } catch (error) {
        if (error?.message?.includes('already exists')) {
          console.log(`   ⚠️  ${item.name} (already exists)`);
        } else {
          console.error(`   ❌ Error creating ${item.name}:`, error.message);
        }
      }
    }

    // Step 2: Add category
    console.log('\n📝 Step 2: Adding "especialidades" category...');
    try {
      const settings = await pb.collection('restaurant_settings').getFirstListItem('');
      const categories = settings.categories || [];
      const hasEspecialidades = categories.some(cat => cat.code === 'especialidades');

      if (hasEspecialidades) {
        console.log('   ⚠️  Category already exists, skipping...');
      } else {
        const updatedSettings = await pb.collection('restaurant_settings').update(settings.id, {
          categories: [...categories, { code: 'especialidades', displayName: 'Especialidades' }],
        });
        console.log('   ✅ Added "especialidades" category');
      }
    } catch (error) {
      console.error('   ❌ Error updating settings:', error.message);
    }

    console.log('\n✨ Seeding complete!\n');
    console.log('📝 Next steps:');
    console.log('1. Restart your development server (npm run dev)');
    console.log('2. Check the app - items should now appear in the Especialidades category');
    console.log('3. Click on any item to see the weight-based ordering modal\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pb.authStore.clear();
    console.log('🔒 Logged out\n');
  }
}

seedAll();