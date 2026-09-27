import { expect, test, type Page } from "@playwright/test";
import {
  bootCursorAnimation,
  bootScreen,
  recordBootCursorAnimation,
  recordStatusAnnouncements,
  statusAnnouncements,
  waitForDesktop,
} from "./helpers";

/*
  Installed before the application boots, so nothing is missed: every distinct
  number of visible boot lines is appended to a global list.
*/
async function recordBootLineCounts(page: Page) {
  await page.addInitScript(() => {
    const seen: number[] = [];
    (window as unknown as { bootLineCounts: number[] }).bootLineCounts = seen;

    const sample = () => {
      const count = document.querySelectorAll(".mijdo-boot-line").length;
      if (seen.at(-1) !== count) seen.push(count);
    };

    /*
      Observed on the document rather than the root element: an init script runs
      before the root element exists, and observing it then would throw and
      leave the recording silently empty.
    */
    new MutationObserver(sample).observe(document, { childList: true, subtree: true });
  });
}

async function bootLineCounts(page: Page): Promise<number[]> {
  return page.evaluate(
    () => (window as unknown as { bootLineCounts: number[] }).bootLineCounts ?? [],
  );
}

/*
  The boot sequence is a staged POST output. It finishes on its own, any key
  except Tab skips it, and under reduced motion it shows everything at once and
  completes quickly. A keyboard-only visitor must never be held on it, which is
  why Tab is deliberately left alone by the skip handler.
*/

test.describe("boot", () => {
  test("shows the boot sequence on a cold load", async ({ page }) => {
    await page.goto("/");

    await expect(bootScreen(page)).toBeVisible();
    await expect(page.locator(".mijdo-boot-line")).not.toHaveCount(0);
  });

  test("starts with a single boot line and reveals the rest over time", async ({ page }) => {
    /*
      The lines are revealed on a timer, so sampling them from Playwright races
      the sequence: by the time the first assertion runs the boot may already be
      finished. An observer installed before any script evaluates records every
      intermediate state instead, which makes the staged reveal observable
      without depending on how fast the machine is.
    */
    await recordBootLineCounts(page);

    await page.goto("/");
    await waitForDesktop(page);

    const counts = await bootLineCounts(page);

    /*
      Zeros are dropped: one is sampled before the first line exists, and one
      when the boot screen unmounts. What remains is the reveal itself.
    */
    const revealed = counts.filter((count) => count > 0);
    const first = revealed[0] ?? 0;
    const last = revealed.at(-1) ?? 0;

    expect(revealed.length).toBeGreaterThan(1);
    expect(first).toBeLessThanOrEqual(2);

    /* One line at a time from there, with no gaps and no repeats. */
    for (let step = 1; step < revealed.length; step += 1) {
      expect((revealed[step] ?? 0) - (revealed[step - 1] ?? 0)).toBe(1);
    }

    expect(last).toBe(8);
  });

  test("shows the expected self-test output", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".mijdo-boot-screen")).toContainText("Memory Test: 640K OK");
    await expect(page.locator(".mijdo-boot-screen")).toContainText("Loading Mijdo.exe");
  });

  test("announces the boot sequence to assistive technology", async ({ page }) => {
    await recordStatusAnnouncements(page);
    await page.goto("/");
    await waitForDesktop(page);

    /*
      The region carries the whole sequence in one string rather than
      announcing it line by line, so what is checked is that the self-test
      output, the start and the ready announcement are all present, in order.
    */
    const announced = (await statusAnnouncements(page)).join(" ");

    expect(announced).toMatch(/starting up/i);
    expect(announced).toMatch(/Memory Test: 640K OK/);
    expect(announced).toMatch(/Ready\./);

    expect(announced.indexOf("starting up")).toBeLessThan(announced.indexOf("Ready."));
  });

  test("keeps the visual boot layer out of the accessibility tree", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".mijdo-boot-screen")).toHaveAttribute("aria-hidden", "true");
  });

  test("reaches the desktop on its own without any interaction", async ({ page }) => {
    await page.goto("/");

    await waitForDesktop(page);
  });

  test("can be skipped with a key press", async ({ page }) => {
    await page.goto("/");
    await expect(bootScreen(page)).toBeVisible();

    await page.keyboard.press("Enter");

    await waitForDesktop(page);
  });

  test("tells the visitor it can be skipped", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".mijdo-boot-skip")).toHaveText("Press any key to skip");
  });

  test("is not skipped by Tab, so keyboard users are not interrupted", async ({ page }) => {
    await page.goto("/");
    await expect(bootScreen(page)).toBeVisible();

    await page.keyboard.press("Tab");

    await expect(bootScreen(page)).toBeVisible();
  });

  test("reaches the desktop on its own even for a visitor who only presses Tab", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    await waitForDesktop(page);
  });
});

test.describe("boot with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("shows the whole sequence at once", async ({ page }) => {
    await recordBootLineCounts(page);
    await page.goto("/");
    await waitForDesktop(page);

    /*
      Under reduced motion the staged reveal is gone, so the very first paint
      already carries every line. Asserted from the recorded counts because the
      sequence can finish before a locator assertion reaches the page.
    */
    const revealed = (await bootLineCounts(page)).filter((count) => count > 0);

    expect(revealed.length).toBeGreaterThan(0);
    expect(revealed[0]).toBe(8);
    expect(revealed.every((count) => count === 8)).toBe(true);
  });

  test("reaches the desktop without trapping the visitor", async ({ page }) => {
    await page.goto("/");

    await waitForDesktop(page);
  });

  test("removes the infinite boot cursor animation", async ({ page }) => {
    await recordBootCursorAnimation(page);
    await page.goto("/");
    await waitForDesktop(page);

    expect(await bootCursorAnimation(page)).toBe("none");
  });
});
