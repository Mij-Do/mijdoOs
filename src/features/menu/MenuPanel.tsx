import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { MenuItemAction } from "../../types/menu";

const VIEWPORT_MARGIN = 4;

type MenuPanelProps = {
  id: string;
  label: string;
  items: MenuItemAction[];
  anchorLeft: number;
  anchorTop: number;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
};

export function MenuPanel({
  id,
  label,
  items,
  anchorLeft,
  anchorTop,
  onClose,
  returnFocusRef,
}: MenuPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [position, setPosition] = useState({ left: anchorLeft, top: anchorTop });
  /*
    The panel focuses its first item on open so the keyboard works straight
    away, but that focus must not be painted: a menu opened with the mouse
    showed item one highlighted for as long as it stayed open. The highlight
    is therefore driven by this state, which only turns on once the keyboard
    is actually used, and it is painted through data-selected.
  */
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  const focusableIndexes = useMemo(
    () =>
      items.reduce<number[]>((indexes, item, index) => {
        if (item.type === "item" && !item.disabled) indexes.push(index);
        return indexes;
      }, []),
    [items],
  );

  const focusItem = useCallback(
    (offset: number) => {
      const total = focusableIndexes.length;

      if (total === 0) {
        setFocusedIndex(null);
        panelRef.current?.focus();
        return;
      }

      /*
        Arrows move relative to the current position. Until the keyboard is
        used there is no recorded selection, but the panel has focused the
        first item on open, so the movement continues from there.
      */
      const recorded = focusedIndex === null
        ? -1
        : focusableIndexes.indexOf(focusedIndex);
      const current = recorded === -1 ? 0 : recorded;
      const next = (current + offset + total) % total;
      const index = focusableIndexes[next];

      if (index === undefined) return;

      setFocusedIndex(index);
      itemRefs.current[index]?.focus();
    },
    [focusableIndexes, focusedIndex],
  );

  useEffect(() => {
    /*
      Focus the first item so the keyboard works immediately. This is a DOM
      focus only: no selection is recorded, so opening a menu with the mouse
      must not paint anything.
    */
    const firstIndex = focusableIndexes[0];

    if (firstIndex === undefined) {
      panelRef.current?.focus();
      return;
    }

    itemRefs.current[firstIndex]?.focus();
  }, [focusableIndexes]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (panelRef.current?.contains(event.target as Node)) return;

      onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose]);

  useLayoutEffect(() => {
    const panel = panelRef.current;

    if (!panel) return;

    const bounds = panel.getBoundingClientRect();
    const maxLeft = Math.max(
      VIEWPORT_MARGIN,
      window.innerWidth - bounds.width - VIEWPORT_MARGIN,
    );
    const maxTop = Math.max(
      VIEWPORT_MARGIN,
      window.innerHeight - bounds.height - VIEWPORT_MARGIN,
    );

    setPosition({
      left: Math.min(Math.max(VIEWPORT_MARGIN, anchorLeft), maxLeft),
      top: Math.min(Math.max(VIEWPORT_MARGIN, anchorTop), maxTop),
    });
  }, [anchorLeft, anchorTop]);

  function close(returnFocus: boolean) {
    onClose();

    if (returnFocus) returnFocusRef?.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsKeyboardMode(true);
      focusItem(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsKeyboardMode(true);
      focusItem(-1);
    }
  }

  return createPortal(
    <div
      className="mijdo-menu"
      id={id}
      role="menu"
      aria-label={label}
      aria-orientation="vertical"
      ref={panelRef}
      tabIndex={-1}
      style={{ left: position.left, top: position.top }}
      onKeyDown={handleKeyDown}
      /*
        Any real pointer movement hands the highlight to :hover, so the
        keyboard selection cannot stay painted while the mouse is elsewhere.
      */
      onPointerMove={() => setIsKeyboardMode(false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.length === 0 ? null : (
        items.map((item, index) => {
          if (item.type === "separator") {
            return (
              <div
                className="mijdo-menu-separator"
                key={`separator-${index}`}
                role="separator"
              />
            );
          }

          const role =
            item.checked === undefined ? "menuitem" : "menuitemcheckbox";

          const registerRef = (element: HTMLElement | null) => {
            itemRefs.current[index] = element;
          };

          const content = (
            <>
              <span className="mijdo-menu-item-mark" aria-hidden="true">
                {item.checked ? "✓" : ""}
              </span>
              <span className="mijdo-menu-item-label">{item.label}</span>
            </>
          );

          const selected = isKeyboardMode && focusedIndex === index;

          /*
            A link item is a real anchor, so the browser opens the target in
            a new tab and the shell never has to call window.open.
          */
          if (item.href) {
            return (
              <a
                className="mijdo-menu-item"
                role={role}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                key={item.label}
                ref={registerRef}
                data-selected={selected}
                onClick={() => close(true)}
              >
                {content}
              </a>
            );
          }

          return (
            <button
              className="mijdo-menu-item"
              type="button"
              role={role}
              aria-checked={item.checked}
              aria-disabled={item.disabled}
              disabled={item.disabled}
              key={item.label}
              ref={registerRef}
              data-selected={selected}
              onClick={() => {
                close(true);
                item.onSelect();
              }}
            >
              {content}
            </button>
          );
        })
      )}
    </div>,
    document.body,
  );
}
