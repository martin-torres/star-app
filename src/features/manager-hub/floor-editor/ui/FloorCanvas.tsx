import { useEffect, useMemo, useState, type CSSProperties, type DragEvent, type MouseEvent } from "react";
import type { ChairNode, FloorPropType, TableType } from "../domain/layoutTypes";
import type { FloorEditorStore } from "../state/editorStore";
import { resolveTableVisualState } from "../../../floorplan/presentation/tableVisualState";
import type { TableStatusInput } from "../../../floorplan/domain/statusTypes";
import {
  addPropAt,
  addTableAt,
  moveChair,
  moveProp,
  moveTable,
  removeChair,
  removeProp,
  removeTable,
  resizeProp,
  resizeTable,
  setToolMode,
  selectObject,
} from "../state/editorStore";

interface FloorCanvasProps {
  store: FloorEditorStore;
  onStoreChange(next: FloorEditorStore): void;
  addTableType: TableType;
  addPropType: FloorPropType;
  tableStatusMap?: Record<string, TableStatusInput>;
}

const BOUNDS = { minX: 0, minY: 0, maxX: 680, maxY: 400 };
const LIMITS = { minWidth: 40, minHeight: 30, maxWidth: 240, maxHeight: 220 };
const PROP_ICONS: Record<FloorPropType, string> = {
  stage: "◫",
  bathroom: "🚻",
  staircase: "⇅",
  window: "▣",
  main_door: "⎋",
  door: "⟂",
  kitchen_area: "🍽",
};
const TABLE_ICONS: Record<TableType, string> = {
  square: "◼",
  rectangle: "▭",
  circular: "◯",
  booth: "⌷",
  l_shaped: "└",
};

type DragState =
  | { type: "move_table"; id: string; startX: number; startY: number; originX: number; originY: number }
  | { type: "move_prop"; id: string; startX: number; startY: number; originX: number; originY: number }
  | { type: "resize_table"; id: string; startX: number; startY: number; originW: number; originH: number }
  | { type: "resize_prop"; id: string; startX: number; startY: number; originW: number; originH: number }
  | { type: "move_chair"; tableId: string; chairId: string; tableX: number; tableY: number; tableW: number; tableH: number }
  | null;

function generateChairNodes(tableId: string, seatCount: number): ChairNode[] {
  const nodes: ChairNode[] = [];
  for (let i = 0; i < seatCount; i += 1) {
    const angle = (2 * Math.PI * i) / seatCount;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absX > absY) {
      nodes.push({
        chairId: `${tableId}-AUTO-${i + 1}`,
        tableId,
        offsetX: x > 0 ? 0.5 : -0.5,
        offsetY: Math.max(-0.5, Math.min(0.5, y / absX / 2)),
        active: true,
      });
    } else {
      nodes.push({
        chairId: `${tableId}-AUTO-${i + 1}`,
        tableId,
        offsetX: Math.max(-0.5, Math.min(0.5, x / absY / 2)),
        offsetY: y > 0 ? 0.5 : -0.5,
        active: true,
      });
    }
  }
  return nodes;
}

function projectChairToPerimeter(px: number, py: number, width: number, height: number): { x: number; y: number } {
  const cx = width / 2;
  const cy = height / 2;
  const dx = px - cx;
  const dy = py - cy;
  const nx = dx / Math.max(width / 2, 1);
  const ny = dy / Math.max(height / 2, 1);
  const absX = Math.abs(nx);
  const absY = Math.abs(ny);

  if (absX >= absY) {
    return {
      x: nx >= 0 ? 0.5 : -0.5,
      y: Math.max(-0.5, Math.min(0.5, ny / Math.max(absX, 0.0001))),
    };
  }

  return {
    x: Math.max(-0.5, Math.min(0.5, nx / Math.max(absY, 0.0001))),
    y: ny >= 0 ? 0.5 : -0.5,
  };
}

function tableShapeStyle(tableType: TableType): Partial<CSSProperties> {
  if (tableType === "circular") return { borderRadius: "999px" };
  if (tableType === "booth") return { borderRadius: "14px 14px 4px 4px" };
  if (tableType === "l_shaped") return { clipPath: "polygon(0% 0%, 100% 0%, 100% 35%, 65% 35%, 65% 100%, 0% 100%)" };
  if (tableType === "square") return { borderRadius: 6 };
  return { borderRadius: 10 };
}

