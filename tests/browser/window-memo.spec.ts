import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  bootAndSkip,
  desktopIcon,
  runTerminalCommand,
  settledBox,
  statusItem,
  windowByTitle,
  windowTitleBar,
} from "./helpers";

/*
  Regression coverage for the memoised window registry boundary (Phase 3C).
  A drag dispatches "move", which replaces only the dragged window's state
  object, so the other windows bail out of rendering. These tests pin the two
  ways that boundary could break: a later state change failing to reach a
  window the drag skipped, or the dragged window's own controls going stale.
  Everything is asserted through product behavior — no render counting.
*/

async function dragWindow(page: Page, title: string, dx: number, dy: number) {
  const bar = windowTitleBar(page, title);
  const box = await bar.boundingBox();

  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 8 });
  await page.mouse.up();
}

test.describe("memoised window boundary", () => {
  test("moves focus styling to the other window after a drag", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Projects.exe").click();

    await dragWindow(page, "Mijdo.exe", 80, 40);
    await expect(windowByTitle(page, "Mijdo.exe")).toHaveClass(/is-focused/);

    /*
      The status bar rather than the Projects title bar: the dragged Mijdo
      frame physically overlaps that title bar at this cascade offset, and the
      task button is the z-order-safe way a user focuses a covered window.
    */
    await statusItem(page, "Projects.exe").click();

    await expect(windowByTitle(page, "Projects.exe")).toHaveClass(/is-focused/);
    await expect(windowByTitle(page, "Mijdo.exe")).not.toHaveClass(/is-focused/);
    await expect(windowByTitle(page, "Mijdo.exe").locator(".mijdo-titlebar")).toHaveClass(/inactive/);
  });

  test("keeps another window's terminal usable after a different window is dragged", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();
    await desktopIcon(page, "Mijdo.exe").click();

    await dragWindow(page, "Mijdo.exe", 80, 40);

    await runTerminalCommand(page, "help");
    await expect(
      windowByTitle(page, "Terminal.exe").locator(".mijdo-terminal-line").filter({ hasText: "help" }),
    ).not.toHaveCount(0);
  });

  test("applies later state changes to a window the drag skipped", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();
    await desktopIcon(page, "Mijdo.exe").click();

    await dragWindow(page, "Mijdo.exe", 80, 40);

    const terminal = windowByTitle(page, "Terminal.exe");

    await terminal.getByRole("button", { name: "Minimize Terminal.exe" }).click();
    await expect(terminal).toHaveCount(0);
    await expect(statusItem(page, "Terminal.exe")).toHaveAttribute("data-minimized", "true");

    await statusItem(page, "Terminal.exe").click();
    await expect(terminal).toBeVisible();

    await terminal.getByRole("button", { name: "Maximize Terminal.exe" }).click();
    await expect(terminal).toHaveClass(/is-maximized/);

    await terminal.getByRole("button", { name: "Restore Terminal.exe" }).click();
    await expect(terminal).not.toHaveClass(/is-maximized/);
  });

  test("keeps the dragged window's own controls working after dragging", async ({ page }) => {
    await bootAndSkip(page);
    const icon = desktopIcon(page, "Mijdo.exe");
    await icon.click();

    const before = await settledBox(windowByTitle(page, "Mijdo.exe"));
    await dragWindow(page, "Mijdo.exe", 60, 30);
    const after = await settledBox(windowByTitle(page, "Mijdo.exe"));

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    if (before && after) {
      expect(after.x - before.x).toBeCloseTo(60, 0);
      expect(after.y - before.y).toBeCloseTo(30, 0);
    }

    const mijdo = windowByTitle(page, "Mijdo.exe");
    await mijdo.getByRole("button", { name: "Minimize Mijdo.exe" }).click();
    await expect(mijdo).toHaveCount(0);
    await statusItem(page, "Mijdo.exe").click();
    await expect(mijdo).toBeVisible();

    await mijdo.getByRole("button", { name: "Close Mijdo.exe" }).click();
    await expect(mijdo).toHaveCount(0);
    await expect(icon).toHaveAttribute("data-running", "false");
  });
});
