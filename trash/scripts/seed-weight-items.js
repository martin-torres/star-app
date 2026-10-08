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

console.log('✅ Connected to PocketBase as admin');

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

async function seedWeightItems() {
  try {
    console.log('\n🌱 Seeding weight-based menu items...\n');

    for (const item of weightItems) {
      try {
        const created = await pb.collection('menu_items').create(item);
        console.log(`✅ Created: ${created.name} (${created.weightPricePerKg} MXN/kg)`);
      } catch (error) {
        if (error?.message?.includes('already exists')) {
          console.log(`⚠️  Skipped (already exists): ${item.name}`);
        } else {
          console.error(`❌ Error creating ${item.name}:`, error.message);
        }
      }
    }

    console.log('\n✨ Seeding complete!\n');
    console.log('📝 Next steps:');
    console.log('1. Add "especialidades" category to restaurant_settings');
    console.log('2. Restart your development server');
    console.log('3. Check the app - items should now appear in the Especialidades category\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pb.authStore.clear();
    console.log('🔒 Logged out');
  }
}

seedWeightItems();