import { describe, expect, it } from "vitest";
import { recallHistoryEntry } from "./terminalHistory";

/*
  The contract being tested: the index counts from the end of the history, so a
  null index means "the live draft", which sits one place past the newest entry.
  Stepping back restores older commands; stepping forward off the newest entry
  restores the empty draft. Stepping back off the oldest entry stays put.
*/

const HISTORY = ["whoami", "projects", "dir"];

describe("recallHistoryEntry", () => {
  describe("empty history", () => {
    it("returns null stepping backwards", () => {
      expect(recallHistoryEntry([], null, -1)).toBeNull();
    });

    it("returns null stepping forwards", () => {
      expect(recallHistoryEntry([], null, 1)).toBeNull();
    });

    it("returns null even when an index is supplied", () => {
      expect(recallHistoryEntry([], 0, -1)).toBeNull();
    });
  });

  describe("single-item history", () => {
    it("recalls the only entry when stepping back from the draft", () => {
      expect(recallHistoryEntry(["whoami"], null, -1)).toEqual({
        index: 0,
        input: "whoami",
      });
    });

    it("stays on that entry when stepping back again", () => {
      expect(recallHistoryEntry(["whoami"], 0, -1)).toEqual({
        index: 0,
        input: "whoami",
      });
    });

    it("restores the empty draft when stepping forward from the only entry", () => {
      expect(recallHistoryEntry(["whoami"], 0, 1)).toEqual({
        index: 1,
        input: "",
      });
    });
  });

  describe("stepping backwards with ArrowUp", () => {
    it("recalls the newest entry from the draft", () => {
      expect(recallHistoryEntry(HISTORY, null, -1)).toEqual({
        index: 2,
        input: "dir",
      });
    });

    it("walks to progressively older entries", () => {
      expect(recallHistoryEntry(HISTORY, 2, -1)?.input).toBe("projects");
      expect(recallHistoryEntry(HISTORY, 1, -1)?.input).toBe("whoami");
    });

    it("returns the index of the entry it recalled", () => {
      expect(recallHistoryEntry(HISTORY, 2, -1)?.index).toBe(1);
      expect(recallHistoryEntry(HISTORY, 1, -1)?.index).toBe(0);
    });
  });

  describe("the first history boundary", () => {
    it("does not step past the oldest entry", () => {
      expect(recallHistoryEntry(HISTORY, 0, -1)).toEqual({
        index: 0,
        input: "whoami",
      });
    });

    it("stays at the oldest entry across repeated presses", () => {
      const first = recallHistoryEntry(HISTORY, 1, -1);
      const second = first ? recallHistoryEntry(HISTORY, first.index, -1) : null;
      const third = second ? recallHistoryEntry(HISTORY, second.index, -1) : null;

      expect(second?.input).toBe("whoami");
      expect(third?.input).toBe("whoami");
      expect(third?.index).toBe(0);
    });
  });

  describe("stepping forwards with ArrowDown", () => {
    it("moves from the oldest entry to a newer one", () => {
      expect(recallHistoryEntry(HISTORY, 0, 1)).toEqual({
        index: 1,
        input: "projects",
      });
    });

    it("moves from the middle entry to the newest", () => {
      expect(recallHistoryEntry(HISTORY, 1, 1)).toEqual({
        index: 2,
        input: "dir",
      });
    });
  });

  describe("the last history boundary", () => {
    it("restores the empty draft when stepping past the newest entry", () => {
      expect(recallHistoryEntry(HISTORY, 2, 1)).toEqual({
        index: 3,
        input: "",
      });
    });

    it("keeps returning the empty draft on repeated presses", () => {
      const first = recallHistoryEntry(HISTORY, 2, 1);
      const second = first ? recallHistoryEntry(HISTORY, first.index, 1) : null;

      expect(first?.input).toBe("");
      expect(second?.input).toBe("");
      expect(second?.index).toBe(3);
    });
  });

  describe("a full round trip", () => {
    it("returns to the draft it started from", () => {
      const back = recallHistoryEntry(HISTORY, null, -1);
      const older = back ? recallHistoryEntry(HISTORY, back.index, -1) : null;
      const olderStill = older
        ? recallHistoryEntry(HISTORY, older.index, -1)
        : null;
      const forward = olderStill
        ? recallHistoryEntry(HISTORY, olderStill.index, 1)
        : null;
      const forwardAgain = forward
        ? recallHistoryEntry(HISTORY, forward.index, 1)
        : null;
      const restored = forwardAgain
        ? recallHistoryEntry(HISTORY, forwardAgain.index, 1)
        : null;

      expect(back?.input).toBe("dir");
      expect(older?.input).toBe("projects");
      expect(olderStill?.input).toBe("whoami");
      expect(forward?.input).toBe("projects");
      expect(forwardAgain?.input).toBe("dir");
      expect(restored).toEqual({ index: 3, input: "" });
    });
  });
});
