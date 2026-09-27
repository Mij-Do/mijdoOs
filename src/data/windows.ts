import type {
  DesktopAppId,
  SystemAppId,
  WindowDefinition,
  WindowMap,
  WindowPosition,
  WindowVariant,
} from "../types/window";

/*
  The window table is the single registry for the system: window titles,
  window variants, opening positions and desktop icon art are declared once
  here, and the shell, the desktop and the window manager all read from it.

  Two groups exist because they are genuinely different:
  - desktop applications are normal windows that own a desktop icon
  - system applications are small dialogs that do not
*/

type DesktopApplicationDefinition = {
  id: DesktopAppId;
  title: string;
  icon: string;
  position: WindowPosition;
};

type SystemApplicationDefinition = {
  id: SystemAppId;
  title: string;
  position: WindowPosition;
};

/*
  Positions cascade downwards so an unopened desktop stays readable instead
  of stacking every window on the same spot.
*/
export const desktopApplications: DesktopApplicationDefinition[] = [
  { id: "mijdo", title: "Mijdo.exe", icon: "EXE", position: { x: 96, y: 78 } },
  { id: "profile", title: "Profile.exe", icon: "PRF", position: { x: 130, y: 104 } },
  { id: "education", title: "Education.exe", icon: "EDU", position: { x: 164, y: 130 } },
  { id: "skills", title: "Skills.exe", icon: "SKL", position: { x: 198, y: 156 } },
  { id: "experience", title: "Experience.exe", icon: "EXP", position: { x: 232, y: 182 } },
  { id: "projects", title: "Projects.exe", icon: "PRJ", position: { x: 266, y: 208 } },
  { id: "contact", title: "Contact.exe", icon: "CNT", position: { x: 300, y: 234 } },
  { id: "terminal", title: "Terminal.exe", icon: "TRM", position: { x: 334, y: 260 } },
];

export const systemApplications: SystemApplicationDefinition[] = [
  { id: "about", title: "About MijdoOS.exe", position: { x: 250, y: 150 } },
  { id: "system-info", title: "System Info.exe", position: { x: 300, y: 200 } },
  { id: "help", title: "MijdoOS Help.exe", position: { x: 170, y: 120 } },
  { id: "shortcuts", title: "Shortcuts.exe", position: { x: 210, y: 170 } },
];

const WINDOW_VARIANT_BY_GROUP = {
  desktop: "window",
  system: "dialog",
} as const satisfies Record<string, WindowVariant>;

export const windowDefinitions: WindowDefinition[] = [
  ...desktopApplications.map((definition) => ({
    ...definition,
    variant: WINDOW_VARIANT_BY_GROUP.desktop,
  })),
  ...systemApplications.map((definition) => ({
    ...definition,
    variant: WINDOW_VARIANT_BY_GROUP.system,
  })),
];

/*
  Every window starts closed and unfocused; the window manager owns all
  runtime state from that point on.
*/
function createInitialWindows(): WindowMap {
  const entries = windowDefinitions.map((definition) => [
    definition.id,
    {
      id: definition.id,
      title: definition.title,
      variant: definition.variant,
      position: definition.position,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      isFocused: false,
      zIndex: 0,
    },
  ] as const);

  /*
    Object.fromEntries cannot express the WindowId key union, so the shape is
    asserted once here rather than in every consumer.
  */
  return Object.fromEntries(entries) as WindowMap;
}

export const initialWindows: WindowMap = createInitialWindows();
