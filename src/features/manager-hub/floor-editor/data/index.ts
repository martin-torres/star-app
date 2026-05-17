// Ownership: data layer handles persistence adapters and external CRUD I/O.
// The FloorTablesRepo and FloorPropsRepo interfaces are defined inline below
// and will be wired to InsForge repos in Phase C5.

export interface FloorTablesRepo {
  list(): Promise<FloorTableRecord[]>;
  create(table: FloorTableRecord): Promise<FloorTableRecord>;
  update(tableId: string, patch: Partial<FloorTableRecord>): Promise<FloorTableRecord>;
  remove(tableId: string): Promise<void>;
}

export interface FloorTableRecord {
  tableId: string;
  tableType: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  seatCount: number;
  chairs: Array<{ chairId: string; offsetX: number; offsetY: number; active: boolean }>;
}

export interface FloorPropsRepo {
  list(): Promise<FloorPropRecord[]>;
  create(prop: FloorPropRecord): Promise<FloorPropRecord>;
  update(propId: string, patch: Partial<FloorPropRecord>): Promise<FloorPropRecord>;
  remove(propId: string): Promise<void>;
}

export interface FloorPropRecord {
  propId: string;
  propType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}
