import type { FloorEditorStore } from "../state/editorStore";
import { addChair, removeChair, rotateProp, rotateTable } from "../state/editorStore";

interface RightInspectorPanelProps {
  store: FloorEditorStore;
  onStoreChange(next: FloorEditorStore): void;
  collapsed: boolean;
  onToggleCollapse(): void;
}

export function RightInspectorPanel({ store, onStoreChange, collapsed, onToggleCollapse }: RightInspectorPanelProps) {
  const selectedTable =
    store.selectedObjectType === "table"
      ? store.tables.find((table) => table.tableId === store.selectedObjectId) ?? null
      : null;
  const selectedProp =
    store.selectedObjectType === "prop"
      ? store.props.find((prop) => prop.propId === store.selectedObjectId) ?? null
      : null;
  const lastChairId = selectedTable?.chairs.at(-1)?.chairId ?? null;

  if (collapsed) {
    return (
      <aside style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 6, display: "grid", gap: 8, justifyItems: "center", alignContent: "start", height: "100%", boxSizing: "border-box" }}>
        <button title="Open Inspector" onClick={onToggleCollapse} style={{ borderRadius: 8, border: "1px solid #d1d5db", width: 34, height: 34, fontSize: 16, lineHeight: 1 }}>
          ☰
        </button>
        <button title="Inspector" onClick={onToggleCollapse} style={{ borderRadius: 8, border: "1px solid #d1d5db", width: 34, height: 34, fontSize: 16, lineHeight: 1 }}>
          ⚙
        </button>
      </aside>
    );
  }

  return (
    <aside style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, height: "100%", boxSizing: "border-box", overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h3 style={{ margin: 0 }}>Inspector</h3>
        <button onClick={onToggleCollapse} title="Collapse" style={{ borderRadius: 8, border: "1px solid #d1d5db", padding: "4px 8px" }}>
          ⇥
        </button>
      </div>

      {!selectedTable && !selectedProp && <p style={{ color: "#6b7280" }}>Select a table or prop.</p>}

      {selectedTable && (
        <div style={{ fontSize: 14, lineHeight: 1.55 }}>
          <div><strong>ID:</strong> {selectedTable.tableId}</div>
          <div><strong>Label:</strong> {selectedTable.label}</div>
          <div><strong>X/Y:</strong> {Math.round(selectedTable.x)} / {Math.round(selectedTable.y)}</div>
          <div><strong>Size:</strong> {Math.round(selectedTable.width)} x {Math.round(selectedTable.height)}</div>
          <div><strong>Seats:</strong> {selectedTable.seatCount}</div>
          <div><strong>Rotation:</strong> {Math.round(selectedTable.rotation)}°</div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>Resize directly from the blue canvas handle.</div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            <button onClick={() => onStoreChange(rotateTable(store, selectedTable.tableId, selectedTable.rotation + 15))}>
              Rotate +15°
            </button>
            <button onClick={() => onStoreChange(addChair(store, selectedTable.tableId))}>Add Chair</button>
            <button
              onClick={() => {
                if (!lastChairId) return;
                onStoreChange(removeChair(store, selectedTable.tableId, lastChairId));
              }}
              disabled={!lastChairId}
            >
              Delete Chair
            </button>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Seats</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selectedTable.chairs.map((chair) => (
                <button
                  key={chair.chairId}
                  title="Seat"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "1px solid #9ca3af",
                    background: "#ffffff",
                    color: "#6b7280",
                    fontSize: 11,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  ○
                </button>
              ))}
              {selectedTable.chairs.length === 0 && <span style={{ fontSize: 12, color: "#6b7280" }}>No seats yet.</span>}
            </div>
          </div>
        </div>
      )}

      {selectedProp && (
        <div style={{ fontSize: 14, lineHeight: 1.55 }}>
          <div><strong>ID:</strong> {selectedProp.propId}</div>
          <div><strong>Type:</strong> {selectedProp.propType}</div>
          <div><strong>X/Y:</strong> {Math.round(selectedProp.x)} / {Math.round(selectedProp.y)}</div>
          <div><strong>Size:</strong> {Math.round(selectedProp.width)} x {Math.round(selectedProp.height)}</div>
          <div><strong>Rotation:</strong> {Math.round(selectedProp.rotation)}°</div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            <button onClick={() => onStoreChange(rotateProp(store, selectedProp.propId, selectedProp.rotation + 15))}>
              Rotate +15°
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
