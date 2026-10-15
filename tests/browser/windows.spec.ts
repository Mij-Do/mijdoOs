import { expect, test } from "@playwright/test";
import {
  bootAndSkip,
  desktop,
  desktopIcon,
  expectUsableOnSurface,
  menuItem,
  openMenuButton,
  statusItem,
  terminalInput,
  windowByTitle,
  windowTitleBar,
  settledBox,
  motionSettledBox,
} from "./helpers";

/*
  The window lifecycle as the shell actually implements it: open, close,
  minimize, restore, maximize, focus, stacking and dragging.

  Note that a desktop icon opens its application on a single click, which is
  what the icon's onClick does; the tests describe that behavior rather than
  the double-click that a classic desktop would use.
*/

test.describe("opening a window", () => {
  test("opens an application from its desktop icon", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Mijdo.exe").click();

    await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();
  });

  test("shows the window title from the registry", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Projects.exe").click();

    await expect(windowByTitle(page, "Projects.exe").locator(".mijdo-window-title")).toHaveText("Projects.exe");
  });

  test("marks the icon as running once its window is open", async ({ page }) => {
    await bootAndSkip(page);
    const icon = desktopIcon(page, "Skills.exe");

    await expect(icon).toHaveAttribute("data-running", "false");

    await icon.click();

    await expect(icon).toHaveAttribute("data-running", "true");
  });

  test("updates the icon's accessible name once the application is running", async ({ page }) => {
    await bootAndSkip(page);
    const icon = desktopIcon(page, "Skills.exe");

    await icon.click();

    await expect(icon).toHaveAttribute("aria-label", "Open Skills.exe, already running");
  });

  test("gives a freshly opened window the focused title bar", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Mijdo.exe").click();

    await expect(windowByTitle(page, "Mijdo.exe")).toHaveClass(/is-focused/);
    await expect(windowTitleBar(page, "Mijdo.exe")).not.toHaveClass(/inactive/);
  });

  test("adds a task button to the status bar for the open window", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Contact.exe").click();

    await expect(statusItem(page, "Contact.exe")).toBeVisible();
  });

  test("focuses the most recently opened window", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    await expect(windowByTitle(page, "Terminal.exe")).toHaveClass(/is-focused/);
    await expect(windowByTitle(page, "Mijdo.exe")).not.toHaveClass(/is-focused/);
  });

  test("raises the most recently opened window above the others", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    const first = await windowByTitle(page, "Mijdo.exe").evaluate((node) => Number(getComputedStyle(node).zIndex));
    const second = await windowByTitle(page, "Terminal.exe").evaluate((node) => Number(getComputedStyle(node).zIndex));

    expect(second).toBeGreaterThan(first);
  });
});

test.describe("closing a window", () => {
  test("removes the window when its close control is used", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Close Mijdo.exe" }).click();

    await expect(windowByTitle(page, "Mijdo.exe")).toHaveCount(0);
  });

  test("removes the task button when the window closes", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await expect(statusItem(page, "Mijdo.exe")).toBeVisible();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Close Mijdo.exe" }).click();

    await expect(statusItem(page, "Mijdo.exe")).toHaveCount(0);
  });

  test("clears the running marker on the icon", async ({ page }) => {
    await bootAndSkip(page);
    const icon = desktopIcon(page, "Mijdo.exe");

    await icon.click();
    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Close Mijdo.exe" }).click();

    await expect(icon).toHaveAttribute("data-running", "false");
  });

  test("focuses another window after the active one is closed", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    await windowByTitle(page, "Terminal.exe").getByRole("button", { name: "Close Terminal.exe" }).click();

    await expect(windowByTitle(page, "Mijdo.exe")).toHaveClass(/is-focused/);
  });

  /*
    The frame unmounts when the window closes, so focus would otherwise land
    on the document body and the next Tab press would start over from the
    command bar. The icon of the application that just closed is the element
    that still exists, so it is where the keyboard must come back to.
  */
  test("returns focus to the desktop icon after the window closes", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Close Mijdo.exe" }).click();

    await expect(desktopIcon(page, "Mijdo.exe")).toBeFocused();
  });

  test("closes the active window from the File menu", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await openMenuButton(page, "File").click();
    await menuItem(page, "Close Active Window").click();

    await expect(windowByTitle(page, "Mijdo.exe")).toHaveCount(0);
  });
});

