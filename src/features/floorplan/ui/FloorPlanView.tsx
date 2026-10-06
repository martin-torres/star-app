import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { chairNodesFor, floorGridBackground, propIcon, tableShapeStyle } from "./primitives";
import { ChairDots, TableBody } from "./TableBody";
import type { FloorPlan, FloorPlanTable } from "../model/floorPlan";
import { resolveTableVisualState, type TableStatusInput } from "../status";

/**
 * THE floor-plan renderer. Every screen that shows a floor plan, table map or
 * layout renders through this component, from the same `FloorPlan` object.
 *
 * Modes:
 *   select - customer table picker: available tables are tappable, others dimmed
 *   live   - manager/FOH live view: status colours, optional selection for an inspector
 *   status - kitchen/analytics board: status colours + legend, read-only
 *
 * The editor (`FloorCanvas`) draws its drag handles on top of these same
 * primitives, so edit and view are geometrically identical.
 */

export type FloorPlanMode = "select" | "live" | "status";

export interface FloorPlanViewProps {
  plan: FloorPlan;
  mode?: FloorPlanMode;
  /** Status per table id. Absent -> neutral default fill. */
  statusMap?: Record<string, TableStatusInput>;
  selectedTableId?: string | null;
  onSelectTable?: (tableId: string) => void;
  /** Accent for selection ring / hover; defaults to the restaurant primary. */
  accentColor?: string;
  showProps?: boolean;
  showLabels?: boolean;
  maxScale?: number;
  minScale?: number;
  className?: string;
  style?: CSSProperties;
}

function safeStatus(
  table: FloorPlanTable,
  statusMap: Record<string, TableStatusInput> | undefined,
): { background: string | null; rim: string | null } {
  const input = statusMap?.[table.id];
  if (!input) return { background: null, rim: null };
  try {
    const state = resolveTableVisualState(input);
    return { background: state.render.background ?? null, rim: state.render.outerRim ?? null };
  } catch {
    // An unknown status must never white-screen a customer/kitchen surface.
    return { background: null, rim: null };
  }
}

export function FloorPlanView({
  plan,
  mode = "live",
  statusMap,
  selectedTableId = null,
  onSelectTable,
  accentColor = "#2563eb",
  showProps = true,
  showLabels = true,
  maxScale = 1.75,
  minScale = 0.28,
  className,
  style,
}: FloorPlanViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(width);
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  const canvas = plan.canvas;
  const scale = useMemo(() => {
    if (!containerWidth || canvas.width <= 0) return Math.min(1, maxScale);
    const raw = containerWidth / canvas.width;
    return Math.max(minScale, Math.min(maxScale, raw));
  }, [containerWidth, canvas.width, minScale, maxScale]);

  const chairsByTable = useMemo(
    () => new Map(plan.tables.map((table) => [table.id, table.chairs.length > 0 ? table.chairs : chairNodesFor(table.id, table.seats)])),
    [plan.tables],
  );

  const interactive = Boolean(onSelectTable);
  const scaledHeight = canvas.height * scale;

  const canvasStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: canvas.width,
    height: canvas.height,
    border: "1px solid #d1d5db",
    borderRadius: 12,
    overflow: "hidden",
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    backgroundColor: "#ffffff",
    ...floorGridBackground(canvas.gridSize || 24),
  };

  return (
    <div ref={containerRef} className={className} style={{ position: "relative", width: "100%", height: scaledHeight, ...style }}>
      <div style={canvasStyle} data-floorplan-canvas>
        {showProps &&
          plan.props.map((prop) => (
            <div
              key={prop.id}
              title={prop.kind}
              style={{
                position: "absolute",
                left: prop.x,
                top: prop.y,
                width: prop.width,
                height: prop.height,
                transform: `rotate(${prop.rotation}deg)`,
                borderRadius: 6,
                border: "1px dashed #0f766e",
                background: "rgba(20,184,166,0.08)",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              <div style={{ transform: `rotate(${-prop.rotation}deg)`, lineHeight: 1 }}>{propIcon(prop)}</div>
            </div>
          ))}

        {plan.tables.map((table) => {
          const selected = selectedTableId === table.id;
          const { background, rim } = safeStatus(table, statusMap);
          const dimmed = mode === "select" && !table.isAvailable;
          const clickable = interactive && (mode !== "select" || table.isAvailable);
          const chairs = chairsByTable.get(table.id) ?? [];

          const border = selected
            ? `2px solid ${accentColor}`
            : rim
              ? `3px solid ${rim}`
              : "1px solid #111827";

          const tableStyle: CSSProperties = {
            position: "absolute",
            left: table.x,
            top: table.y,
            width: table.width,
            height: table.height,
            transform: `rotate(${table.rotation}deg)`,
            border,
            background: background ?? "#f9fafb",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            opacity: dimmed ? 0.45 : 1,
            cursor: clickable ? "pointer" : mode === "select" ? "not-allowed" : "default",
            userSelect: "none",
            padding: 0,
            boxShadow: selected ? `0 0 0 3px ${accentColor}33` : undefined,
            transition: "box-shadow 120ms ease, opacity 120ms ease",
            ...tableShapeStyle(table.shape),
          };

          const content = (
            <TableBody
              shape={table.shape}
              label={table.label}
              tableNumber={table.tableNumber}
              seats={table.seats}
              rotation={table.rotation}
              variant={mode === "select" ? "number" : "label"}
              showLabels={showLabels}
            />
          );

          const chairsLayer = <ChairDots chairs={chairs} />;

          if (clickable) {
            return (
              <button
                key={table.id}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectTable?.(table.id);
                }}
                aria-pressed={selected}
                aria-label={`Mesa ${table.tableNumber}`}
                style={tableStyle}
              >
                {content}
                {chairsLayer}
              </button>
            );
          }

          return (
            <div key={table.id} title={`Mesa ${table.tableNumber}`} style={tableStyle}>
              {content}
              {chairsLayer}
            </div>
          );
        })}
      </div>
    </div>
  );
}
