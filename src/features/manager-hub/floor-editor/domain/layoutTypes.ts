export type FloorPropType =
  | "stage"
  | "bathroom"
  | "staircase"
  | "window"
  | "main_door"
  | "door"
  | "kitchen_area";

export type TableType = "square" | "rectangle" | "circular" | "booth" | "l_shaped";

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
