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

async function migrateWeightFields() {
  try {
    console.log('🔧 Migrating weight-based fields to PocketBase schema...\n');

    // Step 1: Add fields to menu_items collection
    console.log('📝 Step 1: Adding fields to menu_items collection...');
    try {
      const menuItemsSchema = await pb.collection('menu_items').getSchema();
      
      // Check if fields already exist
      const hasIsWeightBased = menuItemsSchema.some(f => f.name === 'isWeightBased');
      const hasWeightPricePerKg = menuItemsSchema.some(f => f.name === 'weightPricePerKg');

      if (hasIsWeightBased && hasWeightPricePerKg) {
        console.log('   ✅ Fields already exist, skipping...\n');
      } else {
        // Add fields
        const newFields = [];
        if (!hasIsWeightBased) {
          newFields.push({
            name: 'isWeightBased',
            type: 'bool',
            required: false,
            system: false,
            hidden: false,
            list: false,
            min: null,
            max: null,
            options: null
          });
          console.log('   ✅ Added field: isWeightBased (bool)');
        }
        if (!hasWeightPricePerKg) {
          newFields.push({
            name: 'weightPricePerKg',
            type: 'number',
            required: false,
            system: false,
            hidden: false,
            list: false,
            min: 0,
            max: null,
            options: null
          });
          console.log('   ✅ Added field: weightPricePerKg (number)');
        }

        if (newFields.length > 0) {
          await pb.collection('menu_items').updateSchema(newFields);
          console.log('   ✅ Schema updated successfully\n');
        }
      }
    } catch (error) {
      console.error('   ❌ Error updating menu_items schema:', error.message);
      console.log('   💡 You may need to add these fields manually in PocketBase Admin UI\n');
    }

    // Step 2: Add fields to orders collection
    console.log('📝 Step 2: Adding fields to orders collection...');
    try {
      const ordersSchema = await pb.collection('orders').getSchema();
      const hasWeightInGrams = ordersSchema.some(f => f.name === 'weightInGrams');

      if (hasWeightInGrams) {
        console.log('   ✅ Field already exists, skipping...\n');
      } else {
        const newField = {
          name: 'weightInGrams',
          type: 'number',
          required: false,
          system: false,
          hidden: false,
          list: false,
          min: 0,
          max: null,
          options: null
        };
        await pb.collection('orders').updateSchema([newField]);
        console.log('   ✅ Added field: weightInGrams (number)\n');
      }
    } catch (error) {
      console.error('   ❌ Error updating orders schema:', error.message);
      console.log('   💡 You may need to add this field manually in PocketBase Admin UI\n');
    }

    // Step 3: Create weight-based menu items
    console.log('📝 Step 3: Creating weight-based menu items...\n');

    const weightItems = [
      {
        name: 'Chicharrón',
        description: '',
        price: 0,
        category: 'especialidades',
        image: '',
        isWeightBased: true,
        weightPricePerKg: 580,
        active: true,
      },
      {
        name: 'Carnitas',
        description: '',
        price: 0,
        category: 'especialidades',
        image: '',
        isWeightBased: true,
        weightPricePerKg: 580,
        active: true,
      },
      {
        name: 'Morcón',
        description: '',
        price: 0,
        category: 'especialidades',
        image: '',
        isWeightBased: true,
        weightPricePerKg: 420,
        active: true,
      },
      {
        name: 'Higado',
        description: '',
        price: 0,
        category: 'especialidades',
        image: '',
        isWeightBased: true,
        weightPricePerKg: 250,
        active: true,
      },
    ];

    for (const item of weightItems) {
      try {
        const created = await pb.collection('menu_items').create(item);
        console.log(`   ✅ Created: ${created.name} (${created.weightPricePerKg} MXN/kg)`);
      } catch (error) {
        if (error?.message?.includes('already exists')) {
          console.log(`   ⚠️  Skipped (already exists): ${item.name}`);
        } else {
          console.error(`   ❌ Error creating ${item.name}:`, error.message);
        }
      }
    }

    console.log('\n');

    // Step 4: Add "especialidades" category to restaurant_settings
    console.log('📝 Step 4: Adding "especialidades" category to restaurant settings...');
    try {
      const settings = await pb.collection('restaurant_settings').getFirstListItem('');
      const categories = settings.categories || [];
      const hasEspecialidades = categories.some(cat => cat.code === 'especialidades');

      if (hasEspecialidades) {
        console.log('   ⚠️  Category already exists, skipping...\n');
      } else {
        const updatedSettings = await pb.collection('restaurant_settings').update(settings.id, {
          categories: [...categories, { code: 'especialidades', displayName: 'Especialidades' }],
        });
        console.log('   ✅ Added "especialidades" category\n');
      }
    } catch (error) {
      console.error('   ❌ Error updating settings:', error.message);
      console.log('   💡 You may need to add this category manually in PocketBase Admin UI\n');
    }

    console.log('✨ Migration complete!\n');
    console.log('📝 Next steps:');
    console.log('1. Restart your development server (npm run dev)');
    console.log('2. Check the app - items should now appear in the Especialidades category');
    console.log('3. Click on any item to see the weight-based ordering modal\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pb.authStore.clear();
    console.log('🔒 Logged out\n');
  }
}

migrateWeightFields();