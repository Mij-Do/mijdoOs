import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { WindowPosition } from "../types/window";

type PointerOffset = WindowPosition;

/*
 Keeps at least this much of the window reachable from the left/top edges,
 so a window can never be dragged somewhere its title bar cannot be grabbed.
*/
const MIN_REACHABLE_WIDTH = 140;
const MIN_REACHABLE_HEIGHT = 60;

export function useDraggableWindow(
  position: WindowPosition,
  onMove: (position: WindowPosition) => void,
) {
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef<PointerOffset>({ x: 0, y: 0 });

  function startDragging(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) return;

    offsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  useEffect(() => {
    if (!isDragging) return;

    function moveWindow(event: PointerEvent) {
      const maxX = Math.max(0, window.innerWidth - MIN_REACHABLE_WIDTH);
      const maxY = Math.max(0, window.innerHeight - MIN_REACHABLE_HEIGHT);

      onMove({
        x: Math.min(Math.max(0, event.clientX - offsetRef.current.x), maxX),
        y: Math.min(Math.max(0, event.clientY - offsetRef.current.y), maxY),
      });
    }

    function stopDragging() {
      setIsDragging(false);
    }

    window.addEventListener("pointermove", moveWindow);
    window.addEventListener("pointerup", stopDragging);

    return () => {
      window.removeEventListener("pointermove", moveWindow);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [isDragging, onMove]);

  return { isDragging, startDragging };
}
