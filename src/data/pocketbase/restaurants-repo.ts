/**
 * Restaurants repository (`restaurants` is public-read branding).
 */
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { eq } from './query';
import { firstOrNull, isNotFound } from './read';

export type RestaurantRecord = Record<string, unknown> & { id: string };

export class PocketBaseRestaurantsRepository {
  async getById(id: string): Promise<RestaurantRecord | null> {
    try {
      return await pb.collection(COLLECTIONS.restaurants).getOne<RestaurantRecord>(id);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async getBySlug(slug: string): Promise<RestaurantRecord | null> {
    return firstOrNull<RestaurantRecord>(COLLECTIONS.restaurants, eq('slug', slug));
  }

  async getAll(): Promise<RestaurantRecord[]> {
    return pb
      .collection(COLLECTIONS.restaurants)
      .getFullList<RestaurantRecord>({ sort: 'name' });
  }
}
