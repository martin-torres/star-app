export { FloorPlanView } from "./ui/FloorPlanView";
export type { FloorPlanMode, FloorPlanViewProps } from "./ui/FloorPlanView";
export { FloorPlanLegend } from "./ui/FloorPlanLegend";
export type { FloorPlanLegendProps } from "./ui/FloorPlanLegend";

export {
  DEFAULT_CANVAS,
  DEFAULT_PROP_SIZES,
  DEFAULT_TABLE_SIZES,
  FLOOR_PROP_KINDS,
  TABLE_SHAPES,
  emptyFloorPlan,
  floorPlanFromTables,
  indexTablesById,
} from "./model/floorPlan";
export type {
  FloorPlan,
  FloorPlanCanvas,
  FloorPlanChair,
  FloorPlanProp,
  FloorPlanTable,
  FloorPropKind,
  TableShape,
  TableType,
} from "./model/floorPlan";

export { ChairDots, TableBody } from "./ui/TableBody";
export type { ChairDotsProps, TableBodyProps } from "./ui/TableBody";

export {
  FLOOR_BOUNDS,
  GRID_SIZE,
  PROP_ICONS,
  RESIZE_LIMITS,
  TABLE_ICONS,
  chairNodesFor,
  chairsForTable,
  floorGridBackground,
  propIcon,
  projectChairToPerimeter,
  tableShapeStyle,
} from "./ui/primitives";

export * from "./status";
