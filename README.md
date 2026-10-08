# El Arrocito / Star Multi-Tenant Restaurant App

React + Vite PWA with a **PocketBase** backend. The manager center screen is the floor-plan hub (left rail + live 2D salon). Customer flows cover to-go checkout and dine-in (QR → table → order → kitchen → pay).

## Stack

- Frontend: React 19 + Vite + Tailwind
- Backend: PocketBase (`db/pocketbase/` — schema, hooks, deploy)
- Data layer: `src/data/pocketbase/**` (canonical). Do not use `trash/`.

## Run locally

1. `npm install`
2. Start PocketBase (see `db/pocketbase/deploy.sh` / `.env.example`):
   - Default client URL: `http://127.0.0.1:8096`
   - `VITE_POCKETBASE_URL=http://127.0.0.1:8096`
3. `npm run dev`

## Modes (URL)

| URL | Screen |
|-----|--------|
| `/?restaurant_id=<id-or-slug>` | Customer (to-go or dine-in from settings) |
| `/?mode=admin` | Kitchen |
| `/?mode=data` | Analytics |
| `/?mode=dashboard` | Manager hub (floor plan center) |

## Payment methods

Orders store `payment_method` as:

- `efectivo` — cash
- `tarjeta` — credit/debit card
- `telefono` — phone wallet / installed payment apps
- `transferencia` — bank transfer (starts as `pendiente_pago` until kitchen confirms)

## Order → kitchen → payment

1. **To-go:** Menu → Checkout → create order (`recibido`, or `pendiente_pago` for transfer) → Kitchen advances status → Tracking.
2. **Dine-in:** QR → table → Menu → **Enviar a Cocina** → Kitchen cooks → **Solicitar Cuenta** → pay with cash/card/phone → bill marked paid.

## Trash

Unused / superseded files (old Supabase SQL, abandoned migrations, InsForge scripts, stale docs) live in `trash/`. See `trash/README.md`.
