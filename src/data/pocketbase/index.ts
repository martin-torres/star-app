/**
 * star-app data layer - the PocketBase client and its repositories.
 *
 * This is the canonical data path. `src/data/insforge/**` and
 * `src/data/pocketbase/legacy-insforge.ts` exist only as a migration bridge for
 * pre-006 feature code and should be deleted once those callers move here.
 */
export {
  pb,
  PocketBase,
  POCKETBASE_URL,
  DEFAULT_POCKETBASE_URL,
  insforge,
} from './client';
export { COLLECTIONS, resolveCollectionName, type CollectionName } from './collections';
export { and, eq, isNull, neq, oneOf, orderBy, pbLiteral, sortBy, type SortDirection } from './query';
export { asRecord, firstOrNull, isNotFound } from './read';
export * from './mappers';

export { PocketBaseMenuRepository } from './menu-repo';
export { PocketBaseOrdersRepository } from './orders-repo';
export { PocketBaseSettingsRepository } from './settings-repo';
export { PocketBaseTablesRepository } from './tables-repo';
export { PocketBasePromosRepository, type PromoInput, type PromoRecord } from './promos-repo';
export { PocketBaseDineInRepository } from './dinein-repo';
export {
  PocketBaseStaffRepository,
  type StaffInput,
  type StaffRecord,
  type StaffShiftRecord,
} from './staff-repo';
export {
  PocketBaseImportsRepository,
  type ImportJobInput,
  type ImportJobRecord,
  type ImportKind,
  type ImportStatus,
} from './imports-repo';
export { PocketBaseAppModulesRepository, type AppModuleRecord } from './app-modules-repo';
export { PocketBaseVisitorRepository } from './visitor-repo';
export { PocketBaseAuthRepository, type AuthUser } from './auth-repo';
export {
  PocketBaseRestaurantsRepository,
  type RestaurantRecord,
} from './restaurants-repo';
export {
  PocketBaseFloorPlanRepository,
  floorPlanApi,
  type FloorPlanApi,
} from './floor-plan-repo';

import { PocketBaseAppModulesRepository } from './app-modules-repo';
import { PocketBaseAuthRepository } from './auth-repo';
import { PocketBaseDineInRepository } from './dinein-repo';
import { PocketBaseFloorPlanRepository } from './floor-plan-repo';
import { PocketBaseImportsRepository } from './imports-repo';
import { PocketBaseMenuRepository } from './menu-repo';
import { PocketBaseOrdersRepository } from './orders-repo';
import { PocketBasePromosRepository } from './promos-repo';
import { PocketBaseRestaurantsRepository } from './restaurants-repo';
import { PocketBaseSettingsRepository } from './settings-repo';
import { PocketBaseStaffRepository } from './staff-repo';
import { PocketBaseTablesRepository } from './tables-repo';
import { PocketBaseVisitorRepository } from './visitor-repo';

// Singletons (the repositories are stateless; one instance is enough).
export const menuRepository = new PocketBaseMenuRepository();
export const ordersRepository = new PocketBaseOrdersRepository();
export const settingsRepository = new PocketBaseSettingsRepository();
export const tablesRepository = new PocketBaseTablesRepository();
export const promosRepository = new PocketBasePromosRepository();
export const dineInRepository = new PocketBaseDineInRepository();
export const staffRepository = new PocketBaseStaffRepository();
export const importsRepository = new PocketBaseImportsRepository();
export const appModulesRepository = new PocketBaseAppModulesRepository();
export const visitorRepository = new PocketBaseVisitorRepository();
export const authRepository = new PocketBaseAuthRepository();
export const restaurantsRepository = new PocketBaseRestaurantsRepository();
export const floorPlanRepository = new PocketBaseFloorPlanRepository();
