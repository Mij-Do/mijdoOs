import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { MIN_REACHABLE_HEIGHT, MIN_REACHABLE_WIDTH } from "./useDraggableWindow";
import type { WindowPosition } from "../types/window";

/*
  Matches the mobile breakpoint in index.css. The two have to agree, so both ask
  the same question of the same stylesheet rather than each hard-coding 640.
*/
const COMPACT_QUERY = "(max-width: 640px)";

/*
  The gap a window leaves on every side, and the gap it leaves below the icon
  rows. The height rule in index.css is written against the same inset, so the
  two have to agree.
*/
const COMPACT_INSET = 8;

function isCompactSurface(): boolean {
  return (
    typeof window.matchMedia === "function" && window.matchMedia(COMPACT_QUERY).matches
  );
}

/*
  Seats a window that does not fit the surface it opened on.

  The registry gives every application a start position from a diagonal cascade
  that assumes a desktop: the eight desktop applications run from x=96 to x=334.
  That is a good place to put a window on a wide screen and an impossible one on
  a phone, where a window opened at x=334 starts past the right edge, and where
  the width cap, which subtracts the window's own offset from the surface, leaves
  it about fifty pixels wide.

  A cascade is a starting point rather than a constraint, so a window that does
  not fit is moved to one that does. The corrected position is stored rather than
  applied only while rendering, because the stored position is what a drag starts
  from and what the width cap is derived from: a value that existed only during
  render would leave the two disagreeing.

  This measures the surface, which the stylesheet otherwise avoids doing. The
  offset in the cascade is a guess about screen size, and no arithmetic on a guess
  produces a position that fits an unknown surface; measuring is what makes the
  guess safe.

  Two things are deliberately left alone. A window the visitor has dragged is
  where they put it, so a later resize only corrects a position that no longer
  fits, not one that merely differs from the registry. And a maximized window is
  placed by its own rule rather than by a position, so it is never seated.
*/
export function useContainedWindowPosition(
  onMove: (position: WindowPosition) => void,
  frameRef: RefObject<HTMLElement | null>,
) {
  /*
    The caller passes a fresh callback each render, and the effect below only
    wants the current one when a resize actually needs it. Holding it in a ref
    keeps the effect from rebuilding its observer on every render of every window.
  */
  const latest = useRef(onMove);

  useLayoutEffect(() => {
    latest.current = onMove;
  });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const surface = frame?.closest<HTMLElement>(".mijdo-desktop");
    if (!frame || !surface) return;

    function seat() {
      const host = surface;
      const element = frame;
      if (!host || !element) return;

      /* A maximized window is placed by the maximized rule, not by a position. */
      if (element.classList.contains("is-maximized")) return;

      const bounds = host.getBoundingClientRect();

      /*
        Read where the window actually is rather than what state says, so a
        window the visitor has dragged keeps their position.
      */
      const current: WindowPosition = {
        x: element.offsetLeft,
        y: element.offsetTop,
      };

      const fitted = isCompactSurface()
        ? compactSeat(host, bounds)
        : clampToSurface(current, bounds);
      if (fitted.x === current.x && fitted.y === current.y) return;

      latest.current(fitted);
    }

    seat();

    /* Rotating a phone re-seats windows that no longer fit. */
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(seat);
    observer.observe(surface);

    return () => observer.disconnect();
  }, [frameRef]);
}

/*
  On a phone the icons wrap into rows across the top of the surface, and the
  stylesheet is explicit that they stay reachable rather than being covered. A
  window therefore opens below them and runs to the bottom of the surface, which
  the mobile height rule then reads back out of the window's own offset.

  The row count depends on how many icons fit across, so the launcher is
  measured rather than assumed: a narrower phone wraps into more rows, and
  arranging the icons can change how tall the block is.
*/
function compactSeat(surface: Element, bounds: DOMRect): WindowPosition {
  const launcher = surface.querySelector(".mijdo-desktop-icons");
  const launcherBottom = launcher?.getBoundingClientRect().bottom;

  const belowLauncher =
    launcherBottom === undefined ? COMPACT_INSET : launcherBottom - bounds.top + COMPACT_INSET;

  return { x: COMPACT_INSET, y: Math.max(COMPACT_INSET, belowLauncher) };
}

function clampToSurface(current: WindowPosition, bounds: DOMRect): WindowPosition {
  /*
    The same reachable minimum the drag uses, so a window can never be seated
    somewhere a drag could not have put it.
  */
  return {
    x: Math.min(
      Math.max(0, current.x),
      Math.max(0, bounds.width - MIN_REACHABLE_WIDTH),
    ),
    y: Math.min(
      Math.max(0, current.y),
      Math.max(0, bounds.height - MIN_REACHABLE_HEIGHT),
    ),
  };
}
