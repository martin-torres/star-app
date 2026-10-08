import { useEffect, useMemo, useState, type CSSProperties, type DragEvent, type MouseEvent } from "react";
import type { FloorPropType, TableType } from "../domain/layoutTypes";
import type { FloorEditorStore } from "../state/editorStore";
import {
  FLOOR_BOUNDS,
  PROP_ICONS,
  RESIZE_LIMITS,
  chairNodesFor,
  floorGridBackground,
  projectChairToPerimeter,
  tableShapeStyle,
} from "../../../floorplan/ui/primitives";
import { ChairDots, TableBody } from "../../../floorplan/ui/TableBody";
import { resolveTableVisualState, type TableStatusInput } from "../../../floorplan/status";
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

/**
 * The floor-plan EDITOR.
 *
 * Geometry, shapes, chairs, prop icons and table content all come from the
 * shared floor-plan primitives in `src/features/floorplan/ui/`, so the editor is
 * pixel-identical to the customer picker and the manager live view. This file
 * adds only the authoring chrome (tool mode, drag, resize handles).
 */

interface FloorCanvasProps {
  store: FloorEditorStore;
  onStoreChange(next: FloorEditorStore): void;
  addTableType: TableType;
  addPropType: FloorPropType;
  tableStatusMap?: Record<string, TableStatusInput>;
}

const BOUNDS = FLOOR_BOUNDS;
const LIMITS = RESIZE_LIMITS;

type DragState =
  | { type: "move_table"; id: string; startX: number; startY: number; originX: number; originY: number }
  | { type: "move_prop"; id: string; startX: number; startY: number; originX: number; originY: number }
  | { type: "resize_table"; id: string; startX: number; startY: number; originW: number; originH: number }
  | { type: "resize_prop"; id: string; startX: number; startY: number; originW: number; originH: number }
  | { type: "move_chair"; tableId: string; chairId: string; tableX: number; tableY: number; tableW: number; tableH: number }
  | null;

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
            chairs: chairNodesFor(tableId, 4).map((chair) => ({ ...chair, tableId })),
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
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    ...floorGridBackground(),
  };

  const tableChairMap = useMemo(
    () =>
      new Map(
        store.tables.map((t) => [
          t.tableId,
          t.chairs.length > 0 ? t.chairs : chairNodesFor(t.tableId, t.seatCount).map((chair) => ({ ...chair, tableId: t.tableId })),
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
        try {
          return [table.tableId, resolveTableVisualState(statusInput)] as const;
        } catch {
          return [table.tableId, null] as const;
        }
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
                fontWeight: 700,
                cursor: store.toolMode === "select" ? "grab" : "pointer",
                userSelect: "none",
                ...tableShapeStyle(table.tableType),
              }}
            >
              <TableBody
                shape={table.tableType}
                label={table.label}
                tableNumber={Number(table.label.replace(/\D/g, "")) || 0}
                seats={table.seatCount}
                rotation={table.rotation}
              />

              <ChairDots
                chairs={chairs}
                size={10}
                title="Drag to move. Right-click to remove."
                onChairPointerDown={(chairId, event) => handleChairMouseDown(table.tableId, chairId, event)}
                onChairContextMenu={(chairId, event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onStoreChange(removeChair(store, table.tableId, chairId));
                }}
              />

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
