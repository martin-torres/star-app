export interface SeatSizingBucket {
  minArea: number;
  maxArea: number;
  seats: number;
}

export const DEFAULT_SEAT_SIZING_BUCKETS: SeatSizingBucket[] = [
  { minArea: 0, maxArea: 5999, seats: 2 },
  { minArea: 6000, maxArea: 9999, seats: 4 },
  { minArea: 10000, maxArea: 16999, seats: 6 },
  { minArea: 17000, maxArea: 23999, seats: 8 },
  { minArea: 24000, maxArea: Number.POSITIVE_INFINITY, seats: 10 },
];

export function resolveAutoSeatCount(
  width: number,
  height: number,
  buckets: SeatSizingBucket[] = DEFAULT_SEAT_SIZING_BUCKETS,
): number {
  const area = Math.max(0, width) * Math.max(0, height);
  const match = buckets.find((bucket) => area >= bucket.minArea && area <= bucket.maxArea);
  return match?.seats ?? 2;
}

export function previewSeatChange(
  width: number,
  height: number,
  previousSeats: number,
  buckets: SeatSizingBucket[] = DEFAULT_SEAT_SIZING_BUCKETS,
): { previousSeats: number; nextSeats: number; changed: boolean } {
  const nextSeats = resolveAutoSeatCount(width, height, buckets);
  return {
    previousSeats,
    nextSeats,
    changed: nextSeats !== previousSeats,
  };
}