test.describe("minimizing and restoring", () => {
  test("removes a minimized window from the visible layer", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Minimize Mijdo.exe" }).click();

    await expect(windowByTitle(page, "Mijdo.exe")).toHaveCount(0);
  });

  test("keeps the task button and marks it as restorable", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Minimize Mijdo.exe" }).click();

    await expect(statusItem(page, "Mijdo.exe")).toHaveAttribute("data-minimized", "true");
    await expect(statusItem(page, "Mijdo.exe")).toHaveAttribute("aria-label", "Restore Mijdo.exe");
  });

  /*
    Minimizing unmounts the frame, and the minimize button it held goes with
    it. The task button is the entry that still exists and whose activation
    restores this very window, so the keyboard lands there instead of on the
    document body.
  */
  test("returns focus to the task button after minimizing", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Minimize Mijdo.exe" }).click();

    await expect(statusItem(page, "Mijdo.exe")).toBeFocused();
  });

  test("restores a minimized window from the status bar", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Minimize Mijdo.exe" }).click();
    await expect(windowByTitle(page, "Mijdo.exe")).toHaveCount(0);

    await statusItem(page, "Mijdo.exe").click();

    await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();
    await expect(statusItem(page, "Mijdo.exe")).toHaveAttribute("data-minimized", "false");
  });

  test("restores a minimized window back to the front", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Minimize Mijdo.exe" }).click();
    await desktopIcon(page, "Terminal.exe").click();

    await statusItem(page, "Mijdo.exe").click();

    const minimized = await windowByTitle(page, "Mijdo.exe").evaluate((node) => Number(getComputedStyle(node).zIndex));
    const terminal = await windowByTitle(page, "Terminal.exe").evaluate((node) => Number(getComputedStyle(node).zIndex));

    expect(minimized).toBeGreaterThan(terminal);
  });
});

test.describe("maximizing", () => {
  test("maximizes a normal window", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Maximize Mijdo.exe" }).click();

    await expect(windowByTitle(page, "Mijdo.exe")).toHaveClass(/is-maximized/);
  });

  test("offers a restore control once maximized", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Maximize Mijdo.exe" }).click();

    await expect(
      windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Restore Mijdo.exe" }),
    ).toBeVisible();
  });

  test("restores a maximized window back to normal", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Maximize Mijdo.exe" }).click();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Restore Mijdo.exe" }).click();

    await expect(windowByTitle(page, "Mijdo.exe")).not.toHaveClass(/is-maximized/);
  });

  test("a maximized window covers the desktop area", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Maximize Mijdo.exe" }).click();

    /*
      A window animates between sizes, so the geometry is polled rather than
      read once: the point of the check is where the window ends up, not what
      it looked like one frame after the click.
    */
    await expect
      .poll(async () => {
        const surface = await page.locator(".mijdo-desktop").boundingBox();
        const frame = await windowByTitle(page, "Mijdo.exe").boundingBox();

        if (!surface || !frame) return Number.POSITIVE_INFINITY;

        return Math.abs(frame.width - surface.width) + Math.abs(frame.height - surface.height);
      }, { timeout: 5_000 })
      .toBeLessThanOrEqual(4);
  });

  /*
    Maximize only overlays the window; the frame keeps its own position and
    size in state. Restoring must land back on the exact box the visitor
    maximized from, not merely "a normal-sized window".

    Both boxes are measured through the window's own motion rather than by
    guessing when it settled: the open is a transform animation and the restore
    is a geometry transition whose state class drops before the box lands, so
    two identical samples can both precede the movement (the recorded TEST-001
    flake, where the geometry was correct about a second later).
  */
  test("returns a maximized window to the position and size it had before", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const win = windowByTitle(page, "Mijdo.exe");

    const before = await motionSettledBox(win);

    await win.getByRole("button", { name: "Maximize Mijdo.exe" }).click();
    await win.getByRole("button", { name: "Restore Mijdo.exe" }).click();

    /* The observable product state that says the restore has been committed. */
    await expect(win).not.toHaveClass(/is-maximized/);

    const after = await motionSettledBox(win);

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    if (!before || !after) return;

    expect(after.x).toBeCloseTo(before.x, 0);
    expect(after.y).toBeCloseTo(before.y, 0);
    expect(after.width).toBeCloseTo(before.width, 0);
    expect(after.height).toBeCloseTo(before.height, 0);
  });
});

