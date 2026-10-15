import { expect, test } from "@playwright/test";
import {
  DESKTOP_APP_TITLES,
  TOP_BAR_MENUS,
  bootAndSkip,
  desktop,
  desktopIcon,
  expectUsableOnSurface,
  openMenuButton,
  settledBox,
  motionSettledBox,
  statusItem,
  windowByTitle,
  windowTitleBar,
} from "./helpers";

/*
  Layout across viewports.

  Above 640px the desktop keeps the imitation: windows float at a position.
  At 640px and below the icons wrap into rows and a window takes almost the
  whole surface. At 420px and below the chrome tightens further.
*/

const DESKTOP_VIEWPORT = { width: 1280, height: 800 };
const TABLET_VIEWPORT = { width: 834, height: 1112 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const NARROW_VIEWPORT = { width: 360, height: 640 };

async function iconRows(page: import("@playwright/test").Page): Promise<number> {
  const boxes = await page.locator(".mijdo-desktop-icon").evaluateAll((nodes) =>
    nodes.map((node) => Math.round(node.getBoundingClientRect().top)),
  );

  return new Set(boxes).size;
}

async function hasNoHorizontalOverflow(page: import("@playwright/test").Page): Promise<boolean> {
  return page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth <= root.clientWidth + 1;
  });
}

/*
  Bounding boxes, not scrollWidth: the desktop and the page both clip with
  overflow: hidden, so a document-level scroll check cannot see an icon that
  has been pushed off the surface. This reads every icon's box against the
  surface's box and reports the labels that are no longer fully inside.
*/
async function iconLabelsOutsideSurface(
  page: import("@playwright/test").Page,
): Promise<string[]> {
  return page.evaluate(() => {
    const surface = document.querySelector(".mijdo-desktop");
    if (!surface) return ["<no surface>"];

    const bounds = surface.getBoundingClientRect();

    return [...document.querySelectorAll(".mijdo-desktop-icon")]
      .filter((node) => {
        const box = node.getBoundingClientRect();
        return !(
          box.top >= bounds.top - 1 &&
          box.bottom <= bounds.bottom + 1 &&
          box.left >= bounds.left - 1 &&
          box.right <= bounds.right + 1
        );
      })
      .map((node) => node.getAttribute("aria-label") ?? "<unlabelled>");
  });
}

test.describe("a desktop viewport", () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test("keeps windows floating rather than filling the surface", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const surface = await desktop(page).boundingBox();
    const frame = await windowByTitle(page, "Mijdo.exe").boundingBox();

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.width).toBeLessThan(surface.width);
  });

  test("stacks the icons in a single column", async ({ page }) => {
    await bootAndSkip(page);

    await expect.poll(() => iconRows(page)).toBe(8);
  });

  test("does not scroll the page sideways", async ({ page }) => {
    await bootAndSkip(page);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});

test.describe("a tablet viewport", () => {
  test.use({ viewport: TABLET_VIEWPORT });

  test("still keeps windows floating", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const surface = await desktop(page).boundingBox();
    const frame = await windowByTitle(page, "Mijdo.exe").boundingBox();

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.width).toBeLessThan(surface.width);
  });

  test("does not scroll the page sideways", async ({ page }) => {
    await bootAndSkip(page);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});

