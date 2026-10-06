/**
 * Editor domain types.
 *
 * `TableType` and `FloorPropType` are ALIASES of the canonical floor-plan
 * vocabulary in `src/features/floorplan/model/floorPlan.ts`. Do not redeclare the
 * unions here — a second definition is exactly how the editor and the customer
 * view drifted apart before.
 */
import type { FloorPropKind, TableShape } from "../../../floorplan/model/floorPlan";

export type TableType = TableShape;
export type FloorPropType = FloorPropKind;

export interface ChairNode {
  chairId: string;
  tableId: string;
  offsetX: number;
  offsetY: number;
  active: boolean;
}

export interface FloorTable {
  tableId: string;
  tableType: TableType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  seatCount: number;
  seatOverride: boolean;
  chairs: ChairNode[];
  updatedAt: string;
}

export interface FloorProp {
  propId: string;
  propType: FloorPropType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  updatedAt: string;
}

export interface EditorBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ResizeLimits {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}
