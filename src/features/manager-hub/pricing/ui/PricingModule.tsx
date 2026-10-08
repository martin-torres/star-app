import { useEffect, useState } from "react";
import { managerTokens } from "../../../../shared/ui/managerTokens";
import { pricingRepo, validatePrice, type PriceEntry } from "../data/pricingRepo";

interface Draft {
  itemId: string;
  label: string;
  price: string;
  currency: string;
  effectiveFrom: string;
}

const EMPTY: Draft = { itemId: "", label: "", price: "", currency: "MXN", effectiveFrom: "" };

interface PricingModuleProps {
  restaurantId: string;
}

export function PricingModule({ restaurantId }: PricingModuleProps) {
  const [entries, setEntries] = useState<PriceEntry[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setEntries(await pricingRepo.list(restaurantId));
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function save() {
    setError(null);
    try {
      const value = Number(draft.price);
      validatePrice(value);
      await pricingRepo.upsert(
        { itemId: draft.itemId, label: draft.label, price: value, currency: draft.currency, effectiveFrom: draft.effectiveFrom || undefined },
        restaurantId,
      );
      setDraft(EMPTY);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pricing save failed");
    }
  }

  return (
    <section style={{ border: managerTokens.panelBorder, borderRadius: managerTokens.panelRadius, padding: managerTokens.panelPadding }}>
      <h2 style={{ marginTop: 0 }}>$ Pricing</h2>
      <p style={{ margin: "0 0 8px", color: "#6b7280", fontSize: 12 }}>Prices sync to the menu_items table. Use the slug/Item ID to link to existing items.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        <input placeholder="Item ID (slug)" value={draft.itemId} onChange={(e) => setDraft({ ...draft, itemId: e.target.value })} />
        <input placeholder="Label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        <input placeholder="Price" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
        <input placeholder="Currency" value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
      </div>
      <input style={{ marginTop: 8 }} placeholder="Effective From (YYYY-MM-DD)" value={draft.effectiveFrom} onChange={(e) => setDraft({ ...draft, effectiveFrom: e.target.value })} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => void save()}>Save Price</button>
        <button onClick={() => setDraft(EMPTY)}>Clear</button>
      </div>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        {entries.map((entry) => (
          <div key={entry.itemId} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{entry.label || entry.itemId}</strong>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{entry.itemId}</div>
              <div>{entry.currency} {entry.price.toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setDraft({ itemId: entry.itemId, label: entry.label, price: String(entry.price), currency: entry.currency, effectiveFrom: entry.effectiveFrom ?? "" })}>Edit</button>
              <button onClick={() => void pricingRepo.remove(entry.itemId, restaurantId).then(load)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
