import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { RefObject } from "react";
import type { WindowPosition } from "../types/window";

type PointerOffset = WindowPosition;

/*
  The smallest a window may get while it is moved around: enough to keep the
  title bar grabbable and the content area usable. The stylesheet's offset-based
  size caps carry the same floor (see .mijdo-application-window in index.css),
  and both have to agree — the clamp keeps the position where the floored size
  still fits the surface, and the cap keeps the size where the position allows.

  Exported because seating a window on open has to agree with dragging it: the
  same floor decides both.
*/
export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 180;

type Bounds = { left: number; top: number; width: number; height: number };

export function useDraggableWindow(
  position: WindowPosition,
  onMove: (position: WindowPosition) => void,
  frameRef: RefObject<HTMLElement | null>,
) {
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef<PointerOffset>({ x: 0, y: 0 });
  const boundsRef = useRef<Bounds | null>(null);

  function startDragging(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return;

    /*
      On a phone a window is a sheet inset from the edge of the surface rather
      than a floating rectangle, because there is no room for both. A sheet that
      fills the surface has nowhere to be dragged to, so its title bar moves it
      no further; the caption is still there to grab and still raises the window.
    */
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 640px)").matches
    ) {
      return;
    }

    /*
      Windows are positioned inside the desktop, so the desktop is the surface
      the drag has to stay on. Measuring it once at the start of the drag keeps
      the pointer loop free of layout reads.
    */
    const desktop = event.currentTarget.closest(".mijdo-desktop");
    const frame = frameRef.current;

    if (desktop && frame) {
      const surface = desktop.getBoundingClientRect();
      const bounds = frame.getBoundingClientRect();

      boundsRef.current = {
        left: surface.left,
        top: surface.top,
        width: surface.width,
        height: surface.height,
      };

      offsetRef.current = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
    } else {
      boundsRef.current = null;
      offsetRef.current = {
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      };
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  useEffect(() => {
    if (!isDragging) return;

    function moveWindow(event: PointerEvent) {
      /*
        Stored positions are desktop-relative, because that is the box the
        window is placed inside, so the surface origin is removed from the
        pointer before the clamp is applied.
      */
      const bounds = boundsRef.current;
      const maxX = bounds
        ? bounds.width - MIN_WINDOW_WIDTH
        : window.innerWidth - MIN_WINDOW_WIDTH;
      const maxY = bounds
        ? bounds.height - MIN_WINDOW_HEIGHT
        : window.innerHeight - MIN_WINDOW_HEIGHT;

      onMove({
        x: Math.min(
          Math.max(0, event.clientX - offsetRef.current.x - (bounds?.left ?? 0)),
          Math.max(0, maxX),
        ),
        y: Math.min(
          Math.max(0, event.clientY - offsetRef.current.y - (bounds?.top ?? 0)),
          Math.max(0, maxY),
        ),
      });
    }

    function stopDragging() {
      setIsDragging(false);
    }

    window.addEventListener("pointermove", moveWindow);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      window.removeEventListener("pointermove", moveWindow);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [isDragging, onMove]);

  return { isDragging, startDragging };
}
