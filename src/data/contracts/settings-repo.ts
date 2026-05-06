import type { AppSkinSettings } from '../../core/types';

export interface SettingsRepository {
  get(restaurantId?: string): Promise<AppSkinSettings | null>;
  save(settings: Partial<AppSkinSettings>, restaurantId?: string): Promise<AppSkinSettings>;
}
