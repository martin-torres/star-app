/**
 * Promos repository (manager CRUD over the `promos` collection).
 */
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { and, eq } from './query';

export interface PromoRecord {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  discount_type?: 'fixed' | 'percent' | 'bundle';
  discount_value?: number;
  original_price?: number;
  image_url?: string;
  category?: string;
  active: boolean;
  type?: 'promotion' | 'event';
  offer_type?: string;
  offer_value?: string;
  target_date?: string;
  target_weekday?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PromoInput {
  restaurant_id: string;
  name: string;
  description?: string;
  discount_type?: 'fixed' | 'percent' | 'bundle';
  discount_value?: number;
  original_price?: number;
  image_url?: string;
  category?: string;
  active?: boolean;
  type?: 'promotion' | 'event';
  offer_type?: string;
  offer_value?: string;
  target_date?: string;
  target_weekday?: number;
}

export class PocketBasePromosRepository {
  async list(restaurantId: string, activeOnly?: boolean): Promise<PromoRecord[]> {
    return pb.collection(COLLECTIONS.promos).getFullList<PromoRecord>({
      filter: and(eq('restaurant_id', restaurantId), activeOnly ? 'active = true' : ''),
      sort: '-created_at',
    });
  }

  async getById(id: string): Promise<PromoRecord> {
    return pb.collection(COLLECTIONS.promos).getOne<PromoRecord>(id);
  }

  async create(input: PromoInput): Promise<PromoRecord> {
    return pb.collection(COLLECTIONS.promos).create<PromoRecord>(input);
  }

  async update(id: string, patch: Partial<PromoRecord>): Promise<PromoRecord> {
    return pb.collection(COLLECTIONS.promos).update<PromoRecord>(id, patch);
  }

  async remove(id: string): Promise<void> {
    await pb.collection(COLLECTIONS.promos).delete(id);
  }
}
