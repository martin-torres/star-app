import { resolveTableStatuses } from "../domain/statusPriority";
import {
  assertKnownStatuses,
  type TableStatus,
  type TableStatusInput,
} from "../domain/statusTypes";
import { statusToColor } from "./tableColorMap";

export interface TableVisualState {
  tableId: string;
  primaryStatus: TableStatus | null;
  secondaryStatus: TableStatus | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  render: {
    background: string | null;
    outerRim: string | null;
  };
}

interface ResolveTableVisualStateOptions {
  colorResolver?: (status: TableStatus | null) => string | null;
}

export function resolveTableVisualState(
  input: TableStatusInput,
  options: ResolveTableVisualStateOptions = {},
): TableVisualState {
  assertKnownStatuses(input.statusList);

  const { primaryStatus, secondaryStatus } = resolveTableStatuses(input);
  const resolveColor = options.colorResolver ?? statusToColor;

  const primaryColor = resolveColor(primaryStatus);
  const secondaryColor = resolveColor(secondaryStatus);

  const unifiedSecondary = primaryColor && secondaryColor && primaryColor === secondaryColor;

  const hasVisiblePrimary = primaryColor && primaryColor !== "transparent";
  const background = hasVisiblePrimary
    ? primaryColor
    : input.isOccupied
      ? resolveColor("occupied_idle")
      : primaryColor;

  return {
    tableId: input.tableId,
    primaryStatus,
    secondaryStatus,
    primaryColor,
    secondaryColor,
    render: {
      background,
      outerRim: unifiedSecondary ? primaryColor : secondaryColor,
    },
  };
}
