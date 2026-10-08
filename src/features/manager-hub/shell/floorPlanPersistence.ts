import type { FloorEditorStore } from "../floor-editor/state/editorStore";
import { initialEditorStore } from "../floor-editor/state/editorStore";
import { floorPlanFromStore, storeFromFloorPlan } from "../floor-editor/state/planAdapter";
import { floorPlanApi } from "../../../../lib/pocketbase";

/**
 * Floor-plan persistence.
 *
 * The DATABASE is the source of truth (`floor_plans` + `restaurant_tables` +
 * `floor_props` via `floorPlanApi`), so the customer picker and every live board
 * render exactly what the manager saved. localStorage is kept only as an
 * instant-draft cache so a reload during a network hiccup does not lose edits.
 *
 * Before spec 006 this was localStorage-only, which is why the manager's layout
 * never reached the customer.
 */

const STORAGE_KEY = "manager-hub.floor-plan.store";

export function saveFloorPlanStore(store: FloorEditorStore): void {
  const ls = globalThis.localStorage;
  if (!ls) return;
  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode — the database copy is what matters */
  }
}

export function loadFloorPlanStore(): FloorEditorStore | null {
  const ls = globalThis.localStorage;
  if (!ls) return null;
  const raw = ls.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FloorEditorStore;
  } catch {
    return null;
  }
}

/** Load the saved plan for a restaurant into editor-store shape. */
export async function loadFloorPlanFromDb(
  restaurantId: string,
): Promise<FloorEditorStore | null> {
  if (!restaurantId) return null;
  const plan = await floorPlanApi.getPlan(restaurantId);
  if (!plan || plan.tables.length === 0) return null;
  return storeFromFloorPlan(plan, initialEditorStore);
}

/** Persist the editor store as the canonical plan for a restaurant. */
export async function saveFloorPlanToDb(
  restaurantId: string,
  store: FloorEditorStore,
): Promise<void> {
  if (!restaurantId) return;
  await floorPlanApi.savePlan(restaurantId, floorPlanFromStore(store, restaurantId));
}
