/**
 * Floor-plan repository: the persistence behind the ONE floor-plan formation
 * (spec 006 deliverable B).
 *
 * It stores and returns the canonical model from
 * `src/features/floorplan/model/floorPlan.ts` - imported (not duplicated) so the
 * manager editor, the customer selector and every read-only surface all agree on
 * one type and one coordinate space.
 *
 * Tables live in `restaurant_tables` (the same rows the dine-in picker reads),
 * props in `floor_props`, canvas size in `floor_plans` (one row per restaurant).
 */
import type {
  FloorPlan,
  FloorPlanCanvas,
  FloorPlanProp,
  FloorPlanTable,
  FloorPropKind,
  TableShape,
} from '../../features/floorplan/model/floorPlan';
import {
  DEFAULT_CANVAS,
  DEFAULT_PROP_SIZES,
  DEFAULT_TABLE_SIZES,
  FLOOR_PROP_KINDS,
  TABLE_SHAPES,
} from '../../features/floorplan/model/floorPlan';
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { eq } from './query';
import { firstOrNull } from './read';
import type { RawRecord } from './mappers';

// Re-export the canonical vocabulary so consumers can import the plan types from
// the data layer too (`import type { FloorPlan } from '../../data/pocketbase'`).
export type {
  FloorPlan,
  FloorPlanCanvas,
  FloorPlanProp,
  FloorPlanTable,
  FloorPropKind,
  TableShape,
} from '../../features/floorplan/model/floorPlan';

const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const asShape = (value: unknown): TableShape =>
  typeof value === 'string' && (TABLE_SHAPES as string[]).includes(value)
    ? (value as TableShape)
    : 'square';

const asPropKind = (value: unknown): FloorPropKind | null =>
  typeof value === 'string' && (FLOOR_PROP_KINDS as string[]).includes(value)
    ? (value as FloorPropKind)
    : null;

const toCanvas = (record: RawRecord | null): FloorPlanCanvas =>
  record
    ? {
        width: num(record.canvas_w, DEFAULT_CANVAS.width),
        height: num(record.canvas_h, DEFAULT_CANVAS.height),
        gridSize: num(record.grid_size, DEFAULT_CANVAS.gridSize),
      }
    : { ...DEFAULT_CANVAS };

const toPlanTable = (record: RawRecord, restaurantId: string): FloorPlanTable => {
  const shape = asShape(record.shape);
  const size = DEFAULT_TABLE_SIZES[shape];
  const tableNumber = num(record.table_number, 0);
  return {
    id: record.id,
    restaurantId,
    label: optionalString(record.display_name) ?? `Mesa ${tableNumber}`,
    tableNumber,
    seats: num(record.seats, 4),
    shape,
    x: num(record.x, 0),
    y: num(record.y, 0),
    width: num(record.width, size.width),
    height: num(record.height, size.height),
    rotation: num(record.rotation, 0),
    // Chairs are derived by `chairNodesFor()` in the shared renderer, never stored.
    chairs: [],
    isAvailable: record.is_available === undefined ? true : record.is_available === true,
    location: optionalString(record.location),
  };
};

const toPlanProp = (record: RawRecord): FloorPlanProp | null => {
  const kind = asPropKind(record.prop_type);
  if (!kind) {
    console.warn(
      `[floor-plan] Skipping floor_props row ${record.id}: unknown prop_type "${String(
        record.prop_type,
      )}"`,
    );
    return null;
  }
  const size = DEFAULT_PROP_SIZES[kind];
  return {
    id: record.id,
    kind,
    x: num(record.x, 0),
    y: num(record.y, 0),
    width: num(record.width, size.width),
    height: num(record.height, size.height),
    rotation: num(record.rotation, 0),
  };
};

const tableToDb = (
  restaurantId: string,
  table: FloorPlanTable,
): Record<string, unknown> => ({
  restaurant_id: restaurantId,
  table_number: Math.round(table.tableNumber),
  display_name: table.label,
  seats: Math.round(table.seats),
  location: table.location ?? '',
  x: Math.round(table.x),
  y: Math.round(table.y),
  width: Math.round(table.width),
  height: Math.round(table.height),
  rotation: Math.round(table.rotation),
  shape: table.shape,
  is_available: table.isAvailable,
});

const propToDb = (
  restaurantId: string,
  prop: FloorPlanProp,
): Record<string, unknown> => ({
  restaurant_id: restaurantId,
  prop_type: prop.kind,
  x: Math.round(prop.x),
  y: Math.round(prop.y),
  width: Math.round(prop.width),
  height: Math.round(prop.height),
  rotation: Math.round(prop.rotation),
});

