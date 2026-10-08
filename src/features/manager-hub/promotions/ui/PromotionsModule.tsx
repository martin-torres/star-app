import { useEffect, useMemo, useState } from "react";
import { managerTokens } from "../../../../shared/ui/managerTokens";
import { promotionsRepo, type PromotionEvent, type PromotionType } from "../data/promotionsRepo";
import { shouldWarnDay } from "../thresholdRules";

interface Draft {
  entryId: string;
  type: PromotionType;
  title: string;
  targetDate: string;
}

const EMPTY: Draft = { entryId: "", type: "promotion", title: "", targetDate: "" };

interface PromotionsModuleProps {
  restaurantId: string;
}

export function PromotionsModule({ restaurantId }: PromotionsModuleProps) {
  const [entries, setEntries] = useState<PromotionEvent[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  async function load() {
    setEntries(await promotionsRepo.list(restaurantId));
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  const dayMap = useMemo(() => {
    const map = new Map<string, { promotions: number; events: number }>();
    for (const entry of entries) {
      const key = entry.targetDate ?? "unscheduled";
      const curr = map.get(key) ?? { promotions: 0, events: 0 };
      if (entry.type === "promotion") curr.promotions += 1;
      else curr.events += 1;
      map.set(key, curr);
    }
    return map;
  }, [entries]);

  async function save() {
    if (entries.some((it) => it.entryId === draft.entryId)) {
      await promotionsRepo.update(draft.entryId, draft, restaurantId);
    } else {
      await promotionsRepo.create({ ...draft, active: true }, restaurantId);
    }
    setDraft(EMPTY);
    await load();
  }

  return (
    <section style={{ border: managerTokens.panelBorder, borderRadius: managerTokens.panelRadius, padding: managerTokens.panelPadding }}>
      <h2 style={{ marginTop: 0 }}>✦ Promotions & Events</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        <input placeholder="ID" value={draft.entryId} onChange={(e) => setDraft({ ...draft, entryId: e.target.value })} disabled />
        <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as PromotionType })}>
          <option value="promotion">Promotion</option>
          <option value="event">Event</option>
        </select>
        <input placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input placeholder="YYYY-MM-DD" value={draft.targetDate} onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => void save()}>Save Entry</button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {[...dayMap.entries()].map(([date, counts]) => (
          <div key={date} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8 }}>
            <strong>{date}</strong> · Promotions: {counts.promotions} · Events: {counts.events}
            {shouldWarnDay(counts.promotions, counts.events) && (
              <span style={{ marginLeft: 8, color: "#b45309", fontWeight: 700 }}>Warning: Daily threshold exceeded</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        {entries.map((entry) => (
          <div key={entry.entryId} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8, display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{entry.title}</strong> ({entry.type})
              <div style={{ fontSize: 12, color: "#6b7280" }}>{entry.targetDate || "unscheduled"}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setDraft({ entryId: entry.entryId, type: entry.type, title: entry.title, targetDate: entry.targetDate ?? "" })}>Edit</button>
              <button onClick={() => void promotionsRepo.remove(entry.entryId, restaurantId).then(load)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
