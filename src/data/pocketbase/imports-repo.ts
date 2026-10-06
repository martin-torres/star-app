/**
 * Import-jobs repository (`import_jobs` is manager-only).
 */
import { pb } from './client';
import { COLLECTIONS } from './collections';
import { eq } from './query';
import { compact } from './mappers';

export type ImportKind = 'csv' | 'image' | 'doc';
export type ImportStatus = 'uploaded' | 'parsed' | 'previewed' | 'applied' | 'failed';

export interface ImportJobRecord {
  id: string;
  restaurant_id: string;
  kind: ImportKind;
  status: ImportStatus;
  summary?: { success: number; failed: number };
  errors?: string[];
  file_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface ImportJobInput {
  restaurant_id: string;
  kind: ImportKind;
  status?: ImportStatus;
  summary?: { success: number; failed: number };
  errors?: string[];
  file_name: string;
}

export class PocketBaseImportsRepository {
  async list(restaurantId: string): Promise<ImportJobRecord[]> {
    return pb.collection(COLLECTIONS.importJobs).getFullList<ImportJobRecord>({
      filter: eq('restaurant_id', restaurantId),
      sort: '-created_at',
    });
  }

  async getById(id: string): Promise<ImportJobRecord> {
    return pb.collection(COLLECTIONS.importJobs).getOne<ImportJobRecord>(id);
  }

  async create(input: ImportJobInput): Promise<ImportJobRecord> {
    return pb.collection(COLLECTIONS.importJobs).create<ImportJobRecord>(compact({ ...input }));
  }

  /** Update when an id is known, otherwise create. `updated_at` is autodate. */
  async upsert(id: string | null, input: ImportJobInput): Promise<ImportJobRecord> {
    if (id) {
      return pb
        .collection(COLLECTIONS.importJobs)
        .update<ImportJobRecord>(id, compact({ ...input }));
    }
    return this.create(input);
  }

  async update(id: string, patch: Partial<ImportJobRecord>): Promise<ImportJobRecord> {
    return pb
      .collection(COLLECTIONS.importJobs)
      .update<ImportJobRecord>(id, compact({ ...patch }));
  }
}
