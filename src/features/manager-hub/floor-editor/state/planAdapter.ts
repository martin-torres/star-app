/**
 * Bridge between the editor's working store (`FloorEditorStore`) and the
 * canonical `FloorPlan`. One direction feeds the shared renderer; the other
 * lets a plan loaded from the database populate the editor.
 */
import {
  DEFAULT_CANVAS,
  DEFAULT_PROP_SIZES,
  DEFAULT_TABLE_SIZES,
  type FloorPlan,
  type FloorPlanProp,
  type FloorPlanTable,
} from "../../../floorplan/model/floorPlan";
import { chairNodesFor } from "../../../floorplan/ui/primitives";
import type { FloorEditorStore } from "./editorStore";
import type { FloorProp, FloorTable } from "../domain/layoutTypes";

/** Editor store -> the canonical plan (used by every read-only surface). */
export function floorPlanFromStore(store: FloorEditorStore, restaurantId = ""): FloorPlan {
  const tables: FloorPlanTable[] = store.tables.map((table, index) => ({
    id: table.tableId,
    restaurantId,
    label: table.label || `Mesa ${index + 1}`,
    tableNumber: index + 1,
    seats: table.seatCount,
    shape: table.tableType,
    x: table.x,
    y: table.y,
    width: table.width,
    height: table.height,
    rotation: table.rotation,
    chairs:
      table.chairs.length > 0
        ? table.chairs
        : chairNodesFor(table.tableId, table.seatCount),
    isAvailable: true,
  }));

  const props: FloorPlanProp[] = store.props.map((prop) => ({
    id: prop.propId,
    kind: prop.propType,
    x: prop.x,
    y: prop.y,
    width: prop.width,
    height: prop.height,
    rotation: prop.rotation,
  }));

  return { restaurantId, canvas: { ...DEFAULT_CANVAS }, tables, props };
}

/** Canonical plan -> editor store (used when a plan arrives from the database). */
export function storeFromFloorPlan(
  plan: FloorPlan,
  base: FloorEditorStore,
): FloorEditorStore {
  const tables: FloorTable[] = plan.tables.map((table) => ({
    tableId: table.id,
    tableType: table.shape,
    label: table.label,
    x: table.x,
    y: table.y,
    width: table.width || DEFAULT_TABLE_SIZES[table.shape].width,
    height: table.height || DEFAULT_TABLE_SIZES[table.shape].height,
    rotation: table.rotation,
    seatCount: table.seats,
    seatOverride: table.chairs.length > 0,
    chairs: table.chairs.map((chair) => ({
      chairId: chair.chairId,
      tableId: table.id,
      offsetX: chair.offsetX,
      offsetY: chair.offsetY,
      active: chair.active,
    })),
    updatedAt: new Date().toISOString(),
  }));

  const props: FloorProp[] = plan.props.map((prop) => ({
    propId: prop.id,
    propType: prop.kind,
    x: prop.x,
    y: prop.y,
    width: prop.width || DEFAULT_PROP_SIZES[prop.kind].width,
    height: prop.height || DEFAULT_PROP_SIZES[prop.kind].height,
    rotation: prop.rotation,
    updatedAt: new Date().toISOString(),
  }));

  return { ...base, tables, props, selectedObjectId: null, selectedObjectType: null };
}
