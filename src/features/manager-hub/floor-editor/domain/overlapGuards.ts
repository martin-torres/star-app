import type { FloorTable } from "./layoutTypes";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function hasTableOverlap(candidate: FloorTable, existingTables: FloorTable[]): boolean {
  const rect: Rect = {
    x: candidate.x,
    y: candidate.y,
    width: candidate.width,
    height: candidate.height,
  };

  return existingTables.some((table) => {
    if (table.tableId === candidate.tableId) {
      return false;
    }

    return intersects(rect, {
      x: table.x,
      y: table.y,
      width: table.width,
      height: table.height,
    });
  });
}

export function canPlaceTable(candidate: FloorTable, existingTables: FloorTable[]): boolean {
  return !hasTableOverlap(candidate, existingTables);
}
