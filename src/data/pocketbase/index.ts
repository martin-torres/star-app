import { PocketBaseMenuRepository } from './menu-repo';
import { PocketBaseOrdersRepository } from './orders-repo';
import { PocketBaseSettingsRepository } from './settings-repo';
import { PocketBaseTablesRepository } from './tables-repo';

export { insforge } from './client';

export const menuRepository = new PocketBaseMenuRepository();
export const ordersRepository = new PocketBaseOrdersRepository();
export const settingsRepository = new PocketBaseSettingsRepository();
export const tablesRepository = new PocketBaseTablesRepository();
