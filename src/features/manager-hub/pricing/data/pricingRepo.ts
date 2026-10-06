/**
 * Pricing adapter backed by the PocketBase `menu_items` collection.
 *
 * `menu_items` has no `slug`, `currency` or `effective_from` columns, so this
 * repo only ever writes the real `price` field and keys on the record `id`.
 * `currency` is carried for display and comes from the restaurant, not the item.
 */
import { insforge } from "../../../../data/pocketbase/legacy-insforge";

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
    itemId: row.id,
    label: row.name ?? "",
    price: row.price ? Number(row.price) : 0,
    // Not an item column: the restaurant owns the currency. Display default only.
    currency: "MXN",
    effectiveFrom: undefined,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export const pricingRepo: PricingRepo = {
  async list(restaurantId: string): Promise<PriceEntry[]> {
    const { data, error } = await insforge.database
      .from("menu_items")
      .select("id, name, price, updated_at")
      .eq("restaurant_id", restaurantId)
      .not("price", "is", null)
      .order("name");
    if (error) throw error;
    return (data ?? []).map(toPriceEntry);
  },

  async upsert(entry: Omit<PriceEntry, "updatedAt">, restaurantId: string): Promise<PriceEntry> {
    validatePrice(entry.price);
    const { data, error } = await insforge.database
      .from("menu_items")
      .update({ price: entry.price })
      .eq("id", entry.itemId)
      .eq("restaurant_id", restaurantId)
      .select()
      .single();
    if (error) throw error;
    return toPriceEntry(data);
  },

  async remove(itemId: string, restaurantId: string): Promise<void> {
    const { error } = await insforge.database
      .from("menu_items")
      .update({ price: 0 })
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId);
    if (error) throw error;
  },
};
