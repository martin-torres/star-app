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

async function verifyWeightItems() {
  try {
    console.log('🔍 Verifying weight-based menu items...\n');

    // Get all items
    const allItems = await pb.collection('menu_items').getFullList({
      filter: 'active = true',
      sort: 'category,name',
    });

    console.log(`📊 Total active items: ${allItems.length}\n`);

    // Check items in especialidades category
    const especialidadesItems = allItems.filter(item => item.category === 'especialidades');

    console.log(`📦 Items in "especialidades" category: ${especialidadesItems.length}\n`);

    if (especialidadesItems.length === 0) {
      console.log('❌ No items found in "especialidades" category');
      return;
    }

    console.log('📋 Item Details:\n');
    console.log('┌─────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐');
    console.log('│ Name            │ Category     │ isWeightBased │ weightPriceKg│ Price        │');
    console.log('├─────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤');

    especialidadesItems.forEach(item => {
      const isWeightBased = item.isWeightBased === true;
      const weightPriceKg = item.weightPricePerKg || 0;
      const price = item.price || 0;

      const name = item.name.padEnd(15);
      const category = item.category.padEnd(12);
      const weightBased = isWeightBased ? '✅ YES' : '❌ NO';
      const weightPrice = weightPriceKg > 0 ? `${weightPriceKg} MXN` : 'N/A';
      const itemPrice = price > 0 ? `${price} MXN` : '0 MXN';

      console.log(`│ ${name} │ ${category} │ ${weightBased.padEnd(12)} │ ${weightPrice.padEnd(12)} │ ${itemPrice.padEnd(12)} │`);
    });

    console.log('└─────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘\n');

    // Check for items that should be weight-based but aren't
    const expectedItems = ['Chicharrón', 'Carnitas', 'Morcón', 'Higado'];
    const missingWeightBased = expectedItems.filter(name => {
      const item = especialidadesItems.find(i => i.name === name);
      return !item || !item.isWeightBased;
    });

    if (missingWeightBased.length > 0) {
      console.log('⚠️  WARNING: The following items are missing the isWeightBased flag:');
      missingWeightBased.forEach(name => console.log(`   - ${name}`));
      console.log('\n💡 Run the seeding script to fix this:\n');
      console.log('   node scripts/seed-all-weight-items.js\n');
    } else {
      console.log('✅ All items have the correct isWeightBased flag!\n');
    }

    // Check for items that are weight-based but shouldn't be
    const itemsWithoutPrice = especialidadesItems.filter(item => item.isWeightBased && item.price > 0);
    if (itemsWithoutPrice.length > 0) {
      console.log('⚠️  WARNING: The following items have a price but are marked as weight-based:');
      itemsWithoutPrice.forEach(item => console.log(`   - ${item.name} (${item.price} MXN)`));
      console.log('\n💡 These items should have price: 0 and weightPricePerKg set instead.\n');
    }

    console.log('✨ Verification complete!\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await pb.authStore.clear();
    console.log('🔒 Logged out\n');
  }
}

verifyWeightItems();