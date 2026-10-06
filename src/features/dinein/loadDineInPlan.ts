import type { RestaurantTable } from "../../core/types";
import {
  DEFAULT_TABLE_SIZES,
  emptyFloorPlan,
  type FloorPlan,
  type FloorPlanTable,
} from "../floorplan/model/floorPlan";
import { chairNodesFor } from "../floorplan/ui/primitives";
import { tablesApi } from "../../../lib/pocketbase";

/**
 * Map DB table rows to the canonical floor-plan model.
 *
 * Rows written by the manager editor carry x/y/width/height/rotation/shape;
 * legacy rows carry only x/y (or nothing). Missing geometry is filled with the
 * deterministic default for the shape — never a random position.
 */
export function planTablesFromRows(rows: RestaurantTable[], restaurantId: string): FloorPlanTable[] {
  const ordered = [...rows].sort((a, b) => a.table_number - b.table_number);
  const cols = 4;

  return ordered.map((row, index) => {
    const shape = row.shape ?? "square";
    const size = DEFAULT_TABLE_SIZES[shape];
    const hasPosition = typeof row.x === "number" && typeof row.y === "number";
    const width = row.width ?? size.width;
    const height = row.height ?? size.height;
    const id = row.id;

    return {
      id,
      restaurantId,
      label: row.display_name?.trim() || `Mesa ${row.table_number}`,
      tableNumber: row.table_number,
      seats: row.seats,
      shape,
      x: hasPosition ? (row.x as number) : 20 + (index % cols) * 150,
      y: hasPosition ? (row.y as number) : 20 + Math.floor(index / cols) * 140,
      width,
      height,
      rotation: row.rotation ?? 0,
      chairs: chairNodesFor(id, row.seats),
      isAvailable: row.is_available,
      location: row.location,
    };
  });
}

/**
 * Load the floor plan a customer should see. Uses the manager-saved plan when
 * one exists (identical formation to the editor), and falls back to the table
 * rows so the picker never renders empty.
 */
export async function loadDineInPlan(restaurantId: string): Promise<FloorPlan> {
  const tables = await tablesApi.getAll(restaurantId);
  return {
    ...emptyFloorPlan(restaurantId),
    tables: planTablesFromRows(tables, restaurantId),
  };
}
