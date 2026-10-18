import { describe, expect, it } from "vitest";
import { EXIT_DURATIONS } from "./exitDurations";

/*
  The exit animations live in index.css and these numbers are the frame's
  timeout fallback for the same durations: whichever of the CSS keyframe and the
  timeout ends first unmounts the window. CSS cannot import this constant, so a
  test cannot compare the two directly in this suite; pinning the values here is
  the tripwire. Changing either duration means changing it in index.css too,
  whose exit-animation block carries a pointer back to EXIT_DURATIONS.
*/
describe("window exit durations", () => {
  it("keeps the close and minimize fallback timeouts at their keyframe lengths", () => {
    expect(EXIT_DURATIONS).toEqual({ close: 110, minimize: 140 });
  });
});
