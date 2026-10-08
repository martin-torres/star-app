# Trash — unused / superseded files

Moved here during the PocketBase backend cleanup. These are **not imported** by the live app path (`index.tsx` → `App.tsx` → `src/features/**` + `src/data/pocketbase/**` + `db/pocketbase/**`).

| Path | Why it was moved |
|------|------------------|
| `migrations/` | Old Supabase/Postgres SQL (RLS, realtime). Not used by PocketBase. |
| `pb_migrations/` | Abandoned root PocketBase migrations (create/delete churn + test collections). |
| `pocketbase/pb_migrations/` | Older camelCase experimental migrations. Canonical schema is `db/pocketbase/`. |
| `pocketbase/pb_migrations_deprecated/` | Explicitly deprecated Stage-4 snapshots. |
| `pocketbase-schema.json` | Stale JSON schema; superseded by `db/pocketbase/schema.py`. |
| `schema.sql` | Postgres dump of an older shape. |
| `Images/` | Old unused branding assets (not linked from the live restaurant). |
| `scripts/` (InsForge-era seeds/fixers) | Pointed at the old backend; live seed/deploy is `db/pocketbase/`. |
| `ProjectV3Cont` | Orphan planning blob. |
| Stale docs listed below | Describe InsForge or deleted migration layouts. |

Do **not** import from this folder. Safe to delete after a release confirms nothing still needs a reference.
