import type { HelpTopic, KeyboardShortcut } from "../types/portfolio";

/*
  Every documented interaction is implemented in the shell.
*/
export const helpTopics: HelpTopic[] = [
  {
    title: "DESKTOP",
    lines: ["Click an application icon to open it."],
  },
  {
    title: "SYSTEM MENUS",
    lines: [
      "Open a menu from the top bar.",
      "Click another menu to switch menus.",
      "Click anywhere outside a menu to close it.",
      "Press Escape to close the open menu.",
    ],
  },
  {
    title: "WINDOWS",
    lines: [
      "Drag a window by its title bar.",
      "Click a window to bring it to the front.",
      "Right-click the desktop for desktop actions.",
    ],
  },
  {
    title: "MINIMIZE / MAXIMIZE",
    lines: [
      "Use the minimize control in the title bar.",
      "Use the maximize control to fill the desktop.",
      "Use the restore control to return the window to its size.",
    ],
  },
  {
    title: "STATUS BAR",
    lines: [
      "Click an application button to focus its window.",
      "Click a minimized application button to restore it.",
      "Close a window with its close control to remove its button.",
    ],
  },
  {
    title: "CV",
    lines: ["Use the CV button to open the resume."],
  },
];

export const keyboardShortcuts: KeyboardShortcut[] = [
  { keys: "Escape", action: "Close the open menu" },
  { keys: "Arrow Up", action: "Select the previous menu item" },
  { keys: "Arrow Down", action: "Select the next menu item" },
  { keys: "Enter", action: "Activate the selected menu item" },
];
