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

async function addEspecialidadesCategory() {
  try {
    console.log('\n🌱 Adding "especialidades" category to restaurant settings...\n');

    // Get existing settings
    const settings = await pb.collection('restaurant_settings').getFirstListItem('');
    console.log('📝 Current settings found');

    // Add especialidades category if not already present
    const categories = settings.categories || [];
    const hasEspecialidades = categories.some(cat => cat.code === 'especialidades');

    if (hasEspecialidades) {
      console.log('⚠️  Category "especialidades" already exists, skipping...');
    } else {
      // Add the new category
      const updatedSettings = await pb.collection('restaurant_settings').update(settings.id, {
        categories: [...categories, { code: 'especialidades', displayName: 'Especialidades' }],
      });
      console.log('✅ Added "especialidades" category');
      console.log(`   Display name: ${updatedSettings.categories.find(c => c.code === 'especialidades')?.displayName}`);
    }

    console.log('\n✨ Category update complete!\n');
    console.log('📝 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Check the app - the Especialidades category should now appear\n');
  } catch (error) {
    console.error('❌ Failed to update settings:', error);
    process.exit(1);
  } finally {
    await pb.authStore.clear();
    console.log('🔒 Logged out');
  }
}

addEspecialidadesCategory();