import { insforge } from './client';

export type ImportKind = 'csv' | 'image' | 'doc';
export type ImportStatus = 'uploaded' | 'parsed' | 'previewed' | 'applied' | 'failed';

export interface ImportJobRecord {
  id: string;
  restaurant_id: string;
  kind: ImportKind;
  status: ImportStatus;
  summary: { success: number; failed: number };
  errors: string[];
  file_name: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ImportJobInput {
  restaurant_id: string;
  kind: ImportKind;
  status?: ImportStatus;
  summary?: { success: number; failed: number };
  errors?: string[];
  file_name: string;
  file_url?: string;
}

export class InsForgeImportsRepository {
  async list(restaurantId: string): Promise<ImportJobRecord[]> {
    const { data, error } = await insforge.database
      .from('import_jobs')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as any;
  }

  async getById(id: string): Promise<ImportJobRecord> {
    const { data, error } = await insforge.database
      .from('import_jobs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as any;
  }

  async create(input: ImportJobInput): Promise<ImportJobRecord> {
    const { data, error } = await insforge.database
      .from('import_jobs')
      .insert([input])
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async upsert(id: string | null, input: ImportJobInput): Promise<ImportJobRecord> {
    if (id) {
      const { data, error } = await insforge.database
        .from('import_jobs')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as any;
    }
    return this.create(input);
  }

  async update(id: string, patch: Partial<ImportJobRecord>): Promise<ImportJobRecord> {
    const { data, error } = await insforge.database
      .from('import_jobs')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }
}
