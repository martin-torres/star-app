import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function verifySchema() {
  try {
    console.log('Authenticating with PocketBase...');
    const authData = await pb.admins.authWithPassword(
      'trulum@proton.me',
      'z9BtVngz7MpN@Vpu*v6k'
    );
    console.log('✓ Authentication successful');
    
    console.log('\nFetching all collections...');
    const collections = await pb.collections.getList(1, 50, { sort: '-created' });
    
    console.log('\n=== ALL COLLECTIONS ===');
    collections.items.forEach((col, idx) => {
      console.log(`${idx + 1}. ${col.name} (id: ${col.id})`);
      console.log(`   Type: ${col.type}`);
      if (col.schema && Array.isArray(col.schema)) {
        console.log(`   Fields: ${col.schema.map(f => f.name).join(', ')}`);
      } else {
        console.log(`   Fields: (not available)`);
      }
      console.log('');
    });
    
    // Look for translation-related collections
    console.log('=== TRANSLATION-RELATED COLLECTIONS ===');
    const translationCols = collections.items.filter(col => 
      col.name.toLowerCase().includes('translation') || 
      col.name.toLowerCase().includes('trans') ||
      (col.schema && col.schema.some(field => field.name === 'language' || field.name === 'description'))
    );
    
    if (translationCols.length > 0) {
      translationCols.forEach(col => {
        console.log(`\nCollection: ${col.name}`);
        console.log('Schema:');
        if (col.schema && Array.isArray(col.schema)) {
          col.schema.forEach(field => {
            console.log(`  - ${field.name}: ${field.type}${field.required ? ' (required)' : ''}${field.unique ? ' (unique)' : ''}`);
          });
        } else {
          console.log('  (schema not available)');
        }
      });
    } else {
      console.log('No translation-related collections found.');
    }
    
    // Check menu_items collection for reference
    console.log('\n=== MENU_ITEMS COLLECTION ===');
    const menuItemsCol = collections.items.find(col => col.name === 'menu_items');
    if (menuItemsCol) {
      console.log('Found menu_items collection');
      console.log('Schema:');
      if (menuItemsCol.schema && Array.isArray(menuItemsCol.schema)) {
        menuItemsCol.schema.forEach(field => {
          console.log(`  - ${field.name}: ${field.type}${field.required ? ' (required)' : ''}${field.unique ? ' (unique)' : ''}`);
        });
      }
    } else {
      console.log('menu_items collection not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

verifySchema();