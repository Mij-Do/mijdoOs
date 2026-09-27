import { useCallback, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { MenuId, SystemActions } from "../../types/menu";
import { MenuPanel } from "../menu/MenuPanel";
import { createMenuDefinitions } from "../menu/menuDefinitions";

type TopBarProps = {
  actions: SystemActions;
  hasActiveWindow: boolean;
  isIconsArranged: boolean;
};

const EMPTY_POSITION = { left: 0, top: 0 };

export function TopBar({ actions, hasActiveWindow, isIconsArranged }: TopBarProps) {
  const [openMenuId, setOpenMenuId] = useState<MenuId | null>(null);
  const [anchor, setAnchor] = useState(EMPTY_POSITION);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const triggersRef = useRef<(HTMLButtonElement | null)[]>([]);

  const closeMenu = useCallback(() => setOpenMenuId(null), []);

  const menus = useMemo(
    () =>
      createMenuDefinitions(
        { ...actions, closeMenu },
        { hasActiveWindow, isIconsArranged },
      ),
    [actions, closeMenu, hasActiveWindow, isIconsArranged],
  );

  const openMenu = menus.find((menu) => menu.id === openMenuId);

  function openMenuAt(menuId: MenuId, element: HTMLButtonElement) {
    const bounds = element.getBoundingClientRect();

    setAnchor({ left: bounds.left, top: bounds.bottom });
    setOpenMenuId(menuId);
    triggerRef.current = element;
  }

  function toggleMenu(menuId: MenuId, element: HTMLButtonElement) {
    if (openMenuId === menuId) {
      closeMenu();
      return;
    }

    openMenuAt(menuId, element);
  }

  /*
    Arrows move along the menu bar, which is what a menu bar is for: a keyboard
    user can walk the whole bar and open any menu without passing back through
    the page. Left and right belong to the bar while a panel is open, because
    the panel keeps up and down for moving between its own items. The panel
    re-anchors because each trigger has its own position.
  */
  function stepMenu(step: number) {
    const openIndex = menus.findIndex((menu) => menu.id === openMenuId);
    const focusedIndex = triggersRef.current.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const from = openIndex !== -1 ? openIndex : focusedIndex;
    const start = from === -1 ? (step > 0 ? -1 : 0) : from;
    const next = (start + step + menus.length) % menus.length;
    const menu = menus[next];
    const trigger = triggersRef.current[next];

    if (!menu || !trigger) return;

    openMenuAt(menu.id, trigger);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      stepMenu(1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      stepMenu(-1);
    }
  }

  return (
    <header
      className="mijdo-command-bar mijdo-top-bar"
      aria-label="System command bar"
      onKeyDown={handleKeyDown}
    >
      {menus.map((menu, index) => (
        <button
          className="mijdo-command-item"
          type="button"
          key={menu.id}
          ref={(element) => {
            triggersRef.current[index] = element;
          }}
          aria-haspopup="menu"
          aria-expanded={openMenuId === menu.id}
          aria-controls={openMenuId === menu.id ? `menu-${menu.id}` : undefined}
          data-active={openMenuId === menu.id}
          onClick={(event) => toggleMenu(menu.id, event.currentTarget)}
        >
          {menu.label}
        </button>
      ))}

      {openMenu ? (
        <MenuPanel
          id={`menu-${openMenu.id}`}
          label={openMenu.label}
          items={openMenu.items}
          anchorLeft={anchor.left}
          anchorTop={anchor.top}
          onClose={closeMenu}
          returnFocusRef={triggerRef}
        />
      ) : null}
    </header>
  );
}
