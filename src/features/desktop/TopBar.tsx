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

  function toggleMenu(menuId: MenuId, element: HTMLButtonElement) {
    if (openMenuId === menuId) {
      closeMenu();
      return;
    }

    const bounds = element.getBoundingClientRect();

    setAnchor({ left: bounds.left, top: bounds.bottom });
    setOpenMenuId(menuId);
    triggerRef.current = element;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") closeMenu();
    if (event.key === "Tab") closeMenu();
  }

  return (
    <header
      className="mijdo-command-bar mijdo-top-bar"
      aria-label="System command bar"
      onKeyDown={handleKeyDown}
    >
      {menus.map((menu) => (
        <button
          className="mijdo-command-item"
          type="button"
          key={menu.id}
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
