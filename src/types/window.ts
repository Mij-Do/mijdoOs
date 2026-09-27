export type WindowPosition = {
  x: number;
  y: number;
};

export type DesktopAppId =
  | "mijdo"
  | "profile"
  | "education"
  | "skills"
  | "experience"
  | "projects"
  | "contact"
  | "terminal";

export type SystemAppId = "about" | "system-info" | "help" | "shortcuts";

export type WindowId = DesktopAppId | SystemAppId;

/*
  "window" is a normal application window.
  "dialog" is a small system window (no maximize control).
*/
export type WindowVariant = "window" | "dialog";

export type WindowState = {
  id: WindowId;
  title: string;
  variant: WindowVariant;
  position: WindowPosition;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
};

/*
  A window as declared in the registry, before any runtime state exists.
  "icon" is only present for desktop applications, which is what separates
  them from system dialogs.
*/
export type WindowDefinition = {
  id: WindowId;
  title: string;
  variant: WindowVariant;
  position: WindowPosition;
  icon?: string;
};

export type WindowMap = Record<WindowId, WindowState>;

/*
  Every window component receives its own state plus the actions
  that the window manager exposes for that specific window.
*/
export type WindowControllerProps = {
  windowState: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onMove: (position: WindowPosition) => void;
};

export type WindowManagerState = {
  windows: WindowMap;
  activeWindowId: WindowId | null;
  topZIndex: number;
};

export type WindowManagerAction =
  | { type: "open"; id: WindowId }
  | { type: "close"; id: WindowId }
  | { type: "minimize"; id: WindowId }
  | { type: "toggle-maximize"; id: WindowId }
  | { type: "focus"; id: WindowId }
  | { type: "move"; id: WindowId; position: WindowPosition }
  | { type: "show-desktop" };
