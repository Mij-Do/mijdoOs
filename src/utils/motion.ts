/*
  Whether the visitor has asked the system to cut motion. Read at the moment it
  is needed rather than cached, so a preference change is honoured the next time
  an animation would run.

  Shared because the boot sequence and the window exit transition both ask the
  same question, and each used to keep its own copy. The guard on matchMedia is
  unchanged: on a browser without it the answer is simply "no", and every caller
  already runs in the browser, so there is no window-less case to defend.
*/
export function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
