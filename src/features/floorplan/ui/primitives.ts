import type { CSSProperties } from "react";
import type {
  FloorPlanChair,
  FloorPlanProp,
  FloorPlanTable,
  FloorPropKind,
  TableShape,
} from "../model/floorPlan";

/**
 * The ONE set of floor-plan drawing primitives. Extracted from the manager
 * editor (previously `FloorCanvas.tsx`) so that the editor, the manager live
 * view, the customer table picker and the kitchen/FOH boards all draw identical
 * geometry. Never re-implement these per surface.
 */

/** Non-negotiable: defines what an "edit surface" can be. */
export const FLOOR_BOUNDS = { minX: 0, minY: 0, maxX: 680, maxY: 400 } as const;
export const RESIZE_LIMITS = { minWidth: 40, minHeight: 30, maxWidth: 240, maxHeight: 220 } as const;
export const GRID_SIZE = 24;

/** Ensure the canvas can always hold every object, so nothing is clipped. */
export function canvasForTables(
  soFar: { width: number; height: number },
  tables: FloorPlanTable[],
  props: Array<{ x: number; y: number; width: number; height: number }> = [],
): { width: number; height: number } {
  let width = soFar.width;
  let height = soFar.height;
  for (const t of [...tables, ...props]) {
    width = Math.max(width, Math.ceil(t.x + t.width) + 20);
    height = Math.max(height, Math.ceil(t.y + t.height) + 20);
  }
  return { width, height };
}

/**
 * The single shape -> CSS mapping. Changing this changes every screen at once,
 * which is the point.
 */
export function tableShapeStyle(shape: TableShape): CSSProperties {
  switch (shape) {
    case "circular":
      return { borderRadius: "999px" };
    case "booth":
      return { borderRadius: "14px 14px 4px 4px" };
    case "l_shaped":
      return { clipPath: "polygon(0% 0%, 100% 0%, 100% 35%, 65% 35%, 65% 100%, 0% 100%)" };
    case "square":
      return { borderRadius: 6 };
    case "rectangle":
    default:
      return { borderRadius: 10 };
  }
}

export const TABLE_ICONS: Record<TableShape, string> = {
  square: "\u25FC",
  rectangle: "\u25AD",
  circular: "\u25EF",
  booth: "\u2337",
  l_shaped: "\u2514",
};

export const PROP_ICONS: Record<FloorPropKind, string> = {
  stage: "\u25EB",
  bathroom: "\u{1F6BB}",
  staircase: "\u21C5",
  window: "\u25A3",
  main_door: "\u238B",
  door: "\u27C2",
  kitchen_area: "\u{1F37D}",
};

/**
 * The single chair-position algorithm: distribute `seatCount` chairs on the
 * rectangle perimeter, deterministically (index-derived angles, no randomness).
 */
export function chairNodesFor(tableId: string, seatCount: number): FloorPlanChair[] {
  const count = Math.max(0, Math.min(24, Math.floor(seatCount)));
  const nodes: FloorPlanChair[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (2 * Math.PI * i) / count;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absX > absY) {
      nodes.push({
        chairId: `${tableId}-AUTO-${i + 1}`,
        offsetX: x > 0 ? 0.5 : -0.5,
        offsetY: Math.max(-0.5, Math.min(0.5, y / absX / 2)),
        active: true,
      });
    } else {
      nodes.push({
        chairId: `${tableId}-AUTO-${i + 1}`,
        offsetX: Math.max(-0.5, Math.min(0.5, x / absY / 2)),
        offsetY: y > 0 ? 0.5 : -0.5,
        active: true,
      });
    }
  }
  return nodes;
}

/** Project a pointer position onto a table's perimeter (used while dragging chairs). */
export function projectChairToPerimeter(
  px: number,
  py: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const cx = width / 2;
  const cy = height / 2;
  const dx = px - cx;
  const dy = py - cy;
  const nx = dx / Math.max(width / 2, 1);
  const ny = dy / Math.max(height / 2, 1);
  const absX = Math.abs(nx);
  const absY = Math.abs(ny);

  if (absX >= absY) {
    return {
      x: nx >= 0 ? 0.5 : -0.5,
      y: Math.max(-0.5, Math.min(0.5, ny / Math.max(absX, 0.0001))),
    };
  }

  return {
    x: Math.max(-0.5, Math.min(0.5, nx / Math.max(absY, 0.0001))),
    y: ny >= 0 ? 0.5 : -0.5,
  };
}

/** Chairs to draw for a table: its own nodes, else derived from `seats`. */
export function chairsForTable(table: FloorPlanTable): FloorPlanChair[] {
  return table.chairs.length > 0 ? table.chairs : chairNodesFor(table.id, table.seats);
}

/** The grid background, identical on every surface. */
export function floorGridBackground(gridSize = GRID_SIZE): CSSProperties {
  return {
    background: `linear-gradient(0deg, rgba(243,244,246,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(243,244,246,0.55) 1px, transparent 1px)`,
    backgroundSize: `${gridSize}px ${gridSize}px`,
  };
}

export const FLOOR_CANVAS_BORDER = "1px solid #d1d5db";

export const PROP_DEFAULT_ICON = "\u25AB";

export function propIcon(prop: FloorPlanProp | { kind: FloorPropKind }): string {
  return PROP_ICONS[prop.kind] ?? PROP_DEFAULT_ICON;
}