export function FloorCanvas({ store, onStoreChange, addTableType, addPropType, tableStatusMap }: FloorCanvasProps) {
  const [drag, setDrag] = useState<DragState>(null);

  function placeTableAt(x: number, y: number, tableType: TableType) {
    const tableId = `T${store.tables.length + 1}`;
    onStoreChange(
      setToolMode(
        addTableAt(
          store,
          {
            tableId,
            tableType,
            label: tableId,
            width: tableType === "square" ? 84 : 96,
            height: tableType === "square" ? 84 : tableType === "circular" ? 88 : 64,
            rotation: 0,
            seatCount: 4,
            seatOverride: false,
            chairs: generateChairNodes(tableId, 4),
          },
          x,
          y,
          BOUNDS,
        ),
        "select",
      ),
    );
  }

  function placePropAt(x: number, y: number, propType: FloorPropType) {
    onStoreChange(setToolMode(addPropAt(store, propType, x, y, BOUNDS), "select"));
  }

  useEffect(() => {
    function onMove(ev: globalThis.MouseEvent) {
      if (!drag) return;

      if (drag.type === "move_table") {
        const dx = ev.clientX - drag.startX;
        const dy = ev.clientY - drag.startY;
        onStoreChange(moveTable(store, drag.id, drag.originX + dx, drag.originY + dy, BOUNDS));
      }

      if (drag.type === "move_prop") {
        const dx = ev.clientX - drag.startX;
        const dy = ev.clientY - drag.startY;
        onStoreChange(moveProp(store, drag.id, drag.originX + dx, drag.originY + dy, BOUNDS));
      }

      if (drag.type === "resize_table") {
        const dx = ev.clientX - drag.startX;
        const dy = ev.clientY - drag.startY;
        onStoreChange(resizeTable(store, drag.id, drag.originW + dx, drag.originH + dy, LIMITS, BOUNDS));
      }
      if (drag.type === "resize_prop") {
        const dx = ev.clientX - drag.startX;
        const dy = ev.clientY - drag.startY;
        onStoreChange(resizeProp(store, drag.id, drag.originW + dx, drag.originH + dy, LIMITS));
      }

      if (drag.type === "move_chair") {
        const localX = ev.clientX - drag.tableX;
        const localY = ev.clientY - drag.tableY;
        const projected = projectChairToPerimeter(localX, localY, drag.tableW, drag.tableH);
        onStoreChange(moveChair(store, drag.tableId, drag.chairId, projected.x, projected.y));
      }
    }

    function onUp() {
      if (drag) setDrag(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, onStoreChange, store]);

  function handleCanvasClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (store.toolMode === "add_table") {
      placeTableAt(x, y, addTableType);
      return;
    }

    if (store.toolMode === "add_prop") {
      placePropAt(x, y, addPropType);
      return;
    }

    onStoreChange(selectObject(store, null, null));
  }
  function handleCanvasDragOver(event: DragEvent<HTMLDivElement>) {
    if (event.dataTransfer.types.includes("application/x-floor-editor-item")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function handleCanvasDrop(event: DragEvent<HTMLDivElement>) {
    const raw = event.dataTransfer.getData("application/x-floor-editor-item");
    if (!raw) return;
    event.preventDefault();
    event.stopPropagation();

    try {
      const payload = JSON.parse(raw) as
        | { kind: "table"; tableType: TableType }
        | { kind: "prop"; propType: FloorPropType };

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (payload.kind === "table") {
        placeTableAt(x, y, payload.tableType);
      } else if (payload.kind === "prop") {
        placePropAt(x, y, payload.propType);
      }
    } catch {
      // Ignore invalid drag payloads.
    }
  }

  function handleTableMouseDown(tableId: string, event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();

    if (store.toolMode === "delete") {
      onStoreChange(removeTable(store, tableId));
      return;
    }

    const current = store.tables.find((table) => table.tableId === tableId);
    if (!current) return;

    onStoreChange(selectObject(store, "table", tableId));

    if (store.toolMode !== "add_prop" && store.toolMode !== "add_table") {
      setDrag({ type: "move_table", id: tableId, startX: event.clientX, startY: event.clientY, originX: current.x, originY: current.y });
    }
  }

  function handlePropMouseDown(propId: string, event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();

    if (store.toolMode === "delete") {
      onStoreChange(removeProp(store, propId));
      return;
    }

    const current = store.props.find((prop) => prop.propId === propId);
    if (!current) return;

    onStoreChange(selectObject(store, "prop", propId));

    if (store.toolMode !== "add_prop" && store.toolMode !== "add_table") {
      setDrag({ type: "move_prop", id: propId, startX: event.clientX, startY: event.clientY, originX: current.x, originY: current.y });
    }
  }

  function handleResizeDown(tableId: string, event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    const current = store.tables.find((table) => table.tableId === tableId);
    if (!current) return;
    setDrag({ type: "resize_table", id: tableId, startX: event.clientX, startY: event.clientY, originW: current.width, originH: current.height });
  }
  function handlePropResizeDown(propId: string, event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    const current = store.props.find((prop) => prop.propId === propId);
    if (!current) return;
    setDrag({ type: "resize_prop", id: propId, startX: event.clientX, startY: event.clientY, originW: current.width, originH: current.height });
  }

  function handleChairMouseDown(tableId: string, chairId: string, event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    const table = store.tables.find((t) => t.tableId === tableId);
    if (!table) return;

    onStoreChange(selectObject(store, "table", tableId));

    const tableRect = (event.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    setDrag({
      type: "move_chair",
      tableId,
      chairId,
      tableX: tableRect.left,
      tableY: tableRect.top,
      tableW: table.width,
      tableH: table.height,
    });
  }

  const canvasStyle: CSSProperties = {
    width: BOUNDS.maxX,
    height: BOUNDS.maxY,
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background:
      "linear-gradient(0deg, rgba(243,244,246,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(243,244,246,0.55) 1px, transparent 1px)",
    backgroundSize: "24px 24px",
    position: "relative",
    overflow: "hidden",
  };

  const tableChairMap = useMemo(
    () =>
      new Map(
        store.tables.map((t) => [
          t.tableId,
          t.chairs.length > 0 ? t.chairs : generateChairNodes(t.tableId, t.seatCount),
        ]),
      ),
    [store.tables],
  );

  const resolvedVisualStates = useMemo(() => {
    return new Map(
      store.tables.map((table) => {
        const statusInput = tableStatusMap?.[table.tableId];
        if (!statusInput) {
          return [table.tableId, null] as const;
        }
        return [table.tableId, resolveTableVisualState(statusInput)] as const;
      }),
    );
  }, [store.tables, tableStatusMap]);

  return (
    <div>
      <div style={{ marginBottom: 8, fontSize: 12, color: "#4b5563" }}>
        Tool: <strong>{store.toolMode}</strong> | Drag tables/props/chairs. Right-click any object to remove.
      </div>
      <div style={canvasStyle} onClick={handleCanvasClick} onDragOver={handleCanvasDragOver} onDrop={handleCanvasDrop}>
        {store.props.map((prop) => {
          const selected = store.selectedObjectId === prop.propId && store.selectedObjectType === "prop";
          return (
            <div
              key={prop.propId}
              onMouseDown={(event) => handlePropMouseDown(prop.propId, event)}
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onStoreChange(removeProp(store, prop.propId));
              }}
              style={{
                position: "absolute",
                left: prop.x,
                top: prop.y,
                width: prop.width,
                height: prop.height,
                transform: `rotate(${prop.rotation}deg)`,
                borderRadius: 6,
                border: selected ? "2px dashed #0ea5e9" : "1px dashed #0f766e",
                background: "rgba(20,184,166,0.08)",
                display: "grid",
                placeItems: "center",
                fontSize: 11,
                fontWeight: 600,
                cursor: store.toolMode === "select" ? "grab" : "pointer",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  transform: `rotate(${-prop.rotation}deg)`,
                  fontSize: 18,
                  lineHeight: 1,
                  pointerEvents: "none",
                }}
                title={prop.propType}
              >
                {PROP_ICONS[prop.propType]}
              </div>
              {selected && (
                <div
                  onMouseDown={(event) => handlePropResizeDown(prop.propId, event)}
                  style={{
                    position: "absolute",
                    right: -6,
                    bottom: -6,
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#0ea5e9",
                    border: "1px solid #fff",
                    cursor: "nwse-resize",
                  }}
                />
              )}
            </div>
          );
        })}

        {store.tables.map((table) => {
          const selected = store.selectedObjectId === table.tableId && store.selectedObjectType === "table";
          const chairs = tableChairMap.get(table.tableId) ?? [];
          const visualState = resolvedVisualStates.get(table.tableId) ?? null;

          const statusBackground = visualState?.render.background ?? null;
          const statusBorder = visualState?.render.outerRim ?? null;

          return (
            <div
              key={table.tableId}
              onMouseDown={(event) => handleTableMouseDown(table.tableId, event)}
              onClick={(event) => event.stopPropagation()}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onStoreChange(removeTable(store, table.tableId));
              }}
              style={{
                position: "absolute",
                left: table.x,
                top: table.y,
                width: table.width,
                height: table.height,
                transform: `rotate(${table.rotation}deg)`,
                border: selected
                  ? "2px solid #2563eb"
                  : statusBorder
                    ? `3px solid ${statusBorder}`
                    : "1px solid #111827",
                background: statusBackground ?? "#f9fafb",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 700,
                cursor: store.toolMode === "select" ? "grab" : "pointer",
                userSelect: "none",
                ...tableShapeStyle(table.tableType),
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  lineHeight: 1.15,
                  pointerEvents: "none",
                  transform: `rotate(${-table.rotation}deg)`,
                }}
              >
                <div style={{ fontSize: 14, lineHeight: 1 }}>{TABLE_ICONS[table.tableType]}</div>
                <div style={{ fontSize: 10, color: "#111827", fontWeight: 700 }}>{table.label}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>{table.seatCount}</div>
              </div>

              {chairs.map((chair) => (
                <div
                  key={chair.chairId}
                  onMouseDown={(event) => handleChairMouseDown(table.tableId, chair.chairId, event)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onStoreChange(removeChair(store, table.tableId, chair.chairId));
                  }}
                  title="Drag to move. Right-click to remove."
                  style={{
                    position: "absolute",
                    left: `${(chair.offsetX + 0.5) * 100}%`,
                    top: `${(chair.offsetY + 0.5) * 100}%`,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#ffffff",
                    border: "1.5px solid #111827",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "auto",
                    cursor: "grab",
                  }}
                />
              ))}

              {selected && (
                <div
                  onMouseDown={(event) => handleResizeDown(table.tableId, event)}
                  style={{
                    position: "absolute",
                    right: -6,
                    bottom: -6,
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#2563eb",
                    border: "1px solid #fff",
                    cursor: "nwse-resize",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
