import type { DragEvent } from "react";
import type { FloorPropType, TableType } from "../domain/layoutTypes";

interface LeftToolPanelProps {
  addTableType: TableType;
  addPropType: FloorPropType;
  onAddTableTypeChange(value: TableType): void;
  onAddPropTypeChange(value: FloorPropType): void;
  collapsed: boolean;
  onToggleCollapse(): void;
}

const TABLE_TYPES: Array<{ value: TableType; label: string }> = [
  { value: "square", label: "Square" },
  { value: "rectangle", label: "Rectangle" },
  { value: "circular", label: "Circular" },
  { value: "booth", label: "Booth" },
  { value: "l_shaped", label: "L-Shaped" },
];

const PROP_TYPES: Array<{ value: FloorPropType; label: string }> = [
  { value: "stage", label: "Stage" },
  { value: "bathroom", label: "Bathroom" },
  { value: "staircase", label: "Staircase" },
  { value: "window", label: "Window" },
  { value: "main_door", label: "Main Door" },
  { value: "door", label: "Door" },
  { value: "kitchen_area", label: "Kitchen" },
];

const TABLE_ICONS: Record<TableType, string> = {
  square: "◼",
  rectangle: "▭",
  circular: "◯",
  booth: "⌷",
  l_shaped: "└",
};

const PROP_ICONS: Record<FloorPropType, string> = {
  stage: "◫",
  bathroom: "🚻",
  staircase: "⇅",
  window: "▣",
  main_door: "⎋",
  door: "⟂",
  kitchen_area: "🍽",
};

function modeButtonStyle(active: boolean) {
  return {
    border: "1px solid #d1d5db",
    background: active ? "#111827" : "#ffffff",
    color: active ? "#ffffff" : "#111827",
    borderRadius: 8,
    padding: "9px 10px",
    textAlign: "center" as const,
    fontWeight: 600,
    fontSize: 13,
    lineHeight: 1,
  };
}

export function LeftToolPanel({
  addTableType,
  addPropType,
  onAddTableTypeChange,
  onAddPropTypeChange,
  collapsed,
  onToggleCollapse,
}: LeftToolPanelProps) {
  function onTableDragStart(event: DragEvent<HTMLButtonElement>, tableType: TableType) {
    event.dataTransfer.setData("application/x-floor-editor-item", JSON.stringify({ kind: "table", tableType }));
    event.dataTransfer.effectAllowed = "copy";
    onAddTableTypeChange(tableType);
  }

  function onPropDragStart(event: DragEvent<HTMLButtonElement>, propType: FloorPropType) {
    event.dataTransfer.setData("application/x-floor-editor-item", JSON.stringify({ kind: "prop", propType }));
    event.dataTransfer.effectAllowed = "copy";
    onAddPropTypeChange(propType);
  }

  if (collapsed) {
    return (
      <aside style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 6, display: "grid", gap: 8, justifyItems: "center", alignContent: "start", height: "100%", boxSizing: "border-box" }}>
        <button title="Open Tools" onClick={onToggleCollapse} style={{ borderRadius: 8, border: "1px solid #d1d5db", width: 34, height: 34, fontSize: 16, lineHeight: 1 }}>
          ☰
        </button>
        <button title="Tables Palette" onClick={onToggleCollapse} style={{ ...modeButtonStyle(false), width: 34, height: 34, padding: 0, fontSize: 18 }}>◻</button>
        <button title="Props Palette" onClick={onToggleCollapse} style={{ ...modeButtonStyle(false), width: 34, height: 34, padding: 0, fontSize: 18 }}>▦</button>
      </aside>
    );
  }

  return (
    <aside style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, height: "100%", boxSizing: "border-box", overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Tools</h3>
        <button onClick={onToggleCollapse} title="Collapse" style={{ borderRadius: 8, border: "1px solid #d1d5db", padding: "4px 8px" }}>
          ⇤
        </button>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 8, display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Tables: drag to canvas</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {TABLE_TYPES.map((type) => (
              <button
                key={type.value}
                draggable
                onDragStart={(event) => onTableDragStart(event, type.value)}
                title={type.label}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: addTableType === type.value ? "#eff6ff" : "#fff",
                  cursor: "grab",
                  textAlign: "center",
                  fontSize: 13,
                }}
              >
                <div style={{ fontSize: 20, lineHeight: 1.2 }}>{TABLE_ICONS[type.value]}</div>
                <div style={{ fontSize: 10 }}>{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 8, display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Props: drag to canvas</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {PROP_TYPES.map((type) => (
              <button
                key={type.value}
                draggable
                onDragStart={(event) => onPropDragStart(event, type.value)}
                title={type.label}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: addPropType === type.value ? "#f0fdfa" : "#fff",
                  cursor: "grab",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, lineHeight: 1.2 }}>{PROP_ICONS[type.value]}</div>
                <div style={{ fontSize: 10 }}>{type.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
