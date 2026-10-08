/**
 * PocketBase Collection Setup Script for Star Multi-Tenant App
 *
 * Creates all required collections: restaurants, menu_items, tables,
 * orders, promos, visitors, settings, dining_sessions, bill_requests
 *
 * Usage:
 *   PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=yourpassword node scripts/setup-collections.js
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('Error: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables are required');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

async function collectionExists(name) {
  try {
    const collections = await pb.collections.getFullList();
    return collections.some(c => c.name === name);
  } catch {
    return false;
  }
}

async function setupCollections() {
  try {
    await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log('Authenticated with PocketBase');

    const schemaPath = resolve(__dirname, '..', 'pocketbase-schema.json');
    const schemaData = JSON.parse(readFileSync(schemaPath, 'utf-8'));

    for (const collectionDef of schemaData) {
      const name = collectionDef.name;
      const exists = await collectionExists(name);

      if (exists) {
        console.log(`  Collection "${name}" already exists, skipping creation`);
        continue;
      }

      console.log(`  Creating collection "${name}"...`);
      try {
        await pb.collections.create(collectionDef);
        console.log(`  ✓ Created "${name}"`);
      } catch (err) {
        console.error(`  ✗ Failed to create "${name}":`, err.message);
      }
    }

    console.log('\nCollection setup complete!');
    console.log('Collections created:');
    const collections = await pb.collections.getFullList();
    collections.forEach(c => console.log(`  - ${c.name} (${c.type})`));

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupCollections();
