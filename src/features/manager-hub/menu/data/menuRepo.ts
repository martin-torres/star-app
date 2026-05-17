/**
 * FloorPlan-style MenuRepository backed by the InsForge menu_items table.
 *
 * Schema: menu_items (2y542jyv)
 *   slug ← FloorPlan itemId (human-readable key)
 *   name, category, description, image_url
 *   active, is_available, price, currency, effective_from
 *   created_at, updated_at
 */
import { insforge } from "../../../../data/insforge/client";

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
    itemId: row.slug ?? row.id,
    name: row.name ?? "",
    category: row.category ?? "General",
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    active: row.active ?? true,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function toDbPatch(patch: Partial<MenuItem>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (patch.name !== undefined) db.name = patch.name;
  if (patch.category !== undefined) db.category = patch.category;
  if (patch.description !== undefined) db.description = patch.description;
  if (patch.imageUrl !== undefined) db.image_url = patch.imageUrl;
  if (patch.active !== undefined) db.active = patch.active;
  return db;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
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
    const slug = createSlug(input.name);
    const { data, error } = await insforge.database
      .from("menu_items")
      .insert([
        {
          restaurant_id: restaurantId,
          slug,
          name: input.name,
          category: input.category,
          description: input.description ?? null,
          image_url: input.imageUrl ?? null,
          active: input.active ?? true,
          is_available: true,
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
      .eq("slug", itemId)
      .select()
      .single();
    if (error) throw error;
    return toMenuItem(data);
  },

  async remove(itemId: string, restaurantId: string): Promise<void> {
    const { error } = await insforge.database
      .from("menu_items")
      .delete()
      .eq("slug", itemId)
      .eq("restaurant_id", restaurantId);
    if (error) throw error;
  },
};
