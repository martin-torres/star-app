/**
 * @deprecated MIGRATION BRIDGE - not the data layer.
 *
 * The real data layer is `src/data/pocketbase/**`. This module exists only
 * because five pre-006 files still import `insforge` from here and use the old
 * InsForge/Supabase query-builder dialect:
 *
 *   - src/features/manager-hub/imports/data/importsRepo.ts
 *   - src/features/manager-hub/promotions/data/promotionsRepo.ts
 *   - src/features/manager-hub/menu/data/menuRepo.ts
 *   - src/features/manager-hub/pricing/data/pricingRepo.ts
 *   - src/hooks/useUnlockState.ts
 *
 * It is backed by PocketBase (`src/data/pocketbase/legacy-insforge.ts`) and
 * resolves the legacy table names, so the app has ONE backend. Delete this whole
 * directory once those callers use the typed repositories - verify with:
 *   grep -rn "data/insforge" src lib App.tsx
 */
export { insforge, LegacyQuery } from '../pocketbase/legacy-insforge';
export { insforge as default } from '../pocketbase/legacy-insforge';
