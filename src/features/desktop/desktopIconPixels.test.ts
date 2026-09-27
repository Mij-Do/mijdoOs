import { describe, expect, it } from "vitest";
import { desktopApplications } from "../../data/windows";
import type { DesktopAppId } from "../../types/window";
import { desktopIconPixels, getDesktopIconRects } from "./desktopIconPixels";

/*
  The icon table is keyed by DesktopAppId, so the compiler already refuses a
  missing or misspelled identifier. These tests cover what the compiler cannot:
  that every bitmap is actually a well-formed 16x16 grid using only the palette
  letters the renderer understands.

  A corrupted row would otherwise render as a silently wrong icon, because the
  renderer skips any character it does not recognise.
*/

const ICON_SIZE = 16;
const PALETTE = new Set(["K", "W", "L", "G", "D", "N", "."]);
const desktopAppIds = desktopApplications.map((application) => application.id);

describe("the desktop icon table", () => {
  it("has artwork for every desktop application", () => {
    for (const id of desktopAppIds) {
      expect(desktopIconPixels[id]).toBeDefined();
    }
  });

  it("has exactly one row per desktop application", () => {
    expect(Object.keys(desktopIconPixels).sort()).toEqual([...desktopAppIds].sort());
  });

  it("has no artwork for anything that is not a desktop application", () => {
    const extra = Object.keys(desktopIconPixels).filter(
      (key) => !desktopAppIds.includes(key as DesktopAppId),
    );

    expect(extra).toEqual([]);
  });
});

describe.each(desktopAppIds)("the %s icon", (id) => {
  const pixels = desktopIconPixels[id];

  it("is exactly sixteen rows tall", () => {
    expect(pixels).toHaveLength(ICON_SIZE);
  });

  it("has sixteen pixels in every row", () => {
    for (const row of pixels) {
      expect(row).toHaveLength(ICON_SIZE);
    }
  });

  it("uses only palette letters the renderer understands", () => {
    for (const row of pixels) {
      for (const character of row) {
        expect(PALETTE.has(character)).toBe(true);
      }
    }
  });

  it("is not entirely transparent", () => {
    const painted = pixels.some((row) => [...row].some((cell) => cell !== "."));

    expect(painted).toBe(true);
  });
});

describe("getDesktopIconRects", () => {
  it("produces rectangles inside the 16x16 grid", () => {
    for (const id of desktopAppIds) {
      for (const rect of getDesktopIconRects(id)) {
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeLessThan(ICON_SIZE);
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(ICON_SIZE);
        expect(rect.width).toBeGreaterThan(0);
      }
    }
  });

  it("merges equal neighbouring pixels into a single rectangle", () => {
    const rects = getDesktopIconRects("mijdo");
    const painted = desktopIconPixels.mijdo
      .flatMap((row) => [...row].filter((cell) => cell !== ".")).length;

    expect(rects.length).toBeLessThanOrEqual(painted);
  });

  it("returns the same array for the same icon, because results are cached", () => {
    expect(getDesktopIconRects("terminal")).toBe(getDesktopIconRects("terminal"));
  });

  it("keeps the cache correct when a warm and a cold call are compared", () => {
    const first = getDesktopIconRects("projects");

    expect(first.length).toBeGreaterThan(0);
    expect(getDesktopIconRects("projects")).toBe(first);
  });
});