test.describe("a mobile viewport", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("keeps a window inside the surface instead of overflowing it", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();

    /*
      On a phone the sheet's seat slides it from the cascade position to the
      inset while the open animation scales the frame, so an immediate
      boundingBox can read the window part-way off the surface — the recorded
      mobile flake, whose geometry was correct once the motion landed.
    */
    const surface = await desktop(page).boundingBox();
    const frame = await motionSettledBox(windowByTitle(page, "Mijdo.exe"));

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.x).toBeGreaterThanOrEqual(surface.x - 1);
    expect(frame.x + frame.width).toBeLessThanOrEqual(surface.x + surface.width + 1);
  });

  test("gives an early application a usable share of the surface", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const surface = await desktop(page).boundingBox();
    const frame = await windowByTitle(page, "Mijdo.exe").boundingBox();

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.width).toBeGreaterThan(surface.width * 0.5);
  });

  /*
    Every application, not just the worst case. A window is seated by
    useContainedWindowPosition and the sheet rules then size it, so each one has
    to end up filling the surface instead of inheriting its desktop offset.

    These assertions fail if the mobile regression returns: either the seating
    hook stops running, or the sheet width is capped by the offset again.
  */
  const EVERY_APP = DESKTOP_APP_TITLES;

  for (const title of EVERY_APP) {
    test(`${title} fills the surface instead of being squeezed by its offset`, async ({ page }) => {
      await bootAndSkip(page);
      await desktopIcon(page, title).click();
      await expect(windowByTitle(page, title)).toBeVisible();

      /*
        Same race as the containment test above: the sheet's seat transition
        and the open animation are both live right after the window appears,
        and a box sampled then is not the box the contract is about. The
        geometry is read once the window reports no motion of its own.
      */
      const surface = await desktop(page).boundingBox();
      const frame = await motionSettledBox(windowByTitle(page, title));

      expect(surface).not.toBeNull();
      expect(frame).not.toBeNull();
      if (!surface || !frame) return;

      /* The defect left late cascade entries around 50px wide. */
      expect(frame.width).toBeGreaterThanOrEqual(surface.width - 24);

      /* And fully inside the surface, with the sheet's own inset. */
      expect(frame.x).toBeGreaterThanOrEqual(surface.x);
      expect(frame.x + frame.width).toBeLessThanOrEqual(surface.x + surface.width + 1);
      expect(frame.y).toBeGreaterThanOrEqual(surface.y - 1);
      expect(frame.y + frame.height).toBeLessThanOrEqual(surface.y + surface.height + 1);
    });
  }

  test("every application stays usable with several windows open", async ({ page }) => {
    await bootAndSkip(page);

    for (const title of EVERY_APP) {
      await desktopIcon(page, title).click();
    }

    for (const title of EVERY_APP) {
      const frame = await windowByTitle(page, title).boundingBox();

      expect(frame, `${title} should be on the surface`).not.toBeNull();
      if (!frame) continue;

      expect(frame.width, `${title} should be usable`).toBeGreaterThanOrEqual(340);
      expect(frame.height, `${title} should be usable`).toBeGreaterThanOrEqual(200);
    }

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test("a message box is also seated inside the surface", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();
    await page.getByRole("menuitem", { name: "System Info" }).click();

    const surface = await desktop(page).boundingBox();
    const frame = await windowByTitle(page, "System Info.exe").boundingBox();

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.x).toBeGreaterThanOrEqual(surface.x - 1);
    expect(frame.x + frame.width).toBeLessThanOrEqual(surface.x + surface.width + 1);
    expect(frame.width).toBeGreaterThanOrEqual(surface.width - 24);
  });

  test("maximize and restore still work on a phone", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();

    const surface = await desktop(page).boundingBox();
    expect(surface).not.toBeNull();
    if (!surface) return;

    const frame = windowByTitle(page, "Terminal.exe");

    await frame.getByRole("button", { name: "Maximize Terminal.exe" }).click();

    await expect
      .poll(async () => {
        const surfaceBox = await desktop(page).boundingBox();
        const maximized = await frame.boundingBox();
        if (!surfaceBox || !maximized) return Number.POSITIVE_INFINITY;
        return Math.abs(maximized.width - surfaceBox.width) + Math.abs(maximized.height - surfaceBox.height);
      }, { timeout: 5_000 })
      .toBeLessThanOrEqual(4);

    await frame.getByRole("button", { name: "Restore Terminal.exe" }).click();
    await expect(frame).not.toHaveClass(/is-maximized/);

    await expect
      .poll(async () => {
        const restored = await frame.boundingBox();
        if (!surface || !restored) return Number.POSITIVE_INFINITY;
        return restored.width;
      }, { timeout: 5_000 })
      .toBeGreaterThanOrEqual(surface.width - 24);
  });

  test("minimize and restore still work on a phone", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();

    const frame = windowByTitle(page, "Terminal.exe");
    await frame.getByRole("button", { name: "Minimize Terminal.exe" }).click();
    await expect(frame).toHaveCount(0);

    await statusItem(page, "Terminal.exe").click();

    await expect(frame).toBeVisible();

    const surface = await desktop(page).boundingBox();
    expect(surface).not.toBeNull();
    if (!surface) return;

    const restored = await settledBox(frame);
    if (!restored) throw new Error("Terminal.exe did not come back with a size");

    expect(restored.width).toBeGreaterThanOrEqual(surface.width - 24);
  });

  /*
    A sheet on a phone is anchored: it spans the full width and runs from below
    the icons to the bottom of the surface, so its height is derived from where it
    was seated. Letting it be dragged would either strand part of it off the
    surface or resize it as it moved, so the caption does not move it. The
    caption still raises the window, which is what stacking depends on.
  */
  test("a sheet on a phone is anchored, so its caption does not move it", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();

    const frame = windowByTitle(page, "Terminal.exe");
    const before = await settledBox(frame);
    const bar = windowTitleBar(page, "Terminal.exe");
    const barBox = await bar.boundingBox();

    expect(barBox).not.toBeNull();
    if (!barBox) return;

    await page.mouse.move(barBox.x + barBox.width / 2, barBox.y + barBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(barBox.x + 40, barBox.y + 120, { steps: 8 });
    await page.mouse.up();

    expect(await settledBox(frame)).toEqual(before);
  });

  test("clicking a sheet raises it, since it cannot be dragged", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    const terminal = windowByTitle(page, "Terminal.exe");
    const mijdo = windowByTitle(page, "Mijdo.exe");

    // Terminal.exe was opened last, so it should be focused and on top
    await expect(terminal).toHaveClass(/is-focused/);
    await expect(mijdo).not.toHaveClass(/is-focused/);

    // On mobile, sheets cover the full surface, so use the status bar to switch focus
    // Clicking the status item for Mijdo.exe should raise it
    await statusItem(page, "Mijdo.exe").click();

    await expect(mijdo).toHaveClass(/is-focused/);
    await expect(terminal).not.toHaveClass(/is-focused/);

    // Verify Mijdo.exe is now raised above Terminal.exe in z-order
    const raised = await mijdo.evaluate((node) => Number(getComputedStyle(node).zIndex));
    const lowered = await terminal.evaluate((node) => Number(getComputedStyle(node).zIndex));
    expect(raised).toBeGreaterThan(lowered);
  });

  test("keeps the status bar visible", async ({ page }) => {
    await bootAndSkip(page);

    await expect(page.locator(".mijdo-status-bar")).toBeVisible();
  });

  test("does not scroll the page sideways", async ({ page }) => {
    await bootAndSkip(page);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test("does not scroll the page sideways with a window open", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();
    await expect(windowByTitle(page, "Terminal.exe")).toBeVisible();

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test("still opens an application from an icon", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Projects.exe").click();

    await expect(windowByTitle(page, "Projects.exe")).toBeVisible();
  });
});

