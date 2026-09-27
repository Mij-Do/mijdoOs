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
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [position, setPosition] = useState({ left: anchorLeft, top: anchorTop });

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
      if (focusableIndexes.length === 0) {
        panelRef.current?.focus();
        return;
      }

      const step =
        (offset + focusableIndexes.length) % focusableIndexes.length;

      itemRefs.current[focusableIndexes[step]]?.focus();
    },
    [focusableIndexes],
  );

  useEffect(() => {
    focusItem(0);
  }, [focusItem]);

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
      focusItem(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
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
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.length === 0 ? null : (
        items.map((item, index) =>
          item.type === "separator" ? (
            <div
              className="mijdo-menu-separator"
              key={`separator-${index}`}
              role="separator"
            />
          ) : (
            <button
              className="mijdo-menu-item"
              type="button"
              role={item.checked === undefined ? "menuitem" : "menuitemcheckbox"}
              aria-checked={item.checked}
              aria-disabled={item.disabled}
              disabled={item.disabled}
              key={item.label}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              onClick={() => {
                close(true);
                item.onSelect();
              }}
            >
              <span className="mijdo-menu-item-mark" aria-hidden="true">
                {item.checked ? "✓" : ""}
              </span>
              <span className="mijdo-menu-item-label">{item.label}</span>
            </button>
          ),
        )
      )}
    </div>,
    document.body,
  );
}
