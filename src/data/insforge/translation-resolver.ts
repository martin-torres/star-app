/**
 * Re-export bridge — the translation-resolver implementation already uses
 * @insforge/sdk internally (via ./client which is src/data/pocketbase/client.ts).
 *
 * Re-exporting from here so src/data/insforge/ is the canonical data layer
 * path and the old src/data/pocketbase/ can be deprecated.
 */
export { getTranslationResolver, TranslationResolver } from '../pocketbase/translation-resolver';
