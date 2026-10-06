/**
 * Small read helpers shared by the repositories.
 */
import type { RecordListOptions } from 'pocketbase';
import { pb } from './client';

/** PocketBase throws a `ClientResponseError` with `status: 404` for a miss. */
export const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as { status?: unknown }).status === 404;

/** `getFirstListItem` that returns `null` instead of throwing on a 404. */
export const firstOrNull = async <T>(
  collection: string,
  filter: string,
  options?: RecordListOptions,
): Promise<T | null> => {
  try {
    return await pb.collection(collection).getFirstListItem<T>(filter, options);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};

/** Coerce a PocketBase json field into a plain object (or null). */
export const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
