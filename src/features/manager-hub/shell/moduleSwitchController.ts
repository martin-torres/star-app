import type { FloorEditorStore } from "../floor-editor/state/editorStore";
import type { ManagerModuleRoute } from "./managerTypes";

export interface FloorPlanAutosaveAdapter {
  saveFloorPlan(nextStore: FloorEditorStore): Promise<void>;
}

export async function switchManagerModule(
  current: ManagerModuleRoute,
  target: ManagerModuleRoute,
  floorStore: FloorEditorStore,
  autosave: FloorPlanAutosaveAdapter,
): Promise<ManagerModuleRoute> {
  if (current === target) return current;
  if (current === "floor-plan" && target !== "floor-plan") {
    await autosave.saveFloorPlan(floorStore);
  }
  return target;
}
