import type { TableStatusInput } from "../domain/statusTypes";
import { resolveTableVisualState, type TableVisualState } from "../presentation/tableVisualState";

type Listener = (state: TableVisualState) => void;

export class TableStatusSyncService {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(update: TableStatusInput): TableVisualState {
    const visualState = resolveTableVisualState(update);
    this.listeners.forEach((listener) => listener(visualState));
    return visualState;
  }
}
