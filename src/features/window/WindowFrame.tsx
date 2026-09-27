import type { ReactNode } from "react";
import { useDraggableWindow } from "../../hooks/useDraggableWindow";
import type { WindowControllerProps } from "../../types/window";

type WindowFrameProps = WindowControllerProps & {
  children: ReactNode;
};

export function WindowFrame({
  windowState,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onMove,
  children,
}: WindowFrameProps) {
  const { isDragging, startDragging } = useDraggableWindow(
    windowState.position,
    onMove,
  );
  const isDialog = windowState.variant === "dialog";
  const windowClassName = [
    "mijdo-window",
    "mijdo-application-window",
    isDialog ? "is-dialog" : "",
    windowState.isMaximized ? "is-maximized" : "",
    windowState.isFocused ? "is-focused" : "",
    isDragging ? "is-dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const titleBarClassName = windowState.isFocused
    ? "mijdo-titlebar"
    : "mijdo-titlebar inactive";

  return (
    <section
      className={windowClassName}
      style={
        windowState.isMaximized
          ? { zIndex: windowState.zIndex }
          : {
              left: windowState.position.x,
              top: windowState.position.y,
              zIndex: windowState.zIndex,
            }
      }
      aria-label={`${windowState.title} window`}
      onPointerDown={onFocus}
      onContextMenu={(event) => event.stopPropagation()}
    >
      <header
        className={titleBarClassName}
        onPointerDown={windowState.isMaximized ? undefined : startDragging}
      >
        <span className="mijdo-window-title">{windowState.title}</span>
        <div className="mijdo-window-controls">
          <button
            className="mijdo-window-control"
            type="button"
            aria-label={`Minimize ${windowState.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onMinimize}
          >
            _
          </button>
          {isDialog ? null : (
            <button
              className="mijdo-window-control"
              type="button"
              aria-label={
                windowState.isMaximized
                  ? `Restore ${windowState.title}`
                  : `Maximize ${windowState.title}`
              }
              onPointerDown={(event) => event.stopPropagation()}
              onClick={onToggleMaximize}
            >
              {windowState.isMaximized ? "R" : "M"}
            </button>
          )}
          <button
            className="mijdo-window-control"
            type="button"
            aria-label={`Close ${windowState.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
          >
            X
          </button>
        </div>
      </header>
      {children}
    </section>
  );
}
