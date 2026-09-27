import { expect, test } from "@playwright/test";
import { DESKTOP_APP_TITLES, bootAndSkip, desktopIcon, menuItem, windowByTitle } from "./helpers";


/*
  The desktop surface: the icon grid, the icon artwork, and the right-click
  context menu. A desktop icon opens its application on a single click, which
  is what the icon's click handler does.
*/

const REGISTRY_ORDER = [
  "Mijdo.exe",
  "Profile.exe",
  "Education.exe",
  "Skills.exe",
  "Experience.exe",
  "Projects.exe",
  "Contact.exe",
  "Terminal.exe",
];

const ARRANGED_ORDER = [...REGISTRY_ORDER].sort().map((title) => title.toUpperCase());

test.describe("desktop icons", () => {
  test("shows one icon per desktop application", async ({ page }) => {
    await bootAndSkip(page);

    await expect(page.locator(".mijdo-desktop-icon")).toHaveCount(REGISTRY_ORDER.length);
  });

  test("names every icon after the application it opens", async ({ page }) => {
    await bootAndSkip(page);

    for (const title of DESKTOP_APP_TITLES) {
      await expect(desktopIcon(page, title)).toBeVisible();
    }
  });

  test("splits the executable suffix onto its own line in the label", async ({ page }) => {
    await bootAndSkip(page);

    const label = page.locator(".mijdo-desktop-icon").first();

    await expect(label.locator(".mijdo-desktop-icon-name")).toHaveText("Mijdo");
    await expect(label.locator(".mijdo-desktop-icon-extension")).toHaveText(".exe");
  });

  test("draws each icon as an inline bitmap", async ({ page }) => {
    await bootAndSkip(page);

    await expect(page.locator(".mijdo-desktop-icon-art").first()).toBeVisible();
  });

  test("draws the bitmap from a small number of merged rectangles", async ({ page }) => {
    await bootAndSkip(page);

    const rectangles = await page
      .locator(".mijdo-desktop-icon-art")
      .first()
      .locator("rect")
      .count();

    expect(rectangles).toBeGreaterThan(0);
    expect(rectangles).toBeLessThan(256);
  });

  test("opens an application on a single click", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Education.exe").click();

    await expect(windowByTitle(page, "Education.exe")).toBeVisible();
  });

  test("keeps icon artwork out of the accessibility tree", async ({ page }) => {
    await bootAndSkip(page);

    await expect(page.locator(".mijdo-desktop-icon-art").first()).toHaveAttribute("aria-hidden", "true");
  });

  test("keeps the icons in registry order by default", async ({ page }) => {
    await bootAndSkip(page);

    const labels = await page.locator(".mijdo-desktop-icon-label").allTextContents();

    expect(labels).toEqual(REGISTRY_ORDER);
  });
});

test.describe("arranging icons", () => {
  test("sorts the icons alphabetically when arranged", async ({ page }) => {
    await bootAndSkip(page);

    await page.getByRole("button", { name: "View" }).click();
    await page.getByRole("menuitemcheckbox", { name: "Arrange Icons" }).click();

    const labels = await page.locator(".mijdo-desktop-icon-label").allTextContents();

    expect(labels).toEqual(ARRANGED_ORDER);
  });

  test("upper-cases the labels once arranged", async ({ page }) => {
    await bootAndSkip(page);

    await page.getByRole("button", { name: "View" }).click();
    await page.getByRole("menuitemcheckbox", { name: "Arrange Icons" }).click();

    const labels = await page.locator(".mijdo-desktop-icon-label").allTextContents();

    for (const label of labels) {
      expect(label).toBe(label.toUpperCase());
    }
  });

  test("exposes the arrange toggle as a checkable menu item", async ({ page }) => {
    await bootAndSkip(page);

    await page.getByRole("button", { name: "View" }).click();
    const toggle = page.getByRole("menuitemcheckbox", { name: "Arrange Icons" });

    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();
    await page.getByRole("button", { name: "View" }).click();

    await expect(page.getByRole("menuitemcheckbox", { name: "Arrange Icons" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  test("keeps every icon reachable after arranging", async ({ page }) => {
    await bootAndSkip(page);

    await page.getByRole("button", { name: "View" }).click();
    await page.getByRole("menuitemcheckbox", { name: "Arrange Icons" }).click();

    await expect(page.locator(".mijdo-desktop-icon")).toHaveCount(REGISTRY_ORDER.length);
  });
});

test.describe("the desktop context menu", () => {
  test("opens on a right click on empty desktop", async ({ page }) => {
    await bootAndSkip(page);

    await page.locator(".mijdo-desktop").click({ button: "right", position: { x: 700, y: 400 } });

    await expect(page.locator("#desktop-context-menu")).toBeVisible();
  });

  test("offers the desktop actions", async ({ page }) => {
    await bootAndSkip(page);

    await page.locator(".mijdo-desktop").click({ button: "right", position: { x: 700, y: 400 } });

    await expect(menuItem(page, "Open Mijdo.exe")).toBeVisible();
    await expect(menuItem(page, "System Info")).toBeVisible();
    await expect(menuItem(page, "Close Menu")).toBeVisible();
  });

  test("opens an application from the context menu", async ({ page }) => {
    await bootAndSkip(page);

    await page.locator(".mijdo-desktop").click({ button: "right", position: { x: 700, y: 400 } });
    await menuItem(page, "Open Mijdo.exe").click();

    await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();
  });

  test("closes on Escape", async ({ page }) => {
    await bootAndSkip(page);

    await page.locator(".mijdo-desktop").click({ button: "right", position: { x: 700, y: 400 } });
    await expect(page.locator("#desktop-context-menu")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.locator("#desktop-context-menu")).toHaveCount(0);
  });
});
