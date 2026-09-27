import type { WindowId } from "./window";

export type MenuId = "system" | "file" | "view" | "run" | "help";

export type MenuAnchor = {
  left: number;
  top: number;
};

/*
  A checked item behaves like a menuitemcheckbox.
  An item without "checked" behaves like a plain menuitem.
  An item with "href" is rendered as a real link, so the browser opens it
  in a new tab instead of the shell calling window.open.
*/
export type MenuItemAction =
  | {
      type: "item";
      label: string;
      onSelect: () => void;
      href?: string;
      checked?: boolean;
      disabled?: boolean;
    }
  | { type: "separator" };

export type MenuDefinition = {
  id: MenuId;
  label: string;
  items: MenuItemAction[];
};

/*
  System actions are provided by the shell.
  Each menu surface (top bar, desktop context menu) supplies its own
  closeMenu, because closing a menu is local to that surface.
*/
export type SystemActions = {
  openWindow: (id: WindowId) => void;
  closeActiveWindow: () => void;
  showDesktop: () => void;
  toggleArrangeIcons: () => void;
};

export type MenuActions = SystemActions & {
  closeMenu: () => void;
};
