/**
 * Pricing adapter backed by the menu_items table.
 *
 * The 2y542jyv schema stores price, currency, and effective_from directly
 * on menu_items, so this repo is a thin wrapper around menu queries.
 */
import { insforge } from "../../../../data/insforge/client";

export interface PriceEntry {
  itemId: string;
  label: string;
  price: number;
  currency: string;
  effectiveFrom?: string;
  updatedAt: string;
}

export interface PricingRepo {
  list(restaurantId: string): Promise<PriceEntry[]>;
  upsert(entry: Omit<PriceEntry, "updatedAt">, restaurantId: string): Promise<PriceEntry>;
  remove(itemId: string, restaurantId: string): Promise<void>;
}

export function validatePrice(value: number): void {
  if (!Number.isFinite(value)) throw new Error("price must be numeric");
  if (value < 0) throw new Error("price cannot be negative");
}

function toPriceEntry(row: any): PriceEntry {
  return {
    itemId: row.slug ?? row.id,
    label: row.name ?? row.slug ?? "",
    price: row.price ? Number(row.price) : 0,
    currency: row.currency ?? "MXN",
    effectiveFrom: row.effective_from ?? undefined,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export const pricingRepo: PricingRepo = {
  async list(restaurantId: string): Promise<PriceEntry[]> {
    const { data, error } = await insforge.database
      .from("menu_items")
      .select("slug, name, price, currency, effective_from, updated_at")
      .eq("restaurant_id", restaurantId)
      .not("price", "is", null)
      .order("name");
    if (error) throw error;
    return (data ?? []).map(toPriceEntry);
  },

  async upsert(entry: Omit<PriceEntry, "updatedAt">, restaurantId: string): Promise<PriceEntry> {
    validatePrice(entry.price);
    const patch: Record<string, unknown> = {
      price: entry.price,
      currency: entry.currency,
    };
    if (entry.effectiveFrom) patch.effective_from = entry.effectiveFrom;

    const { data, error } = await insforge.database
      .from("menu_items")
      .update(patch)
      .eq("slug", entry.itemId)
      .eq("restaurant_id", restaurantId)
      .select()
      .single();
    if (error) throw error;
    return toPriceEntry(data);
  },

  async remove(itemId: string, restaurantId: string): Promise<void> {
    const { error } = await insforge.database
      .from("menu_items")
      .update({ price: null, currency: null })
      .eq("slug", itemId)
      .eq("restaurant_id", restaurantId);
    if (error) throw error;
  },
};
