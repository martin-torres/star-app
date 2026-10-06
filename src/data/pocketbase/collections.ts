/**
 * Collection names for the star-app PocketBase schema.
 *
 * Single source of truth: `db/pocketbase/schema.py`. Do not invent names here -
 * a wrong collection name is a 404 at runtime, not a type error.
 */
export const COLLECTIONS = {
  restaurants: 'restaurants',
  restaurantSettings: 'restaurant_settings',
  privateSettings: 'private_settings',
  menuItems: 'menu_items',
  promos: 'promos',
  orders: 'orders',
  restaurantTables: 'restaurant_tables',
  diningSessions: 'dining_sessions',
  billRequests: 'bill_requests',
  visitors: 'visitors',
  floorPlans: 'floor_plans',
  floorProps: 'floor_props',
  importJobs: 'import_jobs',
  staff: 'staff',
  staffShifts: 'staff_shifts',
  appModules: 'app_modules',
  images: 'images',
  users: 'users',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Pre-migration code queries collection names that do not exist in the new
 * schema (review `database-reviewer.md` §2.2). Keep the mapping in one place so
 * the drift is fixed once and stays fixed.
 */
const LEGACY_COLLECTION_ALIASES: Record<string, CollectionName> = {
  tables: 'restaurant_tables',
  restaurant_configs: 'restaurant_settings',
  settings: 'restaurant_settings',
};

/** Resolve a (possibly legacy) collection name to the real schema name. */
export const resolveCollectionName = (name: string): string =>
  LEGACY_COLLECTION_ALIASES[name] ?? name;
