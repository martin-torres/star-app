import type { ChairNode, FloorProp, FloorPropType, FloorTable, TableType } from "../domain/layoutTypes";
import { canPlaceTable } from "../domain/overlapGuards";
import { previewSeatChange, resolveAutoSeatCount } from "../domain/seatSizingRules";
import {
  clampPosition,
  clampRectToBounds,
  clampSize,
  normalizeRotation,
} from "../../../../shared/geometry/transformUtils";

export type ToolMode = "select" | "add_table" | "add_prop" | "delete" | "chair_edit";
export type ObjectType = "table" | "prop";

export interface FloorEditorStore {
  tables: FloorTable[];
  props: FloorProp[];
  selectedObjectId: string | null;
  selectedObjectType: ObjectType | null;
  toolMode: ToolMode;
}

export const initialEditorStore: FloorEditorStore = {
  tables: [],
  props: [],
  selectedObjectId: null,
  selectedObjectType: null,
  toolMode: "select",
};

function distributedPerimeterOffsets(index: number, total: number): { offsetX: number; offsetY: number } {
  if (total <= 1) return { offsetX: 0, offsetY: -0.5 };
  const angle = (2 * Math.PI * index) / total;
  const x = Math.cos(angle);
  const y = Math.sin(angle);
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  if (absX >= absY) {
    return {
      offsetX: x >= 0 ? 0.5 : -0.5,
      offsetY: Math.max(-0.5, Math.min(0.5, y / Math.max(absX, 0.0001))),
    };
  }
  return {
    offsetX: Math.max(-0.5, Math.min(0.5, x / Math.max(absY, 0.0001))),
    offsetY: y >= 0 ? 0.5 : -0.5,
  };
}

function redistributeChairs(chairs: ChairNode[]): ChairNode[] {
  return chairs.map((chair, index) => {
    const next = distributedPerimeterOffsets(index, chairs.length);
    return { ...chair, ...next };
  });
}

export function setToolMode(store: FloorEditorStore, toolMode: ToolMode): FloorEditorStore {
  return { ...store, toolMode };
}

export function selectObject(
  store: FloorEditorStore,
  objectType: ObjectType | null,
  objectId: string | null,
): FloorEditorStore {
  return {
    ...store,
    selectedObjectType: objectType,
    selectedObjectId: objectId,
  };
}

export function upsertTable(store: FloorEditorStore, table: FloorTable): FloorEditorStore {
  const exists = store.tables.some((item) => item.tableId === table.tableId);
  return {
    ...store,
    tables: exists
      ? store.tables.map((item) => (item.tableId === table.tableId ? table : item))
      : [...store.tables, table],
  };
}

export function removeTable(store: FloorEditorStore, tableId: string): FloorEditorStore {
  return {
    ...store,
    tables: store.tables.filter((table) => table.tableId !== tableId),
    selectedObjectId: store.selectedObjectId === tableId ? null : store.selectedObjectId,
    selectedObjectType: store.selectedObjectId === tableId ? null : store.selectedObjectType,
  };
}

export function upsertProp(store: FloorEditorStore, prop: FloorProp): FloorEditorStore {
  const exists = store.props.some((item) => item.propId === prop.propId);
  return {
    ...store,
    props: exists
      ? store.props.map((item) => (item.propId === prop.propId ? prop : item))
      : [...store.props, prop],
  };
}

export function removeProp(store: FloorEditorStore, propId: string): FloorEditorStore {
  return {
    ...store,
    props: store.props.filter((prop) => prop.propId !== propId),
    selectedObjectId: store.selectedObjectId === propId ? null : store.selectedObjectId,
    selectedObjectType: store.selectedObjectId === propId ? null : store.selectedObjectType,
  };
}

export function addTableAt(
  store: FloorEditorStore,
  table: Omit<FloorTable, "x" | "y" | "updatedAt">,
  x: number,
  y: number,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): FloorEditorStore {
  const clamped = clampPosition(x, y, bounds);
  const candidate: FloorTable = {
    ...table,
    x: clamped.x,
    y: clamped.y,
    updatedAt: new Date().toISOString(),
  };
  if (!canPlaceTable(candidate, store.tables)) return store;
  return selectObject(upsertTable(store, candidate), "table", candidate.tableId);
}

export function addPropAt(
  store: FloorEditorStore,
  propType: FloorPropType,
  x: number,
  y: number,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): FloorEditorStore {
  const clamped = clampPosition(x, y, bounds);
  const propId = `P${store.props.length + 1}`;
  const isFixedWidthOpening = propType === "door" || propType === "main_door" || propType === "window";
  const candidate: FloorProp = {
    propId,
    propType,
    x: clamped.x,
    y: clamped.y,
    width: isFixedWidthOpening ? 10 : 120,
    height: isFixedWidthOpening ? 80 : 80,
    rotation: 0,
    updatedAt: new Date().toISOString(),
  };
  return selectObject(upsertProp(store, candidate), "prop", propId);
}

