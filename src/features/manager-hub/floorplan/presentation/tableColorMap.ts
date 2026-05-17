import { STATUS_COLOR_TOKENS } from "../../../../shared/ui/tokens/statusColors";
import type { TableStatus } from "../domain/statusTypes";

export function statusToColor(status: TableStatus | null): string | null {
  if (!status) {
    return null;
  }

  return STATUS_COLOR_TOKENS[status] ?? null;
}
