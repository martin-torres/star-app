/**
 * @deprecated PocketBase-backed compatibility facade with the InsForge/Supabase
 * query-builder shape (`.from(x).select().eq().order()` -> `{ data, error }`).
 *
 * WHY IT EXISTS: six pre-migration feature files still import `insforge` and use
 * that dialect (`src/features/admin/adminApi.ts`, the manager-hub repos,
 * `src/hooks/useUnlockState.ts`). They are owned by the floor-plan/app agent, so
 * this shim keeps the app on ONE backend (PocketBase) without editing them.
 *
 * It also resolves the legacy table-name drift from review
 * `database-reviewer.md` §2.2 (`tables` -> `restaurant_tables`,
 * `restaurant_configs` -> `restaurant_settings`).
 *
 * MIGRATION: replace each caller with the typed repository in this folder, then
 * delete this file and `src/data/insforge/client.ts`.
 */
import type { RecordListOptions } from 'pocketbase';
import { pb } from './client';
import { resolveCollectionName } from './collections';
import { and, eq as eqFilter, neq as neqFilter, oneOf, orderBy, pbLiteral, sortBy } from './query';
import { isNotFound } from './read';

type DbResult<T = any> = { data: T; error: any };

type Op =
  | { kind: 'select'; columns: string[] | null }
  | { kind: 'insert'; rows: Array<Record<string, unknown>> }
  | { kind: 'update'; patch: Record<string, unknown> }
  | { kind: 'upsert'; rows: Array<Record<string, unknown>> }
  | { kind: 'delete' };

interface OrderClause {
  field: string;
  ascending: boolean;
}

type RawRecord = Record<string, unknown> & { id: string };

