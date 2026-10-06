/**
 * PocketBase filter/sort helpers.
 *
 * PocketBase has no query-builder object - filters are strings
 * (`filter: "restaurant_id='abc' && active=true"`). These helpers build those
 * strings safely so a value containing a quote or a backslash cannot break out
 * of the literal.
 */

export type SortDirection = { ascending?: boolean };

/**
 * Render a JS value as a PocketBase filter literal.
 * Strings are double-quoted and escaped; numbers/booleans are bare; null is the
 * `null` keyword.
 */
export const pbLiteral = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  const escaped = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
};

/** `field = value` */
export const eq = (field: string, value: unknown): string => `${field} = ${pbLiteral(value)}`;

/** `field != value` */
export const neq = (field: string, value: unknown): string => `${field} != ${pbLiteral(value)}`;

/** `field != null` / `field = null` */
export const isNull = (field: string, nullish = true): string =>
  `${field} ${nullish ? '=' : '!='} null`;

/** `(a = 1 || b = 2)` - PocketBase has no `in` operator. */
export const oneOf = (field: string, values: readonly unknown[]): string => {
  if (values.length === 0) return '1 = 0';
  return `(${values.map((value) => eq(field, value)).join(' || ')})`;
};

/** Join conditions with `&&`, dropping empties. */
export const and = (...conditions: Array<string | undefined | null>): string =>
  conditions.filter((c): c is string => typeof c === 'string' && c.length > 0).join(' && ');

/** Build a PocketBase `sort` value: `orderBy('timestamp', { ascending: false })` -> `-timestamp`. */
export const orderBy = (field: string, direction?: SortDirection): string =>
  direction?.ascending === false ? `-${field}` : field;

/** Join sort clauses; PocketBase takes them comma-separated. */
export const sortBy = (...clauses: Array<string | undefined | null>): string =>
  clauses.filter((c): c is string => typeof c === 'string' && c.length > 0).join(',');