test.describe("focus and stacking", () => {
  test("clicking a window brings it to the front", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    await windowTitleBar(page, "Mijdo.exe").click();

    await expect(windowByTitle(page, "Mijdo.exe")).toHaveClass(/is-focused/);
  });

  test("focusing from the status bar raises the window", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    await statusItem(page, "Mijdo.exe").click();

    const mijdo = await windowByTitle(page, "Mijdo.exe").evaluate((node) => Number(getComputedStyle(node).zIndex));
    const terminal = await windowByTitle(page, "Terminal.exe").evaluate((node) => Number(getComputedStyle(node).zIndex));

    expect(mijdo).toBeGreaterThan(terminal);
  });

  test("marks exactly one window as focused at a time", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();
    await desktopIcon(page, "Projects.exe").click();

    await expect(page.locator(".mijdo-window.is-focused")).toHaveCount(1);
  });
});

test.describe("dragging", () => {
  test("moves a window when its title bar is dragged", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const before = await settledBox(windowByTitle(page, "Mijdo.exe"));
    const bar = windowTitleBar(page, "Mijdo.exe");
    const box = await bar.boundingBox();

    expect(before).not.toBeNull();
    expect(box).not.toBeNull();
    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40, { steps: 8 });
    await page.mouse.up();

    const after = await settledBox(windowByTitle(page, "Mijdo.exe"));

    expect(after).not.toBeNull();
    if (!before || !after) return;

    expect(after.x - before.x).toBeCloseTo(80, 0);
    expect(after.y - before.y).toBeCloseTo(40, 0);
  });

  test("keeps a dragged window reachable instead of losing it off-screen", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const bar = windowTitleBar(page, "Mijdo.exe");
    const box = await bar.boundingBox();

    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(20, 20, { steps: 8 });
    await page.mouse.move(-4000, -4000, { steps: 12 });
    await page.mouse.up();

    const frame = await windowByTitle(page, "Mijdo.exe").boundingBox();

    expect(frame).not.toBeNull();
    if (!frame) return;

    expect(frame.x).toBeGreaterThanOrEqual(-1);
    expect(frame.width).toBeGreaterThan(100);
  });

  /*
    The same reachability guarantee in the opposite corner (RESP-02). The
    offset-based size caps used to shrink the frame to 132x40 at the clamp,
    because they subtracted the very offset the clamp allowed. The caps now
    carry a 320x180 floor and the drag clamp honors the same floor, so the
    window stays entirely on the surface at a usable size with its title bar
    grabbable.
  */
  test("keeps a window dragged to the bottom-right edge fully on the surface", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const surface = await desktop(page).boundingBox();
    const bar = windowTitleBar(page, "Mijdo.exe");
    const box = await bar.boundingBox();

    expect(surface).not.toBeNull();
    if (!surface || !box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 5000, box.y + 5000, { steps: 16 });
    await page.mouse.up();

    await expectUsableOnSurface(page, "Mijdo.exe");
  });

  /*
    The other three corners of the same guarantee: the clamp is symmetric, so
    each edge is checked with the pointer driven far past it.
  */
  const OTHER_CORNERS = [
    { name: "top-right", dx: 5000, dy: -5000 },
    { name: "bottom-left", dx: -5000, dy: 5000 },
    { name: "top-left", dx: -5000, dy: -5000 },
  ] as const;

  for (const corner of OTHER_CORNERS) {
    test(`keeps a window dragged to the ${corner.name} corner usable`, async ({ page }) => {
      await bootAndSkip(page);
      await desktopIcon(page, "Mijdo.exe").click();

      const bar = windowTitleBar(page, "Mijdo.exe");
      const box = await bar.boundingBox();

      expect(box).not.toBeNull();
      if (!box) return;

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + corner.dx, box.y + corner.dy, { steps: 16 });
      await page.mouse.up();

      await expectUsableOnSurface(page, "Mijdo.exe");
    });
  }

  test("does not move a window when the drag starts on a control", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const before = await settledBox(windowByTitle(page, "Mijdo.exe"));
    const control = windowByTitle(page, "Mijdo.exe").getByRole("button", { name: "Maximize Mijdo.exe" });
    const box = await control.boundingBox();

    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + 120, { steps: 8 });
    await page.mouse.up();

    const after = await settledBox(windowByTitle(page, "Mijdo.exe"));

    if (!before || !after) return;

    expect(after.x).toBeCloseTo(before.x, 0);
    expect(after.y).toBeCloseTo(before.y, 0);
  });

  /*
    Press the title bar and hold: grab position for the two tests below, which
    resize the viewport while the pointer is still down.
  */
  async function startHeldDrag(page: import("@playwright/test").Page) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const win = windowByTitle(page, "Mijdo.exe");
    await expect(win).toBeVisible();

    const bar = await windowTitleBar(page, "Mijdo.exe").boundingBox();
    expect(bar).not.toBeNull();
    if (!bar) return { win, origin: null };

    const origin = { x: bar.x + bar.width / 2, y: bar.y + 10 };

    await page.mouse.move(origin.x, origin.y);
    await page.mouse.down();
    await page.mouse.move(origin.x + 60, origin.y + 40, { steps: 5 });

    return { win, origin };
  }

  /* The window must have settled onto the surface, and its close control must
     be the topmost element at its own center — a window clipped by the
     surface's overflow: hidden fails this even though its box still exists. */
  async function expectReachableOnSurface(
    page: import("@playwright/test").Page,
    win: ReturnType<typeof windowByTitle>,
  ) {
    await expect
      .poll(async () => {
        const surface = await desktop(page).boundingBox();
        const frame = await win.boundingBox();
        if (!surface || !frame) return false;

        return (
          frame.x >= surface.x - 1 &&
          frame.y >= surface.y - 1 &&
          frame.x + frame.width <= surface.x + surface.width + 1 &&
          frame.y + frame.height <= surface.y + surface.height + 1
        );
      }, { timeout: 5000 })
      .toBe(true);

    const close = win.getByRole("button", { name: "Close Mijdo.exe" });

    await expect
      .poll(
        () =>
          close
            .evaluate((node) => {
              const box = node.getBoundingClientRect();
              const top = document.elementFromPoint(
                box.x + box.width / 2,
                box.y + box.height / 2,
              );
              return Boolean(top && (top === node || node.contains(top)));
            })
            .catch(() => false),
        { timeout: 5000 },
      )
      .toBe(true);
  }

  /*
    Reproduced at 1280x800: hold a drag, shrink past the 640px compact
    breakpoint, move once more, release. The drag used to go on writing the
    floating position with its pre-shrink bounds while the compact rules
    restated the size, and the window ended up right of the surface with its
    controls clipped away. Now the drag lets go when the breakpoint passes —
    the seat re-lays the window out as the compact sheet — and the window ends
    up on the surface with reachable controls.
  */
  test("keeps a window reachable when the viewport shrinks into compact during a drag", async ({ page }) => {
    const { win, origin } = await startHeldDrag(page);
    expect(origin).not.toBeNull();
    if (!win || !origin) return;

    await page.setViewportSize({ width: 640, height: 800 });
    await page.mouse.move(origin.x + 120, origin.y + 80, { steps: 5 });
    await page.mouse.up();

    await expectReachableOnSurface(page, win);

    /* The drag must really be over: later pointer motion does not move it. */
    const before = await settledBox(win);
    await page.mouse.move(300, 400, { steps: 3 });
    await page.mouse.move(120, 600, { steps: 3 });
    const after = await settledBox(win);

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    if (!before || !after) return;

    expect(after.x).toBeCloseTo(before.x, 0);
    expect(after.y).toBeCloseTo(before.y, 0);

    await win.getByRole("button", { name: "Close Mijdo.exe" }).click();
    await expect(win).toHaveCount(0);
  });

  /*
    The same race one step above the breakpoint, where the window stays
    floating: the pointer is pushed to the right edge after the shrink, which
    is what exposed the stale drag bounds. The fresh clamp must hold the
    window's floored size on the surface instead.
  */
  test("keeps a window reachable when the viewport shrinks just above compact during a drag", async ({ page }) => {
    const { win, origin } = await startHeldDrag(page);
    expect(origin).not.toBeNull();
    if (!win || !origin) return;

    await page.setViewportSize({ width: 660, height: 800 });
    await page.mouse.move(650, origin.y + 120, { steps: 8 });
    await page.mouse.up();

    await expectReachableOnSurface(page, win);

    const before = await settledBox(win);
    await page.mouse.move(300, 400, { steps: 3 });
    const after = await settledBox(win);

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    if (!before || !after) return;

    expect(after.x).toBeCloseTo(before.x, 0);
    expect(after.y).toBeCloseTo(before.y, 0);
  });
});

