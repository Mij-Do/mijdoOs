import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH } from "./useDraggableWindow";
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
  fits or one that has come to cover the icon rail — the launcher every
  application opens from, which the desktop promises stays reachable — not one
  that merely differs from the registry. And a maximized window is placed by
  its own rule rather than by a position, so it is never seated.
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
        : clampToSurface(current, bounds, iconRailClearance(host, element, bounds));
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

function clampToSurface(
  current: WindowPosition,
  bounds: DOMRect,
  clearanceX = 0,
): WindowPosition {
  /*
    The same usable floor the drag and the size caps use, so a window is never
    seated somewhere its floored size would hang off the surface. The lower
    bound of x may be raised by the icon rail's measured right edge: a window
    that comes to rest over the launcher is pushed clear of it, and a window
    already clear of it is left exactly where it is.
  */
  return {
    x: Math.min(
      Math.max(clearanceX, current.x),
      Math.max(0, bounds.width - MIN_WINDOW_WIDTH),
    ),
    y: Math.min(
      Math.max(0, current.y),
      Math.max(0, bounds.height - MIN_WINDOW_HEIGHT),
    ),
  };
}

/*
  The cascade the registry hands out starts at x=96, which clears the icon rail
  on a tall desktop (one column: x=14..90) but not on a short one, where the
  rail wraps into a second column reaching x=167 and the same opening position
  lands on top of it — measured at 844x390, where the window covered the
  centers of three icons and the launcher underneath could not be clicked.

  The rail is therefore measured rather than assumed, exactly like the surface:
  if the window's live rectangle contains any icon's hit target, the seat moves
  it right of the rail's measured edge; otherwise the position — the visitor's
  own drag included — is left alone. The edge is the rightmost icon rather
  than the container's box: on a wrapped rail the container is shrink-to-fit
  and Firefox reports it one column wide while the second column overflows it,
  so the icons themselves are the measurement both engines agree on.
*/
function iconRailClearance(surface: Element, frame: HTMLElement, bounds: DOMRect): number {
  const rail = surface.querySelector<HTMLElement>(".mijdo-desktop-icons");
  if (!rail) return 0;

  const frameBox = frame.getBoundingClientRect();
  let railRight = 0;
  let coversIcon = false;

  for (const icon of rail.querySelectorAll<HTMLElement>(".mijdo-desktop-icon")) {
    const box = icon.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;

    railRight = Math.max(railRight, box.right);

    if (
      centerX >= frameBox.left &&
      centerX <= frameBox.right &&
      centerY >= frameBox.top &&
      centerY <= frameBox.bottom
    ) {
      coversIcon = true;
    }
  }

  if (!coversIcon) return 0;

  /*
    Capped by the same usable floor as the clamp itself: clear of the rail is
    worth nothing if the window's floored size would then hang off the surface.
  */
  return Math.min(
    Math.max(0, railRight - bounds.left),
    Math.max(0, bounds.width - MIN_WINDOW_WIDTH),
  );
}
