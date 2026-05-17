import { useEffect, useState } from "react";
import { managerTokens } from "../../../shared/ui/managerTokens";
import { menuRepo, type MenuItem } from "../data/menuRepo";

interface Draft {
  itemId: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
}

const EMPTY: Draft = { itemId: "", name: "", category: "", description: "", imageUrl: "" };

interface MenuModuleProps {
  restaurantId: string;
}

export function MenuModule({ restaurantId }: MenuModuleProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setItems(await menuRepo.list(restaurantId));
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function saveDraft() {
    setError(null);
    try {
      if (items.some((it) => it.itemId === draft.itemId)) {
        await menuRepo.update(draft.itemId, draft);
      } else {
        await menuRepo.create({ ...draft, active: true }, restaurantId);
      }
      setDraft(EMPTY);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <section style={{ border: managerTokens.panelBorder, borderRadius: managerTokens.panelRadius, padding: managerTokens.panelPadding }}>
      <h2 style={{ marginTop: 0 }}>☰ Menu Catalog</h2>
      <p style={{ margin: "0 0 8px", color: "#6b7280", fontSize: 12 }}>Items are keyed by slug (auto-generated from name) and synced to the database.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
        <input placeholder="Image URL" value={draft.imageUrl} onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} />
      </div>
      <textarea placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={{ width: "100%", marginTop: 8 }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => void saveDraft()}>{draft.itemId ? "Update Item" : "Create Item"}</button>
        <button onClick={() => setDraft(EMPTY)}>Clear</button>
      </div>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        {items.map((item) => (
          <div key={item.itemId} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div>
              <strong>{item.name}</strong> <span style={{ color: "#6b7280" }}>({item.category})</span>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{item.itemId}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setDraft({ itemId: item.itemId, name: item.name, category: item.category, description: item.description ?? "", imageUrl: item.imageUrl ?? "" })}>Edit</button>
              <button onClick={() => void menuRepo.remove(item.itemId, restaurantId).then(load)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}