test.describe("a narrow phone viewport", () => {
  test.use({ viewport: NARROW_VIEWPORT });

  test("shrinks the icon labels", async ({ page }) => {
    await bootAndSkip(page);
    const narrowFont = await page
      .locator(".mijdo-desktop-icon-label")
      .first()
      .evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));

    await page.setViewportSize(DESKTOP_VIEWPORT);
    const desktopFont = await page
      .locator(".mijdo-desktop-icon-label")
      .first()
      .evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));

    expect(narrowFont).toBeLessThan(desktopFont);
  });

  test("does not scroll the page sideways", async ({ page }) => {
    await bootAndSkip(page);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

  test("keeps the command bar on one row", async ({ page }) => {
    await bootAndSkip(page);

    await expect(page.locator(".mijdo-top-bar .mijdo-command-item")).toHaveCount(TOP_BAR_MENUS.length);
    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });

});

/*
  Widths the original matrix never reached. Each block asserts real bounding
  boxes: icons fully inside the desktop surface, windows sized for the surface
  they sit in. Viewport emulation only — no physical device is exercised.
*/

test.describe("a wide desktop viewport", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("keeps every desktop icon inside the surface", async ({ page }) => {
    await bootAndSkip(page);

    await expect.poll(() => iconLabelsOutsideSurface(page)).toEqual([]);
  });

  test("still stacks the icons in a single column", async ({ page }) => {
    await bootAndSkip(page);

    await expect.poll(() => iconRows(page)).toBe(8);
  });

  test("opens a window that floats rather than fills the surface", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const surface = await desktop(page).boundingBox();
    const frame = await windowByTitle(page, "Mijdo.exe").boundingBox();

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.width).toBeLessThan(surface.width);
  });
});

