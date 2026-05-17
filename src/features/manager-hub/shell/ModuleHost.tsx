import { useState, type ReactNode } from "react";
import type { FloorPropType, TableType } from "../floor-editor/domain/layoutTypes";
import { FloorCanvas } from "../floor-editor/ui/FloorCanvas";
import { RightInspectorPanel } from "../floor-editor/ui/RightInspectorPanel";
import type { FloorEditorStore } from "../floor-editor/state/editorStore";
import { AnalyticsPlaceholder } from "./AnalyticsPlaceholder";
import { OperationsModule, type OperationsViewMode } from "./OperationsModule";
import type { ManagerModuleRoute } from "./managerTypes";
import type { TableStatusInput } from "../floorplan/domain/statusTypes";

interface ModuleHostProps {
  route: ManagerModuleRoute;
  floorStore: FloorEditorStore;
  onFloorStoreChange(next: FloorEditorStore): void;
  addTableType: TableType;
  addPropType: FloorPropType;
  onAddTableTypeChange(value: TableType): void;
  onAddPropTypeChange(value: FloorPropType): void;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  onToggleLeft(): void;
  onToggleRight(): void;
  tableStatusMap?: Record<string, TableStatusInput>;
}

const TABLE_TYPES: Array<{ value: TableType; label: string; icon: string }> = [
  { value: "square", label: "Square", icon: "◼" },
  { value: "rectangle", label: "Rect", icon: "▭" },
  { value: "circular", label: "Circle", icon: "◯" },
  { value: "booth", label: "Booth", icon: "⌷" },
  { value: "l_shaped", label: "L", icon: "└" },
];

const PROP_TYPES: Array<{ value: FloorPropType; label: string; icon: string }> = [
  { value: "stage", label: "Stage", icon: "◫" },
  { value: "bathroom", label: "Bath", icon: "🚻" },
  { value: "staircase", label: "Stairs", icon: "⇅" },
  { value: "window", label: "Window", icon: "▣" },
  { value: "main_door", label: "M Door", icon: "⎋" },
  { value: "door", label: "Door", icon: "⟂" },
  { value: "kitchen_area", label: "Kitchen", icon: "🍽" },
];

function onTableDragStart(event: React.DragEvent<HTMLButtonElement>, tableType: TableType, setType: (v: TableType) => void) {
  event.dataTransfer.setData("application/x-floor-editor-item", JSON.stringify({ kind: "table", tableType }));
  event.dataTransfer.effectAllowed = "copy";
  setType(tableType);
}

function onPropDragStart(event: React.DragEvent<HTMLButtonElement>, propType: FloorPropType, setType: (v: FloorPropType) => void) {
  event.dataTransfer.setData("application/x-floor-editor-item", JSON.stringify({ kind: "prop", propType }));
  event.dataTransfer.effectAllowed = "copy";
  setType(propType);
}

export function ModuleHost({
  route,
  floorStore,
  onFloorStoreChange,
  addTableType,
  addPropType,
  onAddTableTypeChange,
  onAddPropTypeChange,
  rightCollapsed,
  onToggleRight,
  tableStatusMap,
}: ModuleHostProps): ReactNode {
  const [opsViewMode, setOpsViewMode] = useState<OperationsViewMode>("catalog");

  if (route === "floor-plan") {
    return (
      <section style={{ display: "grid", gridTemplateColumns: `1fr ${rightCollapsed ? "56px" : "240px"}`, gap: 10, minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 8, minHeight: 0 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 8, display: "flex", gap: 8, alignItems: "center", overflowX: "auto" }}>
            <strong style={{ fontSize: 12, color: "#6b7280" }}>Tables</strong>
            {TABLE_TYPES.map((type) => (
              <button key={type.value} draggable onDragStart={(e) => onTableDragStart(e, type.value, onAddTableTypeChange)} title={type.label} style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 8px", background: addTableType === type.value ? "#eff6ff" : "#fff" }}>
                {type.icon}
              </button>
            ))}
            <strong style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>Props</strong>
            {PROP_TYPES.map((type) => (
              <button key={type.value} draggable onDragStart={(e) => onPropDragStart(e, type.value, onAddPropTypeChange)} title={type.label} style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 8px", background: addPropType === type.value ? "#f0fdfa" : "#fff" }}>
                {type.icon}
              </button>
            ))}
          </div>
          <FloorCanvas store={floorStore} onStoreChange={onFloorStoreChange} addTableType={addTableType} addPropType={addPropType} tableStatusMap={tableStatusMap} />
        </div>

        <RightInspectorPanel store={floorStore} onStoreChange={onFloorStoreChange} collapsed={rightCollapsed} onToggleCollapse={onToggleRight} />
      </section>
    );
  }

  if (route === "analytics") {
    return <AnalyticsPlaceholder />;
  }

  if (route === "operations") {
    return <OperationsModule viewMode={opsViewMode} />;
  }

  return null;
}
