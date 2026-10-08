import type { TableStatus, TableStatusInput, UrgencyStatus } from "./statusTypes";

const URGENCY_ORDER_LOW_TO_HIGH: UrgencyStatus[] = [
  "available_empty",
  "occupied_idle",
  "new_order",
  "order_accepted",
  "ready_pickup",
  "customer_request",
];

const URGENCY_RANK: Record<UrgencyStatus, number> = URGENCY_ORDER_LOW_TO_HIGH.reduce(
  (acc, status, idx) => {
    acc[status] = idx;
    return acc;
  },
  {} as Record<UrgencyStatus, number>,
);

const POST_SERVICE_ORDER: TableStatus[] = ["delivered", "cleaning"];

function sortByUrgencyDescending(statuses: UrgencyStatus[]): UrgencyStatus[] {
  return [...statuses].sort((a, b) => URGENCY_RANK[b] - URGENCY_RANK[a]);
}

export interface ResolvedStatuses {
  primaryStatus: TableStatus | null;
  secondaryStatus: TableStatus | null;
}

export function resolveTableStatuses(input: TableStatusInput): ResolvedStatuses {
  const normalized = new Set(input.statusList);

  const urgencyStatuses = Array.from(normalized).filter(
    (status): status is UrgencyStatus => status in URGENCY_RANK,
  );

  if (urgencyStatuses.length > 0) {
    const sorted = sortByUrgencyDescending(urgencyStatuses);
    const fallbackSecondary = sorted[1] ?? null;

    return {
      primaryStatus: sorted[0],
      secondaryStatus: normalized.has("delivering") ? "delivering" : fallbackSecondary,
    };
  }

  if (normalized.has("delivering")) {
    return {
      primaryStatus: "delivering",
      secondaryStatus: null,
    };
  }

  const postServiceStatus = POST_SERVICE_ORDER.find((status) => normalized.has(status));
  if (postServiceStatus) {
    return {
      primaryStatus: postServiceStatus,
      secondaryStatus: null,
    };
  }

  if (input.isOccupied) {
    return {
      primaryStatus: "occupied_idle",
      secondaryStatus: null,
    };
  }

  if (input.isReserved) {
    return {
      primaryStatus: null,
      secondaryStatus: "reserved_only",
    };
  }

  return {
    primaryStatus: null,
    secondaryStatus: null,
  };
}