/** `("a","b")` (the InsForge spelling) or a real array -> `["a","b"]`. */
const parseInValues = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const inner = value.trim().replace(/^\(/, '').replace(/\)$/, '');
    return inner
      .split(',')
      .map((entry) => entry.trim().replace(/^["']/, '').replace(/["']$/, ''))
      .filter((entry) => entry.length > 0);
  }
  return [];
};

const notOneOf = (field: string, values: readonly unknown[]): string =>
  values.length === 0 ? '1 = 1' : `(${values.map((v) => `${field} != ${pbLiteral(v)}`).join(' && ')})`;

const notFoundError = (): Error =>
  Object.assign(new Error('The requested record was not found.'), { status: 404 });

/**
 * A thenable query builder. `await` on it returns the InsForge-style
 * `{ data, error }` envelope, so existing call sites keep working unchanged.
 */
export class LegacyQuery implements PromiseLike<DbResult<unknown>> {
  private readonly collection: string;
  private op: Op = { kind: 'select', columns: null };
  private conditions: string[] = [];
  private orders: OrderClause[] = [];
  private limitCount: number | null = null;
  private wantSelect = false;
  private singleMode = false;
  private maybeSingleMode = false;
  private idEquals: string | null = null;

  constructor(collection: string) {
    this.collection = resolveCollectionName(collection);
  }

  select(columns?: string): this {
    if (this.op.kind === 'select') {
      const trimmed = (columns ?? '').trim();
      const parsed =
        trimmed && trimmed !== '*'
          ? trimmed.split(',').map((c) => c.trim()).filter((c) => c.length > 0)
          : null;
      this.op = { kind: 'select', columns: parsed };
    } else {
      this.wantSelect = true;
    }
    return this;
  }

  insert(rows: Record<string, unknown> | Array<Record<string, unknown>>): this {
    this.op = { kind: 'insert', rows: Array.isArray(rows) ? rows : [rows] };
    return this;
  }

  update(patch: Record<string, unknown>): this {
    this.op = { kind: 'update', patch };
    return this;
  }

  upsert(rows: Record<string, unknown> | Array<Record<string, unknown>>): this {
    this.op = { kind: 'upsert', rows: Array.isArray(rows) ? rows : [rows] };
    return this;
  }

  delete(): this {
    this.op = { kind: 'delete' };
    return this;
  }

  eq(field: string, value: unknown): this {
    if (field === 'id' && typeof value === 'string') this.idEquals = value;
    this.conditions.push(eqFilter(field, value));
    return this;
  }

  neq(field: string, value: unknown): this {
    this.conditions.push(neqFilter(field, value));
    return this;
  }

  not(field: string, operator: string, value: unknown): this {
    if (operator === 'is' && value === null) {
      this.conditions.push(`${field} != null`);
    } else if (operator === 'in') {
      this.conditions.push(notOneOf(field, parseInValues(value)));
    } else {
      this.conditions.push(`${field} != ${pbLiteral(value)}`);
    }
    return this;
  }

  in(field: string, value: unknown): this {
    this.conditions.push(oneOf(field, parseInValues(value)));
    return this;
  }

  order(field: string, direction?: { ascending?: boolean }): this {
    this.orders.push({ field, ascending: direction?.ascending !== false });
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  single(): this {
    this.singleMode = true;
    this.wantSelect = true;
    return this;
  }

  maybeSingle(): this {
    this.maybeSingleMode = true;
    this.wantSelect = true;
    return this;
  }

  then<TResult1 = DbResult<any>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<any>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }

  // ── internals ─────────────────────────────────────────────────────────────

  private filter(): string {
    return and(...this.conditions);
  }

  private sortValue(): string {
    return sortBy(...this.orders.map((o) => orderBy(o.field, { ascending: o.ascending })));
  }

  private listOptions(): RecordListOptions {
    const options: RecordListOptions = {};
    const filter = this.filter();
    if (filter) options.filter = filter;
    const sort = this.sortValue();
    if (sort) options.sort = sort;
    return options;
  }

  private project(record: RawRecord): Record<string, unknown> {
    if (this.op.kind !== 'select' || !this.op.columns) return record;
    const projected: Record<string, unknown> = { id: record.id };
    for (const column of this.op.columns) projected[column] = record[column];
    return projected;
  }

  private async firstRecord(): Promise<RawRecord | null> {
    const filter = this.filter();
    const options = this.listOptions();
    if (filter) {
      try {
        return await pb.collection(this.collection).getFirstListItem<RawRecord>(filter, options);
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    }
    const result = await pb
      .collection(this.collection)
      .getList<RawRecord>(1, 1, { sort: options.sort });
    return result.items[0] ?? null;
  }

  private async targetIds(): Promise<string[]> {
    if (this.idEquals) return [this.idEquals];
    const filter = this.filter();
    if (!filter) throw new Error('Refusing a bulk write without a filter');
    const records = await pb.collection(this.collection).getFullList<RawRecord>({ filter });
    return records.map((record) => record.id);
  }

  private writeResult(records: Array<Record<string, unknown>>): unknown {
    if (this.singleMode) return records[0] ?? null;
    if (this.wantSelect) return records;
    return null;
  }

  private async runSelect(): Promise<unknown> {
    if (this.singleMode) {
      if (this.idEquals) {
        return this.project(await pb.collection(this.collection).getOne<RawRecord>(this.idEquals));
      }
      const record = await this.firstRecord();
      if (!record) throw notFoundError();
      return this.project(record);
    }

    if (this.maybeSingleMode) {
      const record = await this.firstRecord();
      return record ? this.project(record) : null;
    }

    if (this.limitCount !== null) {
      const result = await pb
        .collection(this.collection)
        .getList<RawRecord>(1, this.limitCount, this.listOptions());
      return result.items.map((record) => this.project(record));
    }

    const records = await pb.collection(this.collection).getFullList<RawRecord>(this.listOptions());
    return records.map((record) => this.project(record));
  }

  private async runInsert(): Promise<unknown> {
    const op = this.op;
    if (op.kind !== 'insert') return null;
    const created: Array<Record<string, unknown>> = [];
    for (const row of op.rows) {
      const body = { ...row };
      // PocketBase ids are 15-char [a-z0-9]; client-generated ids are not portable.
      delete body.id;
      created.push(await pb.collection(this.collection).create<RawRecord>(body));
    }
    return this.writeResult(created);
  }

  private async runUpdate(): Promise<unknown> {
    const op = this.op;
    if (op.kind !== 'update') return null;
    const ids = await this.targetIds();
    const updated: Array<Record<string, unknown>> = [];
    for (const id of ids) {
      updated.push(await pb.collection(this.collection).update<RawRecord>(id, op.patch));
    }
    return this.writeResult(updated);
  }

  private async runUpsert(): Promise<unknown> {
    const op = this.op;
    if (op.kind !== 'upsert') return null;
    const saved: Array<Record<string, unknown>> = [];
    for (const row of op.rows) {
      const body = { ...row };
      const id = typeof body.id === 'string' ? body.id : null;
      delete body.id;
      if (id) {
        try {
          saved.push(await pb.collection(this.collection).update<RawRecord>(id, body));
          continue;
        } catch (error) {
          if (!isNotFound(error)) throw error;
        }
      }
      saved.push(await pb.collection(this.collection).create<RawRecord>(body));
    }
    return this.writeResult(saved);
  }

  private async runDelete(): Promise<unknown> {
    const ids = await this.targetIds();
    for (const id of ids) {
      await pb.collection(this.collection).delete(id);
    }
    return null;
  }

  private async run(): Promise<DbResult<any>> {
    try {
      if (this.op.kind === 'select') return { data: await this.runSelect(), error: null };
      if (this.op.kind === 'insert') return { data: await this.runInsert(), error: null };
      if (this.op.kind === 'update') return { data: await this.runUpdate(), error: null };
      if (this.op.kind === 'upsert') return { data: await this.runUpsert(), error: null };
      return { data: await this.runDelete(), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export interface LegacyAuthUser {
  id: string;
  email?: string;
}

export const insforge = {
  database: {
    from: (collection: string) => new LegacyQuery(collection),
  },
  auth: {
    async signInWithPassword(credentials: { email: string; password: string }) {
      try {
        await pb
          .collection('users')
          .authWithPassword(credentials.email, credentials.password);
        return { data: { user: pb.authStore.record }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    async getCurrentUser() {
      const record = pb.authStore.isValid ? pb.authStore.record : null;
      return { data: record ? { user: record } : null, error: null };
    },
    signOut() {
      pb.authStore.clear();
    },
  },
};

export default insforge;
