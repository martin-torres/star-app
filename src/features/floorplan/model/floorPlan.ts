/**
 * The ONE floor-plan model. Every screen that shows a floor plan, a table map,
 * or a layout renders from this type, through `FloorPlanView`.
 *
 * Geometry contract (do not fork it):
 *   - one coordinate space: 0..canvas.width x 0..canvas.height, origin top-left, px
 *   - one shape vocabulary (`TableShape`) shared with the editor
 *   - one chair-positioning algorithm (see ui/primitives.ts)
 *   - one colour vocabulary (TableStatus -> STATUS_COLOR_TOKENS)
 *
 * If a surface needs something this model cannot express, extend the model, not
 * the surface.
 */

export type TableShape = "square" | "rectangle" | "circular" | "booth" | "l_shaped";

/** Alias used by the editor domain; kept identical on purpose (one vocabulary). */
export type TableType = TableShape;

export type FloorPropKind =
  | "stage"
  | "bathroom"
  | "staircase"
  | "window"
  | "main_door"
  | "door"
  | "kitchen_area";

export interface FloorPlanChair {
  chairId: string;
  /** -0.5..0.5 relative to the table box; (0,0) is the centre. */
  offsetX: number;
  offsetY: number;
  active: boolean;
}

export interface FloorPlanTable {
  /** Stable identity across DB rows and editor sessions ("T1" or a record id). */
  id: string;
  restaurantId?: string;
  label: string;
  tableNumber: number;
  seats: number;
  shape: TableShape;
  x: number;
  y: number;
  width: number;
  height: number;
  /** degrees, clockwise */
  rotation: number;
  chairs: FloorPlanChair[];
  isAvailable: boolean;
  /** Optional zone label ("patio", "bar", ...), for filtering surfaces. */
  location?: string;
}

export interface FloorPlanProp {
  id: string;
  kind: FloorPropKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface FloorPlanCanvas {
  width: number;
  height: number;
  gridSize: number;
}

export interface FloorPlan {
  restaurantId: string;
  canvas: FloorPlanCanvas;
  tables: FloorPlanTable[];
  props: FloorPlanProp[];
}

/** Default canvas — matches the editor's historical 680x400 working area. */
export const DEFAULT_CANVAS: FloorPlanCanvas = { width: 680, height: 400, gridSize: 24 };

export const DEFAULT_TABLE_SIZES: Record<TableShape, { width: number; height: number }> = {
  square: { width: 84, height: 84 },
  rectangle: { width: 96, height: 64 },
  circular: { width: 88, height: 88 },
  booth: { width: 96, height: 64 },
  l_shaped: { width: 96, height: 64 },
};

export const DEFAULT_PROP_SIZES: Record<FloorPropKind, { width: number; height: number }> = {
  stage: { width: 120, height: 60 },
  bathroom: { width: 70, height: 70 },
  staircase: { width: 70, height: 70 },
  window: { width: 90, height: 20 },
  main_door: { width: 70, height: 20 },
  door: { width: 50, height: 20 },
  kitchen_area: { width: 140, height: 80 },
};

export const TABLE_SHAPES: TableShape[] = ["square", "rectangle", "circular", "booth", "l_shaped"];

export const FLOOR_PROP_KINDS: FloorPropKind[] = [
  "stage",
  "bathroom",
  "staircase",
  "window",
  "main_door",
  "door",
  "kitchen_area",
];

/** An empty plan, used as a safe default before data arrives. */
export function emptyFloorPlan(restaurantId = ""): FloorPlan {
  return { restaurantId, canvas: { ...DEFAULT_CANVAS }, tables: [], props: [] };
}

/**
 * Derive a plan from flat table rows when no editor plan exists yet: places
 * tables on a deterministic grid (never random), preserving any x/y present.
 */
export function floorPlanFromTables(
  rows: Array<Partial<FloorPlanTable> & { id: string }>,
  options: { restaurantId?: string; props?: FloorPlanProp[]; canvas?: FloorPlanCanvas } = {},
): FloorPlan {
  const canvas = options.canvas ?? { ...DEFAULT_CANVAS };
  const cols = Math.max(1, Math.floor((canvas.width - 40) / 140));

  const tables: FloorPlanTable[] = rows.map((row, index) => {
    const shape = row.shape ?? "square";
    const size = DEFAULT_TABLE_SIZES[shape];
    const hasPosition = typeof row.x === "number" && typeof row.y === "number";
    const col = index % cols;
    const line = Math.floor(index / cols);
    return {
      id: row.id,
      restaurantId: row.restaurantId ?? options.restaurantId,
      label: row.label ?? `Mesa ${row.tableNumber ?? index + 1}`,
      tableNumber: row.tableNumber ?? index + 1,
      seats: row.seats ?? 4,
      shape,
      x: hasPosition ? (row.x as number) : 20 + col * 140,
      y: hasPosition ? (row.y as number) : 20 + line * 130,
      width: row.width ?? size.width,
      height: row.height ?? size.height,
      rotation: row.rotation ?? 0,
      chairs: row.chairs ?? [],
      isAvailable: row.isAvailable ?? true,
      location: row.location,
    };
  });

  return { restaurantId: options.restaurantId ?? "", canvas, tables, props: options.props ?? [] };
}

/** Build a lookup so status resolution never indexes the array per table. */
export function indexTablesById(plan: FloorPlan): Map<string, FloorPlanTable> {
  return new Map(plan.tables.map((table) => [table.id, table]));
}
