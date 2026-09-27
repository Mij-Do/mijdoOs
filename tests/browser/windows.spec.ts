import { expect, test } from "@playwright/test";
import {
  bootAndSkip,
  desktopIcon,
  menuItem,
  openMenuButton,
  statusItem,
  windowByTitle,
  windowTitleBar,
  settledBox,
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
