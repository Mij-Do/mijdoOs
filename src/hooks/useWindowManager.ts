import { useMemo, useReducer } from "react";
import type {
  WindowId,
  WindowManagerAction,
  WindowManagerState,
  WindowMap,
  WindowPosition,
  WindowState,
} from "../types/window";

const FIRST_Z_INDEX = 10;

function getTopmostWindowId(windows: WindowMap): WindowId | null {
  let topmostId: WindowId | null = null;
  let topmostZIndex = -1;

  for (const id of Object.keys(windows) as WindowId[]) {
    const windowState = windows[id];

    if (!windowState.isOpen || windowState.isMinimized) continue;
    if (windowState.zIndex <= topmostZIndex) continue;

    topmostId = id;
    topmostZIndex = windowState.zIndex;
  }

  return topmostId;
}

function isVisible(windowState: WindowState | undefined) {
  return Boolean(windowState?.isOpen && !windowState.isMinimized);
}

function setFocus(windows: WindowMap, activeWindowId: WindowId | null): WindowMap {
  const next = {} as WindowMap;

  for (const id of Object.keys(windows) as WindowId[]) {
    next[id] = { ...windows[id], isFocused: windows[id].id === activeWindowId };
  }

  return next;
}

/*
  After a window leaves the screen, focus falls back to the
  topmost window that is still visible.
*/
function settleFocus(
  state: WindowManagerState,
  windows: WindowMap,
): WindowManagerState {
  const activeWindowId = isVisible(
    state.activeWindowId ? windows[state.activeWindowId] : undefined,
  )
    ? state.activeWindowId
    : getTopmostWindowId(windows);

  return { ...state, windows: setFocus(windows, activeWindowId), activeWindowId };
}

/*
  Brings a window to the front. The map is rebuilt rather than mutated so the
  reducer can never write through a reference the previous state still holds.
*/
function raiseWindow(
  state: WindowManagerState,
  windows: WindowMap,
  id: WindowId,
): WindowManagerState {
  const zIndex = state.topZIndex + 1;

  return {
    windows: { ...windows, [id]: { ...windows[id], isFocused: true, zIndex } },
    activeWindowId: id,
    topZIndex: zIndex,
  };
}

function windowManagerReducer(
  state: WindowManagerState,
  action: WindowManagerAction,
): WindowManagerState {
  if (action.type === "show-desktop") {
    const windows = {} as WindowMap;

    for (const id of Object.keys(state.windows) as WindowId[]) {
      const windowState = state.windows[id];

      windows[id] = windowState.isOpen
        ? { ...windowState, isMinimized: true, isFocused: false }
        : windowState;
    }

    return { ...state, windows, activeWindowId: null };
  }

  const target = state.windows[action.id];

  if (!target) return state;

  switch (action.type) {
    case "open": {
      const windows = setFocus(state.windows, action.id);
      windows[action.id] = { ...target, isOpen: true, isMinimized: false };

      return raiseWindow(state, windows, action.id);
    }

    case "close": {
      if (!target.isOpen) return state;

      const windows = {
        ...state.windows,
        [action.id]: {
          ...target,
          isOpen: false,
          isMinimized: false,
          isFocused: false,
        },
      };

      return settleFocus(state, windows);
    }

    case "minimize": {
      if (!isVisible(target)) return state;

      const windows = {
        ...state.windows,
        [action.id]: { ...target, isMinimized: true, isFocused: false },
      };

      return settleFocus(state, windows);
    }

    case "toggle-maximize": {
      if (!isVisible(target)) return state;

      const windows = setFocus(state.windows, action.id);
      windows[action.id] = {
        ...target,
        isMaximized: !target.isMaximized,
        isFocused: true,
      };

      return raiseWindow(state, windows, action.id);
    }

    case "focus": {
      if (!isVisible(target)) return state;
      if (state.activeWindowId === action.id && target.isFocused) return state;

      return raiseWindow(state, setFocus(state.windows, action.id), action.id);
    }

    case "move": {
      if (!target.isOpen) return state;

      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...target, position: action.position },
        },
      };
    }
  }
}

export function useWindowManager(initialWindows: WindowMap) {
  const [state, dispatch] = useReducer(windowManagerReducer, {
    windows: initialWindows,
    activeWindowId: null,
    topZIndex: FIRST_Z_INDEX,
  });

  const actions = useMemo(
    () => ({
      openWindow: (id: WindowId) => dispatch({ type: "open", id }),
      closeWindow: (id: WindowId) => dispatch({ type: "close", id }),
      minimizeWindow: (id: WindowId) => dispatch({ type: "minimize", id }),
      toggleMaximize: (id: WindowId) => dispatch({ type: "toggle-maximize", id }),
      focusWindow: (id: WindowId) => dispatch({ type: "focus", id }),
      moveWindow: (id: WindowId, position: WindowPosition) =>
        dispatch({ type: "move", id, position }),
      showDesktop: () => dispatch({ type: "show-desktop" }),
    }),
    [],
  );

  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
}
