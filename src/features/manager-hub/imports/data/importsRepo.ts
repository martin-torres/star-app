/**
 * Imports adapter backed by the import_jobs table.
 */
import { insforge } from "../../../../data/insforge/client";

export type ImportKind = "csv" | "image" | "doc";
export type ImportStatus = "uploaded" | "parsed" | "previewed" | "applied" | "failed";

export interface ImportJob {
  jobId: string;
  kind: ImportKind;
  status: ImportStatus;
  summary: { success: number; failed: number };
  errors: string[];
  fileName: string;
  updatedAt: string;
}

export interface ImportsRepo {
  list(restaurantId: string): Promise<ImportJob[]>;
  upsert(job: Omit<ImportJob, "updatedAt">, restaurantId: string): Promise<ImportJob>;
}

function toImportJob(row: any): ImportJob {
  return {
    jobId: row.id,
    kind: row.kind ?? "csv",
    status: row.status ?? "uploaded",
    summary: row.summary ?? { success: 0, failed: 0 },
    errors: row.errors ?? [],
    fileName: row.file_name ?? "",
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export const importsRepo: ImportsRepo = {
  async list(restaurantId: string): Promise<ImportJob[]> {
    const { data, error } = await insforge.database
      .from("import_jobs")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toImportJob);
  },

  async upsert(job: Omit<ImportJob, "updatedAt">, restaurantId: string): Promise<ImportJob> {
    const payload = {
      restaurant_id: restaurantId,
      kind: job.kind,
      status: job.status,
      summary: job.summary,
      errors: job.errors,
      file_name: job.fileName,
    };

    const { data, error } = await insforge.database
      .from("import_jobs")
      .upsert([{ id: job.jobId, ...payload }])
      .select()
      .single();
    if (error) throw error;
    return toImportJob(data);
  },
};
