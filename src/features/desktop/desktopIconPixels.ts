/*
  Desktop icon bitmaps.

  Each icon is a 16x16 bitmap written as text, one character per pixel, which
  is how the icons would have been authored on the machine this system is
  imitating. The renderer merges horizontal runs of equal pixels into single
  rectangles, so an icon costs a handful of nodes instead of 256.

  The table is keyed by DesktopAppId, so an application without artwork is a
  TypeScript error rather than an icon that silently fails to render.

  The palette letters map onto the system colours only, so the artwork can
  never drift away from the rest of the interface:

    K  black      W  white     L  light gray
    G  gray       D  dark gray N  navy      .  transparent
*/

import type { DesktopAppId } from "../../types/window";

const PIXEL_COLORS: Record<string, string> = {
  K: "var(--mijdo-black)",
  W: "var(--mijdo-white)",
  L: "var(--mijdo-light)",
  G: "var(--mijdo-gray)",
  D: "var(--mijdo-dark)",
  N: "var(--mijdo-navy)",
};

const MIJDO: readonly string[] = [
  "................",
  "....KKKKKKKK....",
  "..KKWWWWWWWWKK..",
  "..KWWLLLLLLWWK..",
  "..KWWLLLLLLWWK..",
  "..KWWLLLLLLWWK..",
  "..KWWLLLLLLWWK..",
  "..KWWLLLLLLWWK..",
  "..KKWWWWWWWWKK..",
  "....KKKKKKKK....",
  ".....K....K.....",
  ".....K....K.....",
  "....K.KKKK.K....",
  "...KKK....KKK...",
  "................",
  "................",
];

const PROFILE: readonly string[] = [
  "................",
  ".....KKKKKK.....",
  "....KWWWWWWK....",
  "....KWKKKKWK....",
  "....KWKWWKWK....",
  "....KWKKKKWK....",
  "....KWWWWWWK....",
  ".....KKKKKK.....",
  "....KKKKKKKK....",
  "..KKWWWWWWWWKK..",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWKKWWWWWWKKWK.",
  ".KWKKWWWWWWKKWK.",
  "..KKKKKKKKKKKK..",
  "................",
];

const EDUCATION: readonly string[] = [
  "................",
  "......KKKK......",
  ".....KWWWWK.....",
  "....KKWWWWKK....",
  "..KKKKWWWWKKKK..",
  ".KWWWWWWWWWWWWK.",
  ".KWKWWWWWWWWKWK.",
  ".KWWWWWWWWWWWWK.",
  "..KKKKKKKKKKKK..",
  ".....KWWWWK.....",
  "....KWWWWWWK....",
  "....KWKKKKWK....",
  "....KWWWWWWK....",
  "....KKKKKKKK....",
  "................",
  "................",
];

const SKILLS: readonly string[] = [
  ".......KK.......",
  "....KKKKKKKK....",
  "...KKWWWWWWKK...",
  "..KKWWWWWWWWKK..",
  "..KWWWWWWWWWWK..",
  ".KKWWWWKKWWWWKK.",
  ".KWWWWK..KWWWWK.",
  "KWWWWK....KWWWWK",
  "KWWWWK....KWWWWK",
  ".KWWWWK..KWWWWK.",
  ".KKWWWWKKWWWWKK.",
  "..KWWWWWWWWWWK..",
  "..KKWWWWWWWWKK..",
  "...KKWWWWWWKK...",
  "....KKKKKKKK....",
  ".......KK.......",
];

const EXPERIENCE: readonly string[] = [
  "................",
  ".....KKKKKK.....",
  "....KKKKKKKK....",
  "..KKKKKKKKKKKK..",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWKKKKKKWWWK.",
  ".KWWWKKKKKKWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KKKKKKKKKKKKKK.",
  "................",
  "................",
];

const PROJECTS: readonly string[] = [
  "................",
  "..KKKK..........",
  "..KWWK..........",
  "..KWWKKKKKKKKKK.",
  "..KWWWWWWWWWWWWK",
  "..KWWKKWWKKWWWWK",
  "..KWWKKWWKKWWWWK",
  "..KWWKKWWKKWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KWWWWWWWWWWWWK",
  "..KKKKKKKKKKKKKK",
  "................",
  "................",
];

const CONTACT: readonly string[] = [
  "................",
  "................",
  "..KKKKKKKKKKKK..",
  ".KKWWWWWWWWWWKK.",
  ".KWKWWWWWWWWKWK.",
  ".KWWKWWWWWWKWWK.",
  ".KWWWKWWWWKWWWK.",
  ".KWWWWKWWKWWWWK.",
  ".KWWWWWKKWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KLLLLLLLLLLLLK.",
  ".KKKKKKKKKKKKKK.",
  "................",
  "................",
  "................",
];

const TERMINAL: readonly string[] = [
  "................",
  "..KKKKKKKKKKKK..",
  ".KWWWWWWWWWWWWK.",
  ".KWWKWWWWWWWWWK.",
  ".KWWWKWWWWWWWWK.",
  ".KWWWWKWWWWWWWK.",
  ".KWWWKWWWWWWWWK.",
  ".KWWKWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWKKKKWWK.",
  ".KWWWWWWKKKKWWK.",
  ".KWWWWWWWWWWWWK.",
  ".KKKKKKKKKKKKKK.",
  "................",
  "................",
  "................",
];

export const desktopIconPixels: Record<DesktopAppId, readonly string[]> = {
  mijdo: MIJDO,
  profile: PROFILE,
  education: EDUCATION,
  skills: SKILLS,
  experience: EXPERIENCE,
  projects: PROJECTS,
  contact: CONTACT,
  terminal: TERMINAL,
};

/*
  Collapses a bitmap into the rectangles that actually have to be painted.
  A row of sixteen pixels costs at most sixteen nodes, and a run of equal
  pixels costs one, which keeps every icon inside the same budget.
*/
function toRects(pixels: readonly string[]) {
  const rects: { x: number; y: number; width: number; fill: string }[] = [];

  pixels.forEach((row, y) => {
    let x = 0;

    while (x < row.length) {
      const fill = PIXEL_COLORS[row[x] as string];

      if (fill === undefined) {
        x += 1;
        continue;
      }

      let width = 1;

      while (x + width < row.length && row[x + width] === row[x]) width += 1;

      rects.push({ x, y, width, fill });
      x += width;
    }
  });

  return rects;
}

const rectCache = new Map<
  DesktopAppId,
  { x: number; y: number; width: number; fill: string }[]
>();

/*
  The bitmaps are constant, so the collapsed rectangles are computed once per
  application rather than on every render of the desktop.
*/
export function getDesktopIconRects(id: DesktopAppId) {
  const cached = rectCache.get(id);

  if (cached) return cached;

  const pixels = desktopIconPixels[id];

  if (!pixels) return [];

  const rects = toRects(pixels);

  rectCache.set(id, rects);

  return rects;
}
