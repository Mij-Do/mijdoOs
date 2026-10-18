import { describe, expect, it } from "vitest";
import { COMPACT_BREAKPOINT_PX, COMPACT_QUERY } from "./viewport";

/*
  The compact breakpoint is asked in three TypeScript modules and restated in
  index.css, which cannot import TypeScript. Sharing one constant keeps the
  TypeScript copies identical to each other; this tripwire pins that constant's
  value, so changing it fails a test and sends the reader to index.css, whose
  compact media query carries a matching pointer back to this module.
*/
describe("the compact breakpoint", () => {
  it("is the 640px boundary the compact layout and the stylesheet agree on", () => {
    expect(COMPACT_BREAKPOINT_PX).toBe(640);
  });

  it("builds the media query the window hooks and the CV handler rely on", () => {
    expect(COMPACT_QUERY).toBe("(max-width: 640px)");
  });
});
