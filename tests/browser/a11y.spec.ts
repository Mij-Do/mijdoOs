import { expect, test } from "@playwright/test";
import {
  bootAndSkip,
  bootCursorAnimation,
  desktopIcon,
  openMenuButton,
  recordBootCursorAnimation,
  waitForDesktop,
  windowByTitle,
} from "./helpers";

/*
  Accessibility, restricted to what the project already claims.

  These checks encode decisions the code has already made, so that a later
  change cannot quietly undo them: the document language, the window and control
  names, the polite terminal log, hidden decorative artwork, and the
  reduced-motion contract.
*/

/* Lists every visible interactive control that has no accessible name. */
async function unnamedControls(page: import("@playwright/test").Page): Promise<string[]> {
  return page.evaluate(() => {
    const named = (node: Element) => {
      const aria = node.getAttribute("aria-label");
      if (aria && aria.trim().length > 0) return true;

      const labelledBy = node.getAttribute("aria-labelledby");
      if (labelledBy) {
        return labelledBy
          .split(/\s+/)
          .some((id) => (document.getElementById(id)?.textContent ?? "").trim().length > 0);
      }

      if ((node.textContent ?? "").trim().length > 0) return true;

      const title = node.getAttribute("title");
      return Boolean(title && title.trim().length > 0);
    };

    const controls = Array.from(
      document.querySelectorAll<HTMLElement>("button, a[href], input, [role='menuitem']"),
    );

    return controls
      .filter((node) => node.offsetParent !== null || node.getClientRects().length > 0)
      .filter((node) => !named(node))
      .map((node) => `${node.tagName.toLowerCase()}.${node.className || "(no class)"}`);
  });
}

test.describe("document semantics", () => {
  test("declares the document language", async ({ page }) => {
    await bootAndSkip(page);

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("gives the page a title and a description", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/MijdoOS/);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");

    expect(description).toBeTruthy();
    expect((description ?? "").length).toBeGreaterThan(50);
  });

  test("hides the decorative scanline overlay", async ({ page }) => {
    await bootAndSkip(page);

    await expect(page.locator(".mijdo-crt")).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("window semantics", () => {
  test("names an application window for assistive technology", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    await expect(windowByTitle(page, "Mijdo.exe")).toHaveAttribute("aria-label", "Mijdo.exe window");
  });

  test("exposes a message box as a dialog", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();
    await page.getByRole("menuitem", { name: "System Info" }).click();

    await expect(windowByTitle(page, "System Info.exe")).toHaveAttribute("role", "dialog");
  });

  test("leaves a message box non-modal so the desktop stays usable", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();
    await page.getByRole("menuitem", { name: "System Info" }).click();

    await expect(windowByTitle(page, "System Info.exe")).not.toHaveAttribute("aria-modal", "true");
  });

  test("names every window control", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();

    const frame = windowByTitle(page, "Mijdo.exe");

    await expect(frame.getByRole("button", { name: "Minimize Mijdo.exe" })).toBeVisible();
    await expect(frame.getByRole("button", { name: "Maximize Mijdo.exe" })).toBeVisible();
    await expect(frame.getByRole("button", { name: "Close Mijdo.exe" })).toBeVisible();
  });

  test("gives the menu panel a menu role and a name", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "SYSTEM").click();

    await expect(page.locator(".mijdo-menu")).toHaveAttribute("role", "menu");
  });
});

test.describe("the terminal as a log", () => {
  test("announces new output politely", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();
    const log = page.locator(".mijdo-terminal [role='log']");

    await expect(log).toHaveAttribute("aria-live", "polite");
    await expect(log).toHaveAttribute("aria-label", "Terminal output");
  });

  test("keeps the prompt outside the live region", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();

    const input = page.locator("#mijdo-terminal-input");

    /* A text field inside a live region would announce every character typed. */
    await expect(input).toHaveCount(1);
    expect(await input.evaluate((node) => Boolean(node.closest("[aria-live='polite']")))).toBe(false);
  });

  test("names the command field", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Terminal.exe").click();

    await expect(page.locator("#mijdo-terminal-input")).toHaveAttribute("aria-label", "Terminal command");
  });
});

test.describe("accessible names", () => {
  test("names every control on a booted desktop", async ({ page }) => {
    await bootAndSkip(page);

    expect(await unnamedControls(page)).toEqual([]);
  });

  test("names every control with windows open", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Mijdo.exe").click();
    await desktopIcon(page, "Terminal.exe").click();

    expect(await unnamedControls(page)).toEqual([]);
  });

  test("names every control while a menu is open", async ({ page }) => {
    await bootAndSkip(page);
    await openMenuButton(page, "File").click();

    expect(await unnamedControls(page)).toEqual([]);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("stops the scanline animation instead of shortening it", async ({ page }) => {
    await page.goto("/");

    const animation = await page
      .locator(".mijdo-crt")
      .evaluate((node) => getComputedStyle(node, "::after").animationName);

    expect(animation).toBe("none");
  });

  test("stops the boot cursor blinking", async ({ page }) => {
    await recordBootCursorAnimation(page);
    await page.goto("/");
    await waitForDesktop(page);

    expect(await bootCursorAnimation(page)).toBe("none");
  });

  test("still reaches an interactive desktop", async ({ page }) => {
    await bootAndSkip(page);

    await desktopIcon(page, "Mijdo.exe").click();
    await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();
  });
});