export function moveTable(
  store: FloorEditorStore,
  tableId: string,
  x: number,
  y: number,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): FloorEditorStore {
  const current = store.tables.find((table) => table.tableId === tableId);
  if (!current) return store;
  const clamped = clampPosition(x, y, bounds);
  const candidate = {
    ...current,
    x: clamped.x,
    y: clamped.y,
    updatedAt: new Date().toISOString(),
  };
  if (!canPlaceTable(candidate, store.tables)) return store;
  return { ...store, tables: store.tables.map((t) => (t.tableId === tableId ? candidate : t)) };
}

export function moveProp(
  store: FloorEditorStore,
  propId: string,
  x: number,
  y: number,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): FloorEditorStore {
  const current = store.props.find((prop) => prop.propId === propId);
  if (!current) return store;
  const clamped = clampPosition(x, y, bounds);
  return {
    ...store,
    props: store.props.map((p) => (p.propId === propId ? { ...p, x: clamped.x, y: clamped.y, updatedAt: new Date().toISOString() } : p)),
  };
}

export function resizeTable(
  store: FloorEditorStore,
  tableId: string,
  w: number,
  h: number,
  limits: { minWidth: number; minHeight: number; maxWidth: number; maxHeight: number },
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): FloorEditorStore {
  const current = store.tables.find((table) => table.tableId === tableId);
  if (!current) return store;
  const clamped = clampSize(w, h, limits);
  const seatCount = current.seatOverride ? current.seatCount : resolveAutoSeatCount(clamped.width, clamped.height);
  const updated = {
    ...current,
    ...clamped,
    seatCount,
    chairs: current.seatOverride ? current.chairs : redistributeChairs(current.chairs.map((chair, idx) => ({ ...chair, ...distributedPerimeterOffsets(idx, seatCount) }))),
    updatedAt: new Date().toISOString(),
  };
  const clampedRect = clampRectToBounds(updated, bounds);
  return { ...store, tables: store.tables.map((t) => (t.tableId === tableId ? { ...updated, ...clampedRect } : t)) };
}

export function resizeProp(
  store: FloorEditorStore,
  propId: string,
  w: number,
  h: number,
  limits: { minWidth: number; minHeight: number; maxWidth: number; maxHeight: number },
): FloorEditorStore {
  const current = store.props.find((prop) => prop.propId === propId);
  if (!current) return store;
  const clamped = clampSize(w, h, limits);
  return {
    ...store,
    props: store.props.map((p) => (p.propId === propId ? { ...p, ...clamped, updatedAt: new Date().toISOString() } : p)),
  };
}

export function rotateTable(store: FloorEditorStore, tableId: string, degrees: number): FloorEditorStore {
  return {
    ...store,
    tables: store.tables.map((t) => (t.tableId === tableId ? { ...t, rotation: normalizeRotation(degrees), updatedAt: new Date().toISOString() } : t)),
  };
}

export function rotateProp(store: FloorEditorStore, propId: string, degrees: number): FloorEditorStore {
  return {
    ...store,
    props: store.props.map((p) => (p.propId === propId ? { ...p, rotation: normalizeRotation(degrees), updatedAt: new Date().toISOString() } : p)),
  };
}

export function addChair(store: FloorEditorStore, tableId: string): FloorEditorStore {
  return {
    ...store,
    tables: store.tables.map((t) => {
      if (t.tableId !== tableId) return t;
      const chairs = [...t.chairs, {
        chairId: `${tableId}-C${t.chairs.length + 1}`,
        tableId,
        offsetX: 0.5,
        offsetY: 0.5,
        active: true,
      }];
      return { ...t, chairs: redistributeChairs(chairs), seatCount: chairs.length, seatOverride: true };
    }),
  };
}

export function removeChair(store: FloorEditorStore, tableId: string, chairId: string): FloorEditorStore {
  return {
    ...store,
    tables: store.tables.map((t) => {
      if (t.tableId !== tableId) return t;
      const chairs = t.chairs.filter((c) => c.chairId !== chairId);
      return { ...t, chairs: redistributeChairs(chairs), seatCount: chairs.length, seatOverride: true };
    }),
  };
}

export function moveChair(
  store: FloorEditorStore,
  tableId: string,
  chairId: string,
  offsetX: number,
  offsetY: number,
): FloorEditorStore {
  return {
    ...store,
    tables: store.tables.map((t) => {
      if (t.tableId !== tableId) return t;
      return {
        ...t,
        chairs: t.chairs.map((c) => (c.chairId === chairId ? { ...c, offsetX, offsetY } : c)),
        seatOverride: true,
      };
    }),
  };
}
