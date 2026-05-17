import type { ChairNode } from "../domain/layoutTypes";

interface ChairEditorOverlayProps {
  tableId: string;
  chairs: ChairNode[];
  onRemove(chairId: string): void;
  visible: boolean;
}

export function ChairEditorOverlay({ tableId, chairs, onRemove, visible }: ChairEditorOverlayProps) {
  if (!visible) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <strong style={{ fontSize: 13 }}>Chairs ({chairs.length})</strong>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {chairs.map((chair) => (
          <button
            key={chair.chairId}
            onClick={() => onRemove(chair.chairId)}
            title={`Remove ${chair.chairId}`}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 999,
              padding: "4px 8px",
              fontSize: 11,
              background: "#fff",
            }}
          >
            {tableId}:{chair.chairId}
          </button>
        ))}
      </div>
    </div>
  );
}
