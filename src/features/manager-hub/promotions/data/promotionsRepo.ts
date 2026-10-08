/**
 * Promotions adapter backed by the promos table.
 *
 * Schema mapping:
 *   FloorPlan.entryId   → promos.id (uuid) but we generate a stable slug from title
 *   FloorPlan.type       → promos.type ("promotion" | "event")
 *   FloorPlan.title      → promos.name
 *   FloorPlan.offerType  → promos.offer_type
 *   FloorPlan.offerValue → promos.offer_value
 *   FloorPlan.targetDate → promos.target_date
 *   FloorPlan.targetWeekday → promos.target_weekday (integer 0-6)
 *   FloorPlan.active     → promos.active
 */
import { insforge } from "../../../../data/pocketbase/legacy-insforge";

export type PromotionType = "promotion" | "event";
export type PromotionOfferType = "discount" | "2x1" | "free" | "custom";

export interface PromotionEvent {
  entryId: string;
  itemId?: string;
  type: PromotionType;
  title: string;
  offerType?: PromotionOfferType;
  offerValue?: string;
  targetDate?: string;
  targetWeekday?: string;
  active: boolean;
  updatedAt: string;
}

export interface PromotionsRepo {
  list(restaurantId: string): Promise<PromotionEvent[]>;
  create(input: Omit<PromotionEvent, "updatedAt">, restaurantId: string): Promise<PromotionEvent>;
  update(entryId: string, patch: Partial<PromotionEvent>, restaurantId: string): Promise<PromotionEvent>;
  remove(entryId: string, restaurantId: string): Promise<void>;
}

function toPromotionEvent(row: any): PromotionEvent {
  return {
    entryId: row.id,
    itemId: row.item_id ?? undefined,
    type: row.type ?? "promotion",
    title: row.name ?? "",
    offerType: row.offer_type ?? undefined,
    offerValue: row.offer_value ?? undefined,
    targetDate: row.target_date ?? undefined,
    targetWeekday: row.target_weekday !== null ? String(row.target_weekday) : undefined,
    active: row.active ?? true,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

export const promotionsRepo: PromotionsRepo = {
  async list(restaurantId: string): Promise<PromotionEvent[]> {
    const { data, error } = await insforge.database
      .from("promos")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toPromotionEvent);
  },

  async create(input: Omit<PromotionEvent, "updatedAt">, restaurantId: string): Promise<PromotionEvent> {
    const { data, error } = await insforge.database
      .from("promos")
      .insert([
        {
          restaurant_id: restaurantId,
          type: input.type,
          name: input.title,
          offer_type: input.offerType ?? null,
          offer_value: input.offerValue ?? null,
          target_date: input.targetDate ?? null,
          active: input.active ?? true,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return toPromotionEvent(data);
  },

  async update(entryId: string, patch: Partial<PromotionEvent>, restaurantId: string): Promise<PromotionEvent> {
    const dbPatch: Record<string, unknown> = {};
    if (patch.title !== undefined) dbPatch.name = patch.title;
    if (patch.type !== undefined) dbPatch.type = patch.type;
    if (patch.offerType !== undefined) dbPatch.offer_type = patch.offerType;
    if (patch.offerValue !== undefined) dbPatch.offer_value = patch.offerValue;
    if (patch.targetDate !== undefined) dbPatch.target_date = patch.targetDate;
    if (patch.active !== undefined) dbPatch.active = patch.active;

    const { data, error } = await insforge.database
      .from("promos")
      .update(dbPatch)
      .eq("id", entryId)
      .eq("restaurant_id", restaurantId)
      .select()
      .single();
    if (error) throw error;
    return toPromotionEvent(data);
  },

  async remove(entryId: string, restaurantId: string): Promise<void> {
    const { error } = await insforge.database
      .from("promos")
      .delete()
      .eq("id", entryId)
      .eq("restaurant_id", restaurantId);
    if (error) throw error;
  },
};