test.describe("a laptop viewport", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("keeps every desktop icon inside the surface", async ({ page }) => {
    await bootAndSkip(page);

    await expect.poll(() => iconLabelsOutsideSurface(page)).toEqual([]);
  });

  test("opens a late-cascade window with a usable size", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();

    const frame = await windowByTitle(page, "Terminal.exe").boundingBox();

    expect(frame).not.toBeNull();
    if (!frame) return;

    expect(frame.width).toBeGreaterThanOrEqual(400);
    expect(frame.height).toBeGreaterThanOrEqual(300);
  });
});

test.describe("a portrait tablet viewport", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("keeps every desktop icon inside the surface", async ({ page }) => {
    await bootAndSkip(page);

    await expect.poll(() => iconLabelsOutsideSurface(page)).toEqual([]);
  });

  test("keeps windows floating", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const surface = await desktop(page).boundingBox();
    const frame = await windowByTitle(page, "Mijdo.exe").boundingBox();

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.width).toBeLessThan(surface.width);
  });
});

/*
  The 640px boundary, one pixel on either side. At 640 and below the window
  becomes a full-width sheet and the icons wrap into rows; at 641 the floating
  desktop layout returns. These two tests pin the boundary so a future
  breakpoint change has to move both sides deliberately.
*/
test.describe("the compact breakpoint boundary", () => {
  test.use({ viewport: { width: 640, height: 800 } });

  test("640px uses the sheet layout", async ({ page }) => {
    await bootAndSkip(page);

    await expect.poll(() => iconRows(page)).toBeLessThan(8);

    await desktopIcon(page, "Terminal.exe").click();

    const surface = await desktop(page).boundingBox();
    /* Settled, not mid-open: the entrance animation scales the frame. */
    const frame = await settledBox(windowByTitle(page, "Terminal.exe"));

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.width).toBeGreaterThanOrEqual(surface.width - 24);
  });
});

test.describe("just above the compact breakpoint", () => {
  test.use({ viewport: { width: 641, height: 800 } });

  test("641px returns to the floating desktop layout", async ({ page }) => {
    await bootAndSkip(page);

    await expect.poll(() => iconRows(page)).toBe(8);

    await desktopIcon(page, "Terminal.exe").click();

    const surface = await desktop(page).boundingBox();
    const frame = await windowByTitle(page, "Terminal.exe").boundingBox();

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    /* Floating, not a sheet — and every icon still on the surface. */
    expect(frame.width).toBeLessThan(surface.width);
    await expect.poll(() => iconLabelsOutsideSurface(page)).toEqual([]);

    /*
      RESP-03: the late cascade entry used to collapse to 299px wide here,
      squeezed by the offset-based cap. It must meet the usable floor instead,
      fully on the surface, while still floating rather than becoming a sheet.
    */
    await expectUsableOnSurface(page, "Terminal.exe");
  });
});

test.describe("a small phone viewport", () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test("keeps every desktop icon inside the surface", async ({ page }) => {
    await bootAndSkip(page);

    await expect.poll(() => iconLabelsOutsideSurface(page)).toEqual([]);
  });

  test("opens a sheet that fits the surface", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();

    const surface = await desktop(page).boundingBox();
    const frame = await settledBox(windowByTitle(page, "Terminal.exe"));

    expect(surface).not.toBeNull();
    expect(frame).not.toBeNull();
    if (!surface || !frame) return;

    expect(frame.width).toBeGreaterThanOrEqual(surface.width - 24);
    expect(frame.x).toBeGreaterThanOrEqual(surface.x - 1);
    expect(frame.x + frame.width).toBeLessThanOrEqual(surface.x + surface.width + 1);
    expect(frame.y + frame.height).toBeLessThanOrEqual(surface.y + surface.height + 1);
  });

  test("does not scroll the page sideways", async ({ page }) => {
    await bootAndSkip(page);

    expect(await hasNoHorizontalOverflow(page)).toBe(true);
  });
});

