export interface DayThresholdSummary {
  promotions: number;
  events: number;
  warn: boolean;
}

export function shouldWarnDay(promotions: number, events: number): boolean {
  return promotions > 2 || events > 2;
}

export function summarizeDay(promotions: number, events: number): DayThresholdSummary {
  return { promotions, events, warn: shouldWarnDay(promotions, events) };
}
