import type { ImportJob, ImportKind } from "../data/importsRepo";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export interface ParsedImportRow {
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  category?: string;
  promoTitle?: string;
  promoType?: "promotion" | "event";
  promoDate?: string;
  discountType?: "discount" | "2x1" | "free" | "custom";
  discountValue?: string;
}

const COLUMN_ALIASES: Record<keyof ParsedImportRow, string[]> = {
  name: ["name", "item", "item_name", "menu_item", "product", "nombre"],
  price: ["price", "cost", "amount", "precio", "valor"],
  description: ["description", "desc", "details", "descripcion"],
  imageUrl: ["image", "picture", "photo", "img", "image_url", "photo_url"],
  category: ["category", "type", "group", "categoria"],
  promoTitle: ["promo", "promotion", "promo_title", "event", "event_title", "title"],
  promoType: ["promo_type", "type_of_promo", "event_type", "entry_type"],
  promoDate: ["date", "promo_date", "event_date", "day", "fecha"],
  discountType: ["discount_type", "offer_type", "promo_kind", "deal_type"],
  discountValue: ["discount", "discount_value", "offer_value", "value"],
};

export function inferImportKind(name: string): ImportKind | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "csv";
  if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) return "image";
  if (lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".doc") || lower.endsWith(".docx")) return "doc";
  return null;
}

export function validateImportFile(file: { name: string; size: number }): { kind: ImportKind } {
  const kind = inferImportKind(file.name);
  if (!kind) throw new Error("Unsupported file type");
  if (file.size <= 0) throw new Error("Empty file");
  if (file.size > MAX_FILE_SIZE) throw new Error("File exceeds 8MB limit");
  return { kind };
}

export function buildImportPreview(job: ImportJob): string {
  return `${job.fileName} (${job.kind}) · status: ${job.status}`;
}

function normalizeKey(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function pickColumnIndex(headers: string[], aliases: string[]): number {
  const normalized = headers.map(normalizeKey);
  for (const alias of aliases.map(normalizeKey)) {
    const idx = normalized.indexOf(alias);
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseDelimited(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return { headers: [], rows: [] };
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const splitLine = (line: string) =>
    line
      .split(delimiter)
      .map((part) => part.trim().replace(/^"|"$/g, ""));

  return { headers: splitLine(lines[0]), rows: lines.slice(1).map(splitLine) };
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export function mapRowsToRecords(headers: string[], rows: string[][]): ParsedImportRow[] {
  if (headers.length === 0) return [];

  const indexes: Partial<Record<keyof ParsedImportRow, number>> = {};
  (Object.keys(COLUMN_ALIASES) as Array<keyof ParsedImportRow>).forEach((key) => {
    const idx = pickColumnIndex(headers, COLUMN_ALIASES[key]);
    if (idx >= 0) indexes[key] = idx;
  });

  return rows
    .map((row) => {
      const rec: ParsedImportRow = {};
      if (indexes.name !== undefined) rec.name = row[indexes.name] || undefined;
      if (indexes.price !== undefined) rec.price = parseNumber(row[indexes.price]);
      if (indexes.description !== undefined) rec.description = row[indexes.description] || undefined;
      if (indexes.imageUrl !== undefined) rec.imageUrl = row[indexes.imageUrl] || undefined;
      if (indexes.category !== undefined) rec.category = row[indexes.category] || undefined;
      if (indexes.promoTitle !== undefined) rec.promoTitle = row[indexes.promoTitle] || undefined;
      if (indexes.promoDate !== undefined) rec.promoDate = row[indexes.promoDate] || undefined;
      if (indexes.promoType !== undefined) {
        const raw = (row[indexes.promoType] || "").toLowerCase();
        rec.promoType = raw.includes("event") ? "event" : raw ? "promotion" : undefined;
      }
      if (indexes.discountType !== undefined) {
        const raw = (row[indexes.discountType] || "").toLowerCase();
        if (raw.includes("2x1") || raw.includes("2for1")) rec.discountType = "2x1";
        else if (raw.includes("free")) rec.discountType = "free";
        else if (raw.includes("discount") || raw.includes("percent")) rec.discountType = "discount";
        else if (raw) rec.discountType = "custom";
      }
      if (indexes.discountValue !== undefined) rec.discountValue = row[indexes.discountValue] || undefined;
      return rec;
    })
    .filter((row) =>
      Boolean(
        row.name ||
          row.price !== undefined ||
          row.description ||
          row.imageUrl ||
          row.category ||
          row.promoTitle,
      ),
    );
}

export async function parseImportFile(file: File): Promise<ParsedImportRow[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    throw new Error("Excel files must be exported as CSV for now");
  }
  const text = await file.text();
  const { headers, rows } = parseDelimited(text);
  return mapRowsToRecords(headers, rows);
}
