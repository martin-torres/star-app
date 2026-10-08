export type PendingAction =
  | "switch_selection"
  | "switch_tool"
  | "close_inspector"
  | "add_new_object";

export interface UnsavedChangesState {
  hasUnsavedChanges: boolean;
  pendingAction: PendingAction | null;
  promptOpen: boolean;
}

export const initialUnsavedChangesState: UnsavedChangesState = {
  hasUnsavedChanges: false,
  pendingAction: null,
  promptOpen: false,
};

export function markDirty(state: UnsavedChangesState): UnsavedChangesState {
  return {
    ...state,
    hasUnsavedChanges: true,
  };
}

export function requestTransition(
  state: UnsavedChangesState,
  action: PendingAction,
): UnsavedChangesState {
  if (!state.hasUnsavedChanges) {
    return {
      ...state,
      pendingAction: action,
      promptOpen: false,
    };
  }

  return {
    ...state,
    pendingAction: action,
    promptOpen: true,
  };
}

export function resolvePrompt(
  state: UnsavedChangesState,
  decision: "save" | "discard" | "cancel",
): UnsavedChangesState {
  if (decision === "cancel") {
    return {
      ...state,
      promptOpen: false,
      pendingAction: null,
    };
  }

  return {
    hasUnsavedChanges: false,
    promptOpen: false,
    pendingAction: null,
  };
}
