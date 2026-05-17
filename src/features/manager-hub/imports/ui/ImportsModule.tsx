import { useEffect, useState } from "react";
import { managerTokens } from "../../../shared/ui/managerTokens";
import { menuRepo } from "../../menu";
import { pricingRepo } from "../../pricing";
import { promotionsRepo } from "../../promotions";
import { importsRepo, type ImportJob } from "../data/importsRepo";
import { buildImportPreview, parseImportFile, validateImportFile, type ParsedImportRow } from "../state/importsStore";

interface ImportsModuleProps {
  restaurantId: string;
}

function toId(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

export function ImportsModule({ restaurantId }: ImportsModuleProps) {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [parsedByJob, setParsedByJob] = useState<Record<string, ParsedImportRow[]>>({});

  async function load() {
    setJobs(await importsRepo.list(restaurantId));
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    for (const file of Array.from(files)) {
      try {
        const { kind } = validateImportFile(file);
        const rows = kind === "csv" ? await parseImportFile(file) : [];
        const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        setParsedByJob((prev) => ({ ...prev, [jobId]: rows }));

        await importsRepo.upsert({
          jobId,
          kind,
          fileName: file.name,
          status: "previewed",
          summary: { success: rows.length, failed: 0 },
          errors: [],
        }, restaurantId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import validation failed");
      }
    }

    await load();
  }

  async function apply(job: ImportJob) {
    const rows = parsedByJob[job.jobId] ?? [];
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const hasItemData = Boolean(row.name || row.price !== undefined || row.description || row.imageUrl || row.category);
        let itemId: string | undefined;

        if (hasItemData && row.name) {
          itemId = toId(row.name);
          const allItems = await menuRepo.list(restaurantId);
          const exists = allItems.some((item) => item.itemId === itemId);
          if (exists) {
            await menuRepo.update(itemId, {
              name: row.name,
              category: row.category || "General",
              description: row.description,
              imageUrl: row.imageUrl,
            });
          } else {
            await menuRepo.create({
              itemId,
              name: row.name,
              category: row.category || "General",
              description: row.description,
              imageUrl: row.imageUrl,
              active: true,
            }, restaurantId);
          }

          if (row.price !== undefined) {
            await pricingRepo.upsert({
              itemId,
              label: row.name,
              price: row.price,
              currency: "MXN",
            }, restaurantId);
          }
        }

        if (row.promoTitle) {
          await promotionsRepo.create({
            entryId: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            itemId,
            type: row.promoType ?? "promotion",
            title: row.promoTitle,
            targetDate: row.promoDate,
            offerType: row.discountType,
            offerValue: row.discountValue,
            active: true,
          }, restaurantId);
        }

        success += 1;
      } catch (err) {
        failed += 1;
        errors.push(err instanceof Error ? err.message : "Unknown row error");
      }
    }

    await importsRepo.upsert({ ...job, status: "applied", summary: { success, failed }, errors }, restaurantId);
    await load();
  }

  return (
    <section style={{ border: managerTokens.panelBorder, borderRadius: managerTokens.panelRadius, padding: managerTokens.panelPadding }}>
      <h2 style={{ marginTop: 0 }}>⇪ Imports</h2>
      <p style={{ marginTop: 0, color: "#6b7280", fontSize: 12 }}>
        CSV auto-maps flexible columns (name/price/description/image/category + promo fields) and populates matching data.
      </p>
      <input type="file" multiple onChange={(e) => void handleFiles(e.target.files)} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        style={{ marginTop: 10, border: "1px dashed #9ca3af", borderRadius: 10, padding: 14, color: "#6b7280" }}
      >
        Drag/drop CSV, images, or docs here
      </div>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        {jobs.map((job) => (
          <div key={job.jobId} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div>
              <strong>{buildImportPreview(job)}</strong>
              <div style={{ fontSize: 12, color: "#6b7280" }}>success: {job.summary.success} · failed: {job.summary.failed}</div>
            </div>
            <button disabled={job.status === "applied"} onClick={() => void apply(job)}>Apply</button>
          </div>
        ))}
      </div>
    </section>
  );
}