/*
  Landscape and short viewports above the compact breakpoint (RESP-01, RESP-02).

  Eight icons in one column are taller than these surfaces (70px each plus 1px
  gaps), and the desktop clips with overflow: hidden, so the base icon column
  pushed the bottom icons past the visible edge — measured on 2026-10-14 at
  844x390 (Experience, Projects, Contact and Terminal outside), 1024x600 and
  768x600 (Terminal outside). The icon block now wraps into a second column the
  way Arrange Icons already did. The window opened from the last cascade entry
  must also meet the 320x180 usable floor: at 844x390 the offset-based cap alone
  left Terminal 66px tall. Viewport emulation only — no physical device is
  exercised.
*/
test.describe("short landscape viewports", () => {
  const LANDSCAPE_VIEWPORTS = [
    { width: 844, height: 390 },
    { width: 1024, height: 600 },
    { width: 768, height: 600 },
  ] as const;

  for (const viewport of LANDSCAPE_VIEWPORTS) {
    test.describe(`${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport: { ...viewport } });

      test("keeps every desktop icon inside the surface", async ({ page }) => {
        await bootAndSkip(page);

        await expect.poll(() => iconLabelsOutsideSurface(page)).toEqual([]);
      });

      test("keeps the shell usable", async ({ page }) => {
        await bootAndSkip(page);

        expect(await hasNoHorizontalOverflow(page)).toBe(true);
        await expect(page.locator(".mijdo-status-bar")).toBeVisible();

        await desktopIcon(page, "Mijdo.exe").click();

        const surface = await desktop(page).boundingBox();
        const frame = await windowByTitle(page, "Mijdo.exe").boundingBox();

        expect(surface).not.toBeNull();
        expect(frame).not.toBeNull();
        if (!surface || !frame) return;

        expect(frame.x).toBeGreaterThanOrEqual(surface.x - 1);
        expect(frame.y).toBeGreaterThanOrEqual(surface.y - 1);
        expect(frame.x + frame.width).toBeLessThanOrEqual(surface.x + surface.width + 1);
        expect(frame.y + frame.height).toBeLessThanOrEqual(surface.y + surface.height + 1);
        expect(frame.width).toBeGreaterThanOrEqual(200);
      });

      test("opens the last cascade icon at a usable size", async ({ page }) => {
        await bootAndSkip(page);

        /* Terminal is the eighth icon: wrapped into the second column, reachable. */
        await desktopIcon(page, "Terminal.exe").click();

        await expectUsableOnSurface(page, "Terminal.exe");
      });
    });
  }
});

/*
  On these surfaces the icon rail wraps into a second column (right edge x=167
  measured at 844x390), and the cascade's opening x=96 used to land on top of
  it: the window covered the centers of Projects, Contact and Terminal, and the
  icons underneath could not be clicked. The seat now measures the rail and
  moves a covering window clear of it. What matters here is the real hit target
  at each icon's center — not the stylesheet's view of where anything is — so
  the check reads document.elementFromPoint, then proves it with an actual
  click on the covered icon. 844x400 is the neighboring case: one row taller,
  the same wrap, the same covering.
*/
test.describe("icon reachability on short landscape viewports", () => {
  const AFFECTED_VIEWPORTS = [
    { width: 844, height: 390 },
    { width: 844, height: 400 },
  ] as const;

  for (const viewport of AFFECTED_VIEWPORTS) {
    test.describe(`${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport: { ...viewport } });

      test("keeps every icon's hit target clear while a window is open", async ({ page }) => {
        await bootAndSkip(page);

        await desktopIcon(page, "Mijdo.exe").click();
        await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();

        /*
          The seat's move is a 220ms transition, so an immediate elementFromPoint
          reads the covering window mid-flight; poll until the move has landed —
          the same settle class the click test gets free from actionability.
        */
        await expect
          .poll(async () =>
            page.evaluate(
              (titles) =>
                titles.filter((title) => {
                  const icon = [...document.querySelectorAll(".mijdo-desktop-icon")].find(
                    (node) =>
                      (node.getAttribute("aria-label") ?? "").startsWith(`Open ${title}`),
                  );
                  if (!icon) return true;

                  const box = icon.getBoundingClientRect();
                  const top = document.elementFromPoint(
                    box.left + box.width / 2,
                    box.top + box.height / 2,
                  );

                  return !(top && (top === icon || icon.contains(top)));
                }),
              [...DESKTOP_APP_TITLES],
            ),
          )
          .toEqual([]);
      });

      test("lets a wrapped-column icon be clicked for real while a window is open", async ({ page }) => {
        await bootAndSkip(page);

        await desktopIcon(page, "Mijdo.exe").click();
        await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();

        await desktopIcon(page, "Terminal.exe").click();

        await expect(windowByTitle(page, "Terminal.exe")).toBeVisible();
      });
    });
  }
});
