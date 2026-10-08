export const STATUS_COLOR_TOKENS = {
  available_empty: "transparent",
  occupied_idle: "#e5e7eb",
  new_order: "#fde68a",
  order_accepted: "#93c5fd",
  ready_pickup: "#fca5a5",
  customer_request: "#ef4444",
  delivering: "#c4b5fd",
  delivered: "transparent",
  cleaning: "#67e8f9",
  reserved_only: "#f59e0b",
} as const;

export type StatusColorTokenName = keyof typeof STATUS_COLOR_TOKENS;
