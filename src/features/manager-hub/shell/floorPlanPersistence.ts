import type { FloorEditorStore } from "../floor-editor/state/editorStore";

const STORAGE_KEY = "manager-hub.floor-plan.store";

export function saveFloorPlanStore(store: FloorEditorStore): void {
  const ls = globalThis.localStorage;
  if (!ls) return;
  ls.setItem(STORAGE_KEY, JSON.stringify(store));
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
