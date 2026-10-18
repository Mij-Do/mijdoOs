/*
  Where the compact layout starts, stated once.

  The drag hook refuses to start a drag on a compact surface, the seating hook
  lays a window out as a sheet there, the CV link gives up its new tab there,
  and index.css restates the window rules there. Each of those used to hard-code
  "(max-width: 640px)" beside a comment asking the next reader to keep them in
  agreement. This module is the one place the TypeScript side asks the question;
  index.css carries the matching media query and points back here.
*/
export const COMPACT_BREAKPOINT_PX = 640;

export const COMPACT_QUERY = `(max-width: ${COMPACT_BREAKPOINT_PX}px)`;
