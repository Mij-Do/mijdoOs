import { contact } from "../../data/contact";
import type {
  MenuActions,
  MenuDefinition,
  MenuItemAction,
} from "../../types/menu";
import type { WindowId } from "../../types/window";

type MenuDefinitionState = {
  hasActiveWindow: boolean;
  isIconsArranged: boolean;
};

const separator: MenuItemAction = { type: "separator" };

/*
  Most menu entries do the same thing: open a window. The helper is the one
  place those entries are built, so the boilerplate is written once.
*/
function openWindowItem(
  actions: MenuActions,
  label: string,
  windowId: WindowId,
): MenuItemAction {
  return { type: "item", label, onSelect: () => actions.openWindow(windowId) };
}

export function createMenuDefinitions(
  actions: MenuActions,
  state: MenuDefinitionState,
): MenuDefinition[] {
  return [
    {
      id: "system",
      label: "SYSTEM",
      items: [
        openWindowItem(actions, "About MijdoOS", "about"),
        openWindowItem(actions, "System Info", "system-info"),
        separator,
        { type: "item", label: "Close Menu", onSelect: actions.closeMenu },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        openWindowItem(actions, "Open Mijdo.exe", "mijdo"),
        { type: "item", label: "Open CV", onSelect: actions.closeMenu, href: contact.cvUrl },
        separator,
        {
          type: "item",
          label: "Close Active Window",
          onSelect: actions.closeActiveWindow,
          disabled: !state.hasActiveWindow,
        },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { type: "item", label: "Show Desktop", onSelect: actions.showDesktop },
        separator,
        {
          type: "item",
          label: "Arrange Icons",
          onSelect: actions.toggleArrangeIcons,
          checked: state.isIconsArranged,
        },
      ],
    },
    {
      id: "special",
      label: "Special",
      items: [
        openWindowItem(actions, "My Profile", "profile"),
        openWindowItem(actions, "My Education", "education"),
        openWindowItem(actions, "My Skills", "skills"),
        openWindowItem(actions, "My Experience", "experience"),
        openWindowItem(actions, "My Projects", "projects"),
        openWindowItem(actions, "Contact", "contact"),
      ],
    },
    {
      id: "run",
      label: "Run",
      items: [
        openWindowItem(actions, "Mijdo.exe", "mijdo"),
        openWindowItem(actions, "Terminal.exe", "terminal"),
        openWindowItem(actions, "Projects", "projects"),
        openWindowItem(actions, "Skills", "skills"),
        openWindowItem(actions, "Experience", "experience"),
        openWindowItem(actions, "Contact", "contact"),
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        openWindowItem(actions, "MijdoOS Help", "help"),
        openWindowItem(actions, "Keyboard Shortcuts", "shortcuts"),
        separator,
        openWindowItem(actions, "About", "about"),
      ],
    },
  ];
}

export function createDesktopMenuDefinitions(
  actions: MenuActions,
  isIconsArranged: boolean,
): MenuItemAction[] {
  return [
    openWindowItem(actions, "Open Mijdo.exe", "mijdo"),
    {
      type: "item",
      label: "Arrange Icons",
      onSelect: actions.toggleArrangeIcons,
      checked: isIconsArranged,
    },
    separator,
    openWindowItem(actions, "System Info", "system-info"),
    separator,
    { type: "item", label: "Close Menu", onSelect: actions.closeMenu },
  ];
}