test.describe("system dialogs", () => {
  test("opens a dialog from the command bar", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();

    await expect(windowByTitle(page, "System Info.exe")).toBeVisible();
  });

  test("does not offer a maximize control on a dialog", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();

    await expect(
      windowByTitle(page, "System Info.exe").getByRole("button", { name: /Maximize/ }),
    ).toHaveCount(0);
  });

  test("closes a dialog with Escape", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();
    await expect(windowByTitle(page, "System Info.exe")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(windowByTitle(page, "System Info.exe")).toHaveCount(0);
  });

  /*
    A click on the dialog's own non-interactive chrome drops keyboard focus to
    the document body, and a keydown with the body as its target never passes
    through the React root, where the dialog's key handler lives. Escape must
    still dismiss the message box in that state.
  */
  test("closes a dialog with Escape after its title is clicked", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();
    await expect(windowByTitle(page, "System Info.exe")).toBeVisible();

    await windowByTitle(page, "System Info.exe").locator(".mijdo-window-title").click();

    await page.keyboard.press("Escape");

    await expect(windowByTitle(page, "System Info.exe")).toHaveCount(0);
  });

  test("closes a dialog with Escape after its content is clicked", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();
    await expect(windowByTitle(page, "System Info.exe")).toBeVisible();

    await windowByTitle(page, "System Info.exe").getByText("System:", { exact: false }).click();

    await page.keyboard.press("Escape");

    await expect(windowByTitle(page, "System Info.exe")).toHaveCount(0);
  });

  /*
    Escape belongs to the window that holds the keyboard. With the terminal in
    front of the message box the press is the terminal's, so the message box
    must stay where it is.
  */
  test("leaves the message box open when Escape is meant for another window", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();
    await expect(windowByTitle(page, "System Info.exe")).toBeVisible();

    await desktopIcon(page, "Terminal.exe").click();
    await expect(terminalInput(page)).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(windowByTitle(page, "System Info.exe")).toBeVisible();
  });

  /*
    A dialog has no desktop icon of its own, so when it closes the keyboard
    falls back to the first icon — the desktop's own entry point — instead of
    the document body.
  */
  test("returns focus to the desktop when a dialog closes", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();

    await windowByTitle(page, "System Info.exe").getByRole("button", { name: "OK" }).click();

    await expect(desktopIcon(page, "Mijdo.exe")).toBeFocused();
  });

  /*
    A dialog is a message box: it takes focus on open so Escape or Enter can
    dismiss it straight away, without hunting for the window first.
  */
  test("takes focus on its OK button when it opens", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();

    await expect(
      windowByTitle(page, "System Info.exe").getByRole("button", { name: "OK" }),
    ).toBeFocused();
  });

  test("leaves the desktop usable while a dialog is open", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await menuItem(page, "System Info").click();
    await expect(windowByTitle(page, "System Info.exe")).toBeVisible();

    await expect(page.locator(".mijdo-desktop")).toBeVisible();
    await expect(page.locator(".mijdo-status-bar")).toBeVisible();
  });
});

test.describe("show desktop", () => {
  test("minimizes every open window", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    await openMenuButton(page, "View").click();
    await menuItem(page, "Show Desktop").click();

    await expect(page.locator(".mijdo-window")).toHaveCount(0);
  });

  test("keeps the task buttons so the windows can be restored", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    await openMenuButton(page, "View").click();
    await menuItem(page, "Show Desktop").click();

    await expect(statusItem(page, "Mijdo.exe")).toBeVisible();
    await expect(statusItem(page, "Terminal.exe")).toBeVisible();
  });

  test("restores a window from the task bar after showing the desktop", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await openMenuButton(page, "View").click();
    await menuItem(page, "Show Desktop").click();
    await expect(page.locator(".mijdo-window")).toHaveCount(0);

    await statusItem(page, "Mijdo.exe").click();

    await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();
  });
});
