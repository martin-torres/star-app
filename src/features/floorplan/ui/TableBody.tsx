import type { MouseEvent } from "react";
import type { FloorPlanChair, TableShape } from "../model/floorPlan";
import { TABLE_ICONS } from "./primitives";

/**
 * The table's inner content and chair ring, shared verbatim by the floor-plan
 * VIEWER (`FloorPlanView`) and the floor-plan EDITOR (`FloorCanvas`). If the
 * editor and the live/customer views ever disagree about what a table looks
 * like, that is a bug in this file, not a per-surface decision.
 */

export interface TableBodyProps {
  shape: TableShape;
  label: string;
  tableNumber: number;
  seats: number;
  /** Counter-rotate so text stays upright when the table is rotated. */
  rotation?: number;
  /** select mode shows "#5"; every other mode shows the label. */
  variant?: "label" | "number";
  showLabels?: boolean;
}

export function TableBody({
  shape,
  label,
  tableNumber,
  seats,
  rotation = 0,
  variant = "label",
  showLabels = true,
}: TableBodyProps) {
  return (
    <div
      style={{
        textAlign: "center",
        lineHeight: 1.15,
        pointerEvents: "none",
        transform: `rotate(${-rotation}deg)`,
        color: "#111827",
      }}
    >
      <div style={{ fontSize: 12, lineHeight: 1 }}>{TABLE_ICONS[shape]}</div>
      {showLabels && (
        <>
          <div style={{ fontSize: 9, fontWeight: 700, whiteSpace: "nowrap" }}>
            {variant === "number" ? `#${tableNumber}` : label}
          </div>
          <div style={{ fontSize: 8, color: "#6b7280" }}>{seats}</div>
        </>
      )}
    </div>
  );
}

export interface ChairDotsProps {
  chairs: FloorPlanChair[];
  size?: number;
  /** Editor chairs are draggable; view chairs are inert. */
  onChairPointerDown?: (chairId: string, event: MouseEvent<HTMLDivElement>) => void;
  onChairContextMenu?: (chairId: string, event: MouseEvent<HTMLDivElement>) => void;
  title?: string;
}

export function ChairDots({
  chairs,
  size = 8,
  onChairPointerDown,
  onChairContextMenu,
  title,
}: ChairDotsProps) {
  return (
    <>
      {chairs.map((chair) => (
        <div
          key={chair.chairId}
          title={title}
          onMouseDown={onChairPointerDown ? (event) => onChairPointerDown(chair.chairId, event) : undefined}
          onContextMenu={
            onChairContextMenu ? (event) => onChairContextMenu(chair.chairId, event) : undefined
          }
          style={{
            position: "absolute",
            left: `${(chair.offsetX + 0.5) * 100}%`,
            top: `${(chair.offsetY + 0.5) * 100}%`,
            width: size,
            height: size,
            borderRadius: "50%",
            background: "#ffffff",
            border: "1.5px solid #111827",
            transform: "translate(-50%, -50%)",
            pointerEvents: onChairPointerDown ? "auto" : "none",
            cursor: onChairPointerDown ? "grab" : undefined,
          }}
        />
      ))}
    </>
  );
}
