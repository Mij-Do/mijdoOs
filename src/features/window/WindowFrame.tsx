import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode, RefObject } from "react";
import { useContainedWindowPosition } from "../../hooks/useContainedWindowPosition";
import { useDraggableWindow } from "../../hooks/useDraggableWindow";
import type { WindowControllerProps } from "../../types/window";

/*
  Durations of the two exit keyframes declared in index.css. The frame waits
  this long before handing the removal back to the window manager, so the
  manager never has to know that windows animate out.
*/
const EXIT_DURATIONS = {
  close: 110,
  minimize: 140,
} as const;

type ExitKind = keyof typeof EXIT_DURATIONS;

type WindowFrameProps = WindowControllerProps & {
  children: ReactNode;
};

/*
  Reduced motion removes the keyframes, so there is nothing left to wait for
  and the removal happens immediately.
*/
function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/*
  Plays the exit animation and only then performs the action that unmounts the
  window. Keeping this here rather than in the window manager leaves the
  manager a pure state machine and keeps the animation next to the frame it
  animates. Whichever of the timeout and the animation ending arrives first
  wins, and both paths are idempotent, so a late second call changes nothing.
*/
function useExitTransition(
  frameRef: RefObject<HTMLElement | null>,
  setExiting: (kind: ExitKind) => void,
) {
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;

    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  return useCallback(
    (kind: ExitKind, perform: () => void) => {
      if (prefersReducedMotion()) {
        perform();
        return;
      }

      clearTimer();
      setExiting(kind);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        perform();
      }, EXIT_DURATIONS[kind]);

      const frame = frameRef.current;

      function handleAnimationEnd(event: AnimationEvent) {
        if (event.target !== frame) return;

        frame?.removeEventListener("animationend", handleAnimationEnd);
        clearTimer();
        perform();
      }

      frame?.addEventListener("animationend", handleAnimationEnd);
    },
    [clearTimer, frameRef, setExiting],
  );
}

export function WindowFrame({
  windowState,
  onClose,
  onMinimize,
  onToggleMaximize,
  onFocus,
  onMove,
  children,
}: WindowFrameProps) {
  const frameRef = useRef<HTMLElement | null>(null);
  const [exiting, setExiting] = useState<ExitKind | null>(null);

  const { isDragging, startDragging } = useDraggableWindow(
    windowState.position,
    onMove,
    frameRef,
  );

  /*
    Seats the window if the position it opened at does not fit this surface. A
    window the visitor drags afterwards keeps the position they gave it.
  */
  useContainedWindowPosition(onMove, frameRef);

  const runExit = useExitTransition(frameRef, setExiting);

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

  /*
    A maximized window is placed by the maximized rule alone, so the offset
    variables are not written at all in that state.
  */
  const frameStyle: CSSProperties & Record<`--${string}`, string> =
    windowState.isMaximized
    ? { zIndex: windowState.zIndex }
    : {
        left: windowState.position.x,
        top: windowState.position.y,
        zIndex: windowState.zIndex,
        /*
          The frame reads its own offset back out of these two variables to cap
          its size, so a window can never be opened or dragged far enough to
          slide under the command bar or the status bar.
        */
        "--mijdo-window-offset-x": `${windowState.position.x}px`,
        "--mijdo-window-offset-y": `${windowState.position.y}px`,
      };

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!isDialog || event.key !== "Escape") return;

    event.stopPropagation();
    runExit("close", onClose);
  }

  return (
    <section
      className={windowClassName}
      style={frameStyle}
      data-exiting={exiting ?? undefined}
      ref={frameRef}
      /*
        A normal window is a group of controls, but the dialog variant is a
        message box: it takes focus on open, is dismissed with Escape or its
        own OK button, so it is announced as a dialog. The rest of the desktop
        stays reachable, so it is not marked as modal.
      */
      role={isDialog ? "dialog" : "group"}
      aria-label={`${windowState.title} window`}
      onPointerDown={onFocus}
      onKeyDown={handleKeyDown}
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
            onClick={() => runExit("minimize", onMinimize)}
          >
            <span className="mijdo-glyph-minimize" aria-hidden="true" />
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
              {windowState.isMaximized ? (
                <span className="mijdo-glyph-restore" aria-hidden="true" />
              ) : (
                <span className="mijdo-glyph-maximize" aria-hidden="true" />
              )}
            </button>
          )}
          <button
            className="mijdo-window-control"
            type="button"
            aria-label={`Close ${windowState.title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => runExit("close", onClose)}
          >
            <span className="mijdo-glyph-close" aria-hidden="true" />
          </button>
        </div>
      </header>
      {children}
    </section>
  );
}
