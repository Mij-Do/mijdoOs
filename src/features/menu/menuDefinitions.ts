import type {
  MenuActions,
  MenuDefinition,
  MenuItemAction,
} from "../../types/menu";

type MenuDefinitionState = {
  hasActiveWindow: boolean;
  isIconsArranged: boolean;
};

const separator: MenuItemAction = { type: "separator" };

export function createMenuDefinitions(
  actions: MenuActions,
  state: MenuDefinitionState,
): MenuDefinition[] {
  return [
    {
      id: "system",
      label: "SYSTEM",
      items: [
        {
          type: "item",
          label: "About MijdoOS",
          onSelect: () => actions.openWindow("about"),
        },
        {
          type: "item",
          label: "System Info",
          onSelect: () => actions.openWindow("system-info"),
        },
        separator,
        { type: "item", label: "Refresh Desktop", onSelect: actions.refreshDesktop },
        separator,
        { type: "item", label: "Close Menu", onSelect: actions.closeMenu },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        {
          type: "item",
          label: "Open Mijdo.exe",
          onSelect: () => actions.openWindow("mijdo"),
        },
        { type: "item", label: "Open CV", onSelect: actions.openCv },
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
        {
          type: "item",
          label: "My Profile",
          onSelect: () => actions.openWindow("profile"),
        },
        {
          type: "item",
          label: "My Education",
          onSelect: () => actions.openWindow("education"),
        },
        {
          type: "item",
          label: "My Skills",
          onSelect: () => actions.openWindow("skills"),
        },
        {
          type: "item",
          label: "My Experience",
          onSelect: () => actions.openWindow("experience"),
        },
        {
          type: "item",
          label: "My Projects",
          onSelect: () => actions.openWindow("projects"),
        },
        {
          type: "item",
          label: "Contact",
          onSelect: () => actions.openWindow("contact"),
        },
      ],
    },
    {
      id: "run",
      label: "Run",
      items: [
        { type: "item", label: "Mijdo.exe", onSelect: () => actions.openWindow("mijdo") },
        {
          type: "item",
          label: "Projects",
          onSelect: () => actions.openWindow("projects"),
        },
        { type: "item", label: "Skills", onSelect: () => actions.openWindow("skills") },
        {
          type: "item",
          label: "Experience",
          onSelect: () => actions.openWindow("experience"),
        },
        {
          type: "item",
          label: "Contact",
          onSelect: () => actions.openWindow("contact"),
        },
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        { type: "item", label: "MijdoOS Help", onSelect: () => actions.openWindow("help") },
        {
          type: "item",
          label: "Keyboard Shortcuts",
          onSelect: () => actions.openWindow("shortcuts"),
        },
        separator,
        { type: "item", label: "About", onSelect: () => actions.openWindow("about") },
      ],
    },
  ];
}

export function createDesktopMenuDefinitions(
  actions: MenuActions,
  isIconsArranged: boolean,
): MenuItemAction[] {
  return [
    {
      type: "item",
      label: "Open Mijdo.exe",
      onSelect: () => actions.openWindow("mijdo"),
    },
    { type: "item", label: "Refresh", onSelect: actions.refreshDesktop },
    {
      type: "item",
      label: "Arrange Icons",
      onSelect: actions.toggleArrangeIcons,
      checked: isIconsArranged,
    },
    separator,
    {
      type: "item",
      label: "System Info",
      onSelect: () => actions.openWindow("system-info"),
    },
    separator,
    { type: "item", label: "Close Menu", onSelect: actions.closeMenu },
  ];
}
