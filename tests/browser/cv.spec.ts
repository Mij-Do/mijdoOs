import { expect, test, type Page } from "@playwright/test";
import { bootAndSkip, desktopIcon, menuItem, openMenuButton, windowByTitle } from "./helpers";

/*
  The CV is a static file, so a phone-sized viewport follows the link in the
  current tab: a mobile browser will not open a PDF in a new tab, and on a real
  phone the tap used to do nothing at all. Above the compact breakpoint the
  anchor keeps the new tab it has always had, so the desktop is unchanged.

  Every entry point goes through the same handler, so each one is asserted on
  its own rather than trusting that one covering the others.
*/

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const CV_PATH = "/cv.pdf";

async function expectCurrentTabCvOpen(page: Page, activate: () => Promise<void>) {
  const opened = page.waitForRequest((request) => request.url().endsWith(CV_PATH));

  await activate();

  const request = await opened;
  expect(request.frame()).toBe(page.mainFrame());
}

async function expectNewTabCvOpen(page: Page, activate: () => Promise<void>) {
  const opened = page.waitForEvent("popup");
  const urlBefore = page.url();

  await activate();

  const popup = await opened;
  expect(popup).not.toBe(page);
  expect(page.url()).toBe(urlBefore);
}

test("serves the CV from the production build", async ({ page }) => {
  const response = await page.request.get(CV_PATH);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
});

test.describe("the CV on a phone-sized viewport", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("opens the status bar entry in the current tab", async ({ page }) => {
    await bootAndSkip(page);

    await expectCurrentTabCvOpen(page, () => page.locator(".mijdo-status-cv").click());
  });

  test("opens the File menu entry in the current tab", async ({ page }) => {
    await bootAndSkip(page);

    await expectCurrentTabCvOpen(page, async () => {
      await openMenuButton(page, "File").click();
      await menuItem(page, "Open CV").click();
    });
  });

  test("opens the Contact window entry in the current tab", async ({ page }) => {
    await bootAndSkip(page);
    await desktopIcon(page, "Contact.exe").click();

    const cv = windowByTitle(page, "Contact.exe").locator(`a[href="${CV_PATH}"]`);
    await expect(cv).toHaveCount(1);

    await expectCurrentTabCvOpen(page, () => cv.click());
  });
});

test.describe("the CV on a desktop viewport", () => {
  test("keeps the status bar entry in a new tab", async ({ page }) => {
    await bootAndSkip(page);

    await expectNewTabCvOpen(page, () => page.locator(".mijdo-status-cv").click());
  });

  test("keeps the File menu entry in a new tab", async ({ page }) => {
    await bootAndSkip(page);

    await expectNewTabCvOpen(page, async () => {
      await openMenuButton(page, "File").click();
      await menuItem(page, "Open CV").click();
    });
  });
});
