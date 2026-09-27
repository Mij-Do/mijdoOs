import { expect, test } from "@playwright/test";
import {
  bootAndSkip,
  bootScreen,
  desktopIcon,
  menuItem,
  menuPanel,
  openMenuButton,
  windowByTitle,
} from "./helpers";

/*
  Keyboard use.

  The system documents five shortcuts in Shortcuts.exe, and this file checks
  that each one does what the documentation claims. There is deliberately no
  global show-desktop or window-switching shortcut, so none is asserted here;
  the absence is recorded as an opportunity rather than tested.
*/

async function openShortcutsWindow(page: import("@playwright/test").Page) {
  await openMenuButton(page, "Help").click();
  await menuItem(page, "Keyboard Shortcuts").click();
  await expect(windowByTitle(page, "Shortcuts.exe")).toBeVisible();
}

test.describe("reaching everything with Tab", () => {
  test("moves forward through the desktop icons in registry order", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Mijdo.exe").focus();
    await page.keyboard.press("Tab");

    await expect(desktopIcon(page, "Profile.exe")).toBeFocused();
  });

  test("moves back through the desktop icons with Shift+Tab", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Profile.exe").focus();
    await page.keyboard.press("Shift+Tab");

    await expect(desktopIcon(page, "Mijdo.exe")).toBeFocused();
  });

  test("reaches the last desktop icon in the column", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Contact.exe").focus();
    await page.keyboard.press("Tab");

    await expect(desktopIcon(page, "Terminal.exe")).toBeFocused();
  });

  test("opens the focused icon with Enter", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Education.exe").focus();
    await page.keyboard.press("Enter");

    await expect(windowByTitle(page, "Education.exe")).toBeVisible();
  });

  test("walks the whole icon column with Tab alone", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Mijdo.exe").focus();

    /* One press per remaining icon, landing on the last one in registry order. */
    for (let step = 0; step < 7; step += 1) {
      await page.keyboard.press("Tab");
    }

    await expect(desktopIcon(page, "Terminal.exe")).toBeFocused();
  });
});

test.describe("visible focus", () => {
  test("draws a focus ring on a focused icon", async ({ page }) => {
    await bootAndSkip(page);

    const icon = desktopIcon(page, "Mijdo.exe");
    await icon.focus();

    const outline = await icon.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        width: Number.parseFloat(style.outlineWidth),
        style: style.outlineStyle,
      };
    });

    expect(outline.style).not.toBe("none");
    expect(outline.width).toBeGreaterThan(0);
  });

  test("draws a focus ring on a focused command bar item", async ({ page }) => {
    await bootAndSkip(page);

    const trigger = openMenuButton(page, "SYSTEM");
    await trigger.focus();

    const outline = await trigger.evaluate((node) => Number.parseFloat(getComputedStyle(node).outlineWidth));

    expect(outline).toBeGreaterThan(0);
  });
});

test.describe("the boot screen", () => {
  test("is not dismissed by Tab", async ({ page }) => {
    await page.goto("/");
    await expect(bootScreen(page)).toBeVisible();

    await page.keyboard.press("Tab");

    await expect(bootScreen(page)).toBeVisible();
  });

  test("is dismissed by a key press", async ({ page }) => {
    await page.goto("/");
    await expect(bootScreen(page)).toBeVisible();

    await page.keyboard.press("Enter");

    await expect(bootScreen(page)).toHaveCount(0);
  });
});

test.describe("the documented shortcuts", () => {
  test("lists the five shortcuts the system supports", async ({ page }) => {
    await bootAndSkip(page);
    await openShortcutsWindow(page);

    await expect(page.locator(".mijdo-shortcut")).toHaveCount(5);
  });

  test("states what Escape does", async ({ page }) => {
    await bootAndSkip(page);
    await openShortcutsWindow(page);

    const escape = page.locator(".mijdo-shortcut", { hasText: "Escape" });

    await expect(escape.locator(".mijdo-shortcut-key")).toHaveText("Escape");
    await expect(escape).toContainText(/menu|message box/i);
  });

  test("keeps its promise about Escape closing an open menu", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();
    await expect(menuPanel(page)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(menuPanel(page)).toHaveCount(0);
  });

  test("keeps its promise about Escape closing a message box", async ({ page }) => {
    await bootAndSkip(page);
    await openShortcutsWindow(page);

    await page.keyboard.press("Escape");

    await expect(windowByTitle(page, "Shortcuts.exe")).toHaveCount(0);
  });

  test("keeps its promise about Enter activating a selected item", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "Run").click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(windowByTitle(page, "Terminal.exe")).toBeVisible();
  });

  test("keeps its promise about the arrow keys moving between menus", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await page.keyboard.press("ArrowRight");
    await expect(menuPanel(page)).toHaveAttribute("aria-label", "File");

    await page.keyboard.press("ArrowLeft");
    await expect(menuPanel(page)).toHaveAttribute("aria-label", "SYSTEM");
  });
});
