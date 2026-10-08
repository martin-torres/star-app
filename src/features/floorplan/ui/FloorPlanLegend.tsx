import { STATUS_COLOR_TOKENS } from "../../../shared/ui/tokens/statusColors";
import type { TableStatus } from "../status";

/**
 * The ONE legend. Same swatch, same wording, wherever a floor plan is shown.
 */

const STATUS_ORDER: Array<{ status: TableStatus; label: string }> = [
  { status: "customer_request", label: "Necesita atención" },
  { status: "ready_pickup", label: "Listo para servir" },
  { status: "order_accepted", label: "En preparación" },
  { status: "new_order", label: "Orden nueva" },
  { status: "delivering", label: "Entregando" },
  { status: "cleaning", label: "Limpiando" },
  { status: "reserved_only", label: "Reservada" },
  { status: "occupied_idle", label: "Ocupada" },
  { status: "available_empty", label: "Disponible" },
];

export interface FloorPlanLegendProps {
  variant?: "status" | "availability";
  className?: string;
  style?: React.CSSProperties;
}

export function FloorPlanLegend({ variant = "status", className, style }: FloorPlanLegendProps) {
  const entries =
    variant === "availability"
      ? [
          { color: "#ffffff", label: "Disponible", border: "#22c55e" },
          { color: STATUS_COLOR_TOKENS.occupied_idle, label: "Ocupada", border: "#d1d5db" },
        ]
      : STATUS_ORDER.map(({ status, label }) => ({
          color: STATUS_COLOR_TOKENS[status],
          label,
          border: "#d1d5db",
        }));

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        fontSize: 10,
        lineHeight: 1.3,
        ...style,
      }}
    >
      {entries.map((entry) => (
        <span key={entry.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            aria-hidden
            style={{
              width: 11,
              height: 11,
              borderRadius: 3,
              backgroundColor: entry.color,
              border: `1.5px solid ${entry.border}`,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#4b5563" }}>{entry.label}</span>
        </span>
      ))}
    </div>
  );
}
