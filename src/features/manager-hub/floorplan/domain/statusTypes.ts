export type UrgencyStatus =
  | "available_empty"
  | "occupied_idle"
  | "new_order"
  | "order_accepted"
  | "ready_pickup"
  | "customer_request";

export type PostServiceStatus =
  | "delivering"
  | "delivered"
  | "cleaning";

export type TableStatus = UrgencyStatus | PostServiceStatus | "reserved_only";

export const URGENCY_STATUSES: UrgencyStatus[] = [
  "available_empty",
  "occupied_idle",
  "new_order",
  "order_accepted",
  "ready_pickup",
  "customer_request",
];

export const POST_SERVICE_STATUSES: PostServiceStatus[] = [
  "delivering",
  "delivered",
  "cleaning",
];

export const SELECTABLE_STATUSES: TableStatus[] = [
  "new_order",
  "order_accepted",
  "ready_pickup",
  "customer_request",
  ...POST_SERVICE_STATUSES,
];

export interface TableStatusInput {
  tableId: string;
  isReserved: boolean;
  isOccupied: boolean;
  statusList: TableStatus[];
  updatedAt?: string;
}

const KNOWN_STATUS: Record<TableStatus, true> = {
  available_empty: true,
  occupied_idle: true,
  new_order: true,
  order_accepted: true,
  ready_pickup: true,
  customer_request: true,
  delivering: true,
  delivered: true,
  cleaning: true,
  reserved_only: true,
};

export function isKnownStatus(status: string): status is TableStatus {
  return status in KNOWN_STATUS;
}

export function assertKnownStatuses(statuses: string[]): asserts statuses is TableStatus[] {
  const unknown = statuses.filter((status) => !isKnownStatus(status));
  if (unknown.length > 0) {
    throw new Error(`Unknown table status: ${unknown.join(", ")}`);
  }
}
