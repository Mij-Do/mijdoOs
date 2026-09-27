import { expect, test } from "@playwright/test";
import { TOP_BAR_MENUS, bootAndSkip, menuItem, menuPanel, openMenuButton, windowByTitle } from "./helpers";

/*
  The command bar and the menu panel it opens.

  The panel renders into a portal on document.body, focuses its first item as
  soon as it opens, and hands left/right to the menu bar while keeping up/down
  for its own items.
*/

test.describe("the command bar", () => {
  test("shows every menu", async ({ page }) => {
    await bootAndSkip(page);

    for (const label of TOP_BAR_MENUS) {
      await expect(openMenuButton(page, label)).toBeVisible();
    }
  });

  test("starts with every menu closed", async ({ page }) => {
    await bootAndSkip(page);

    await expect(menuPanel(page)).toHaveCount(0);
  });

  test("opens a menu when its trigger is clicked", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();

    await expect(menuPanel(page)).toBeVisible();
    await expect(menuPanel(page)).toHaveAttribute("aria-label", "SYSTEM");
  });

  test("marks the open trigger as expanded", async ({ page }) => {
    await bootAndSkip(page);
    const trigger = openMenuButton(page, "Help");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("closes a menu when its own trigger is clicked again", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await openMenuButton(page, "SYSTEM").click();

    await expect(menuPanel(page)).toHaveCount(0);
  });

  test("switches directly from one open menu to another", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();
    await openMenuButton(page, "Run").click();

    await expect(menuPanel(page)).toHaveCount(1);
    await expect(menuPanel(page)).toHaveAttribute("aria-label", "Run");
  });

  test("renders the panel outside the command bar, through a portal", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();

    await expect(menuPanel(page)).toHaveCount(1);
    expect(await page.evaluate(() => document.querySelector(".mijdo-menu")?.parentElement?.tagName)).toBe("BODY");
  });
});

test.describe("menu contents", () => {
  test("SYSTEM lists the system applications", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await expect(menuItem(page, "About MijdoOS")).toBeVisible();
    await expect(menuItem(page, "System Info")).toBeVisible();
    await expect(menuItem(page, "Close Menu")).toBeVisible();
  });

  test("File lists the main application, the CV and the close action", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "File").click();

    await expect(menuItem(page, "Open Mijdo.exe")).toBeVisible();
    await expect(menuItem(page, "Open CV")).toBeVisible();
    await expect(menuItem(page, "Close Active Window")).toBeVisible();
  });

  test("View lists the desktop actions", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "View").click();

    await expect(menuItem(page, "Show Desktop")).toBeVisible();
    await expect(page.getByRole("menuitemcheckbox", { name: "Arrange Icons" })).toBeVisible();
  });

  test("does not offer the retired Special menu", async ({ page }) => {
    await bootAndSkip(page);

    /* Run already covers the applications Special used to duplicate. */
    await expect(page.getByRole("button", { name: "Special", exact: true })).toHaveCount(0);
    await expect(page.locator(".mijdo-top-bar .mijdo-command-item")).toHaveCount(TOP_BAR_MENUS.length);
  });

  test("Run lists the applications that can be launched", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "Run").click();

    for (const label of ["Mijdo.exe", "Terminal.exe", "Projects", "Skills", "Experience", "Contact"]) {
      await expect(menuItem(page, label)).toBeVisible();
    }
  });

  test("Help lists the help applications", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "Help").click();

    await expect(menuItem(page, "MijdoOS Help")).toBeVisible();
    await expect(menuItem(page, "Keyboard Shortcuts")).toBeVisible();
    await expect(menuItem(page, "About")).toBeVisible();
  });

  test("marks separators for assistive technology", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await expect(menuPanel(page).locator('[role="separator"]')).not.toHaveCount(0);
  });
});

test.describe("closing a menu", () => {
  test("closes on Escape", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await page.keyboard.press("Escape");

    await expect(menuPanel(page)).toHaveCount(0);
  });

  test("returns focus to the trigger after Escape", async ({ page }) => {
    await bootAndSkip(page);
    const trigger = openMenuButton(page, "SYSTEM");

    await trigger.click();
    await page.keyboard.press("Escape");

    await expect(trigger).toBeFocused();
  });

  test("closes when clicking outside it", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();
    await expect(menuPanel(page)).toBeVisible();

    await page.locator(".mijdo-desktop").click({ position: { x: 700, y: 400 } });

    await expect(menuPanel(page)).toHaveCount(0);
  });

  test("closes when Tab is pressed", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await page.keyboard.press("Tab");

    await expect(menuPanel(page)).toHaveCount(0);
  });

  test("closes after an item is chosen", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await menuItem(page, "System Info").click();

    await expect(menuPanel(page)).toHaveCount(0);
  });
});

test.describe("menu keyboard navigation", () => {
  test("focuses the first item as soon as the menu opens", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();

    await expect(menuItem(page, "About MijdoOS")).toBeFocused();
  });

  test("does not paint a selection when the menu was opened with the mouse", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "SYSTEM").click();

    await expect(menuPanel(page).locator("[data-selected='true']")).toHaveCount(0);
  });

  test("moves down through the items with ArrowDown", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await page.keyboard.press("ArrowDown");

    await expect(menuItem(page, "System Info")).toBeFocused();
  });

  test("paints the selection once the keyboard is used", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await page.keyboard.press("ArrowDown");

    await expect(menuPanel(page).locator("[data-selected='true']")).toHaveCount(1);
  });

  test("moves up through the items with ArrowUp", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");

    await expect(menuItem(page, "About MijdoOS")).toBeFocused();
  });

  test("activates the selected item with Enter", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(windowByTitle(page, "System Info.exe")).toBeVisible();
  });

  test("moves to the next menu with ArrowRight", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await page.keyboard.press("ArrowRight");

    await expect(menuPanel(page)).toHaveAttribute("aria-label", "File");
  });

  test("walks along the whole menu bar", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    for (const label of ["File", "View", "Run", "Help", "SYSTEM"]) {
      await page.keyboard.press("ArrowRight");
      await expect(menuPanel(page)).toHaveAttribute("aria-label", label);
    }
  });

  test("moves back to the previous menu with ArrowLeft", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "Help").click();

    await page.keyboard.press("ArrowLeft");

    await expect(menuPanel(page)).toHaveAttribute("aria-label", "Run");
  });

  test("lets up and down belong to the panel rather than the menu bar", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "Run").click();
    const before = await menuPanel(page).getAttribute("aria-label");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    await expect(menuPanel(page)).toHaveAttribute("aria-label", before ?? "");
  });
});

test.describe("menu item states", () => {
  test("disables Close Active Window when no window is active", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "File").click();

    await expect(menuItem(page, "Close Active Window")).toBeDisabled();
  });

  test("enables Close Active Window once a window is open", async ({ page }) => {
    await bootAndSkip(page);
    await page.getByRole("button", { name: /^Open Mijdo\.exe/ }).click();
    await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();

    await openMenuButton(page, "File").click();

    await expect(menuItem(page, "Close Active Window")).toBeEnabled();
  });

  test("renders the CV entry as a real link to the resume", async ({ page }) => {
    await bootAndSkip(page);

    await openMenuButton(page, "File").click();
    const cv = menuItem(page, "Open CV");

    await expect(cv).toHaveAttribute("href", /cv\.pdf$/);
    await expect(cv).toHaveAttribute("target", "_blank");
    await expect(cv).toHaveAttribute("rel", /noopener/);
  });
});
