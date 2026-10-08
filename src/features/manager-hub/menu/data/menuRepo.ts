/**
 * Manager-hub MenuRepository backed by the PocketBase `menu_items` collection.
 *
 * The canonical key is the record `id`; `active` is modelled by the real
 * `is_available` column. Columns that do NOT exist in the schema (`slug`,
 * `currency`, `effective_from`) are deliberately never written: PocketBase
 * rejects the whole request with a 400 if any field is unknown.
 */
import { insforge } from "../../../../data/pocketbase/legacy-insforge";

export interface MenuItem {
  itemId: string;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  updatedAt: string;
}

export interface MenuRepo {
  list(restaurantId: string): Promise<MenuItem[]>;
  create(input: Omit<MenuItem, "updatedAt">, restaurantId: string): Promise<MenuItem>;
  update(itemId: string, patch: Partial<MenuItem>): Promise<MenuItem>;
  remove(itemId: string, restaurantId: string): Promise<void>;
}

export function validateMenuItem(item: MenuItem): void {
  if (!item.itemId.trim()) throw new Error("itemId is required");
  if (!item.name.trim()) throw new Error("name is required");
  if (!item.category.trim()) throw new Error("category is required");
}

function toMenuItem(row: any): MenuItem {
  return {
    // The database key is the record id; there is no `slug` column.
    itemId: row.id,
    name: row.name ?? "",
    category: row.category ?? "General",
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    // `active` is modelled by the real `is_available` column.
    active: row.is_available ?? true,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function toDbPatch(patch: Partial<MenuItem>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (patch.name !== undefined) db.name = patch.name;
  if (patch.category !== undefined) db.category = patch.category;
  if (patch.description !== undefined) db.description = patch.description;
  if (patch.imageUrl !== undefined) db.image_url = patch.imageUrl;
  if (patch.active !== undefined) db.is_available = patch.active;
  return db;
}

export const menuRepo: MenuRepo = {
  async list(restaurantId: string): Promise<MenuItem[]> {
    const { data, error } = await insforge.database
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("category")
      .order("name");
    if (error) throw error;
    return (data ?? []).map(toMenuItem);
  },

  async create(input: Omit<MenuItem, "updatedAt">, restaurantId: string): Promise<MenuItem> {
    const { data, error } = await insforge.database
      .from("menu_items")
      .insert([
        {
          restaurant_id: restaurantId,
          name: input.name,
          category: input.category,
          description: input.description ?? null,
          image_url: input.imageUrl ?? null,
          is_available: input.active ?? true,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return toMenuItem(data);
  },

  async update(itemId: string, patch: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await insforge.database
      .from("menu_items")
      .update(toDbPatch(patch))
      .eq("id", itemId)
      .select()
      .single();
    if (error) throw error;
    return toMenuItem(data);
  },

  async remove(itemId: string, restaurantId: string): Promise<void> {
    const { error } = await insforge.database
      .from("menu_items")
      .delete()
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId);
    if (error) throw error;
  },
};
