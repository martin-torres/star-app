/**
 * App-modules repository (which optional modules are enabled per restaurant).
 */
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { and, eq } from './query';
import { firstOrNull } from './read';
import { compact } from './mappers';

export interface AppModuleRecord {
  id: string;
  restaurant_id: string;
  slug: string;
  enabled: boolean;
  settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export class PocketBaseAppModulesRepository {
  async list(restaurantId: string): Promise<AppModuleRecord[]> {
    return pb.collection(COLLECTIONS.appModules).getFullList<AppModuleRecord>({
      filter: eq('restaurant_id', restaurantId),
      sort: 'created_at',
    });
  }

  async getBySlug(restaurantId: string, slug: string): Promise<AppModuleRecord | null> {
    return firstOrNull<AppModuleRecord>(
      COLLECTIONS.appModules,
      and(eq('restaurant_id', restaurantId), eq('slug', slug)),
    );
  }

  /** Get-then-create-or-update (PocketBase has no `.upsert()`). */
  async upsert(record: {
    restaurant_id: string;
    slug: string;
    enabled?: boolean;
    settings?: Record<string, unknown>;
  }): Promise<AppModuleRecord> {
    const existing = await this.getBySlug(record.restaurant_id, record.slug);
    if (existing) {
      return pb.collection(COLLECTIONS.appModules).update<AppModuleRecord>(
        existing.id,
        compact({ enabled: record.enabled, settings: record.settings }),
      );
    }
    return pb.collection(COLLECTIONS.appModules).create<AppModuleRecord>(compact({ ...record }));
  }
}