export interface FloorPlanApi {
  /** The full formation: canvas + tables + props, ready for `FloorPlanView`. */
  getPlan(restaurantId: string): Promise<FloorPlan>;
  /** Persist a plan; returns what the database actually holds afterwards. */
  savePlan(restaurantId: string, plan: FloorPlan): Promise<FloorPlan>;
  /** Props only (the editor's prop palette). */
  listProps(restaurantId: string): Promise<FloorPlanProp[]>;
  /** Replace every prop for a restaurant. */
  saveProps(restaurantId: string, props: FloorPlanProp[]): Promise<FloorPlanProp[]>;
}

export class PocketBaseFloorPlanRepository implements FloorPlanApi {
  async getPlan(restaurantId: string): Promise<FloorPlan> {
    const [planRow, tableRows, propRows] = await Promise.all([
      firstOrNull<RawRecord>(COLLECTIONS.floorPlans, eq('restaurant_id', restaurantId)),
      pb
        .collection(COLLECTIONS.restaurantTables)
        .getFullList<RawRecord>({ filter: eq('restaurant_id', restaurantId), sort: 'table_number' }),
      pb
        .collection(COLLECTIONS.floorProps)
        .getFullList<RawRecord>({ filter: eq('restaurant_id', restaurantId), sort: 'created_at' }),
    ]);

    return {
      restaurantId,
      canvas: toCanvas(planRow),
      tables: tableRows.map((row) => toPlanTable(row, restaurantId)),
      props: propRows
        .map(toPlanProp)
        .filter((prop): prop is FloorPlanProp => prop !== null),
    };
  }

  async savePlan(restaurantId: string, plan: FloorPlan): Promise<FloorPlan> {
    await this.saveCanvas(restaurantId, plan.canvas);
    await this.saveTables(restaurantId, plan.tables);
    await this.saveProps(restaurantId, plan.props);
    return this.getPlan(restaurantId);
  }

  async listProps(restaurantId: string): Promise<FloorPlanProp[]> {
    const rows = await pb
      .collection(COLLECTIONS.floorProps)
      .getFullList<RawRecord>({ filter: eq('restaurant_id', restaurantId), sort: 'created_at' });
    return rows.map(toPlanProp).filter((prop): prop is FloorPlanProp => prop !== null);
  }

  /** Props have no natural key, so save is a replace-all for the restaurant. */
  async saveProps(restaurantId: string, props: FloorPlanProp[]): Promise<FloorPlanProp[]> {
    const existing = await pb
      .collection(COLLECTIONS.floorProps)
      .getFullList<RawRecord>({ filter: eq('restaurant_id', restaurantId) });

    for (const row of existing) {
      await pb.collection(COLLECTIONS.floorProps).delete(row.id);
    }
    for (const prop of props) {
      await pb.collection(COLLECTIONS.floorProps).create(propToDb(restaurantId, prop));
    }

    return this.listProps(restaurantId);
  }

  private async saveCanvas(restaurantId: string, canvas: FloorPlanCanvas): Promise<void> {
    const payload = {
      restaurant_id: restaurantId,
      canvas_w: Math.round(canvas.width),
      canvas_h: Math.round(canvas.height),
      grid_size: Math.round(canvas.gridSize),
    };
    const existing = await firstOrNull<RawRecord>(
      COLLECTIONS.floorPlans,
      eq('restaurant_id', restaurantId),
    );
    if (existing) {
      await pb.collection(COLLECTIONS.floorPlans).update(existing.id, payload);
    } else {
      await pb.collection(COLLECTIONS.floorPlans).create(payload);
    }
  }

  /**
   * Upsert tables by `table_number` (the unique key) and delete rows the plan no
   * longer contains, so the customer selector cannot show a table the manager
   * removed.
   */
  private async saveTables(restaurantId: string, tables: FloorPlanTable[]): Promise<void> {
    const existing = await pb
      .collection(COLLECTIONS.restaurantTables)
      .getFullList<RawRecord>({ filter: eq('restaurant_id', restaurantId) });
    const byNumber = new Map<number, RawRecord>();
    for (const row of existing) byNumber.set(num(row.table_number, 0), row);

    const kept = new Set<string>();
    for (const table of tables) {
      const payload = tableToDb(restaurantId, table);
      const match = byNumber.get(Math.round(table.tableNumber));
      if (match) {
        const updated = await pb
          .collection(COLLECTIONS.restaurantTables)
          .update<RawRecord>(match.id, payload);
        kept.add(updated.id);
      } else {
        const created = await pb
          .collection(COLLECTIONS.restaurantTables)
          .create<RawRecord>(payload);
        kept.add(created.id);
      }
    }

    for (const row of existing) {
      if (!kept.has(row.id)) {
        await pb.collection(COLLECTIONS.restaurantTables).delete(row.id);
      }
    }
  }
}

/** The single floor-plan data API consumed by `src/features/**`. */
export const floorPlanApi: FloorPlanApi = new PocketBaseFloorPlanRepository();
