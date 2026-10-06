/**
 * The PocketBase client for star-app.
 *
 * This is the ONLY place the app talks to the network backend. Everything else
 * in `src/data/pocketbase/**` is a repository over this client.
 *
 * Env: `VITE_POCKETBASE_URL` (Vite inlines it into the bundle - that is fine,
 * the URL is public information; access is controlled by per-collection API
 * rules, there is no anon key).
 */
import PocketBase from 'pocketbase';

export const DEFAULT_POCKETBASE_URL = 'http://127.0.0.1:8096';

const configuredUrl = (import.meta.env.VITE_POCKETBASE_URL as string | undefined)?.trim();

/** Trailing slashes break `new PocketBase(url)`; normalise once. */
export const POCKETBASE_URL = (configuredUrl || DEFAULT_POCKETBASE_URL).replace(/\/+$/, '');

export const pb = new PocketBase(POCKETBASE_URL);

/**
 * PocketBase's SDK auto-cancels an in-flight request on the same collection when
 * a new one starts (a dashboard firing two list queries, or a list plus a
 * realtime subscribe). That silently drops responses, so turn it off - every
 * repository here issues independent queries.
 */
pb.autoCancellation(false);

export { PocketBase };

/**
 * @deprecated Compatibility export for pre-migration code
 * (`src/features/admin/adminApi.ts` imports `{ insforge }` from this module).
 * It is a PocketBase-backed facade with the old InsForge query-builder shape;
 * prefer `pb` or the typed repositories. Remove once features migrate.
 */
export { insforge } from './legacy-insforge';

export default pb;
