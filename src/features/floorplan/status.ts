/**
 * Barrel so every floor-plan consumer has ONE import path for status/colour
 * semantics, regardless of where the implementation physically lives today.
 */
export * from "../manager-hub/floorplan/domain/statusTypes";
export * from "../manager-hub/floorplan/presentation/tableVisualState";
export * from "../manager-hub/floorplan/presentation/tableColorMap";
export * from "../manager-hub/floorplan/domain/statusPriority";
