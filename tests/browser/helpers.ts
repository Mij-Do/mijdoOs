import { expect, type Locator, type Page } from "@playwright/test";

/*
  Shared helpers for the browser suite.

  The boot sequence runs for roughly 1.5 seconds by design, so most tests skip
  it with a key press and the boot tests themselves check the natural path.
*/

export const DESKTOP_APP_TITLES = [
  "Mijdo.exe",
  "Profile.exe",
  "Education.exe",
  "Skills.exe",
  "Experience.exe",
  "Projects.exe",
  "Contact.exe",
  "Terminal.exe",
] as const;

export const TOP_BAR_MENUS = ["SYSTEM", "File", "View", "Run", "Help"] as const;

export function bootScreen(page: Page): Locator {
  return page.locator(".mijdo-boot");
}

export function desktop(page: Page): Locator {
  return page.locator(".mijdo-desktop");
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/*
  The accessible name of a desktop icon changes once its application is
  running, so the locator matches the shared prefix rather than the full name.
  That keeps a reference to the icon usable before and after it is opened.
*/
export function desktopIcon(page: Page, title: string): Locator {
  return page.getByRole("button", {
    name: new RegExp(`^Open ${escapeForRegExp(title)}(,|$)`),
  });
}

export function openMenuButton(page: Page, label: string): Locator {
  return page.locator(".mijdo-top-bar .mijdo-command-item", { hasText: label }).first();
}

export function menuPanel(page: Page): Locator {
  return page.locator(".mijdo-menu");
}

export function menuItem(page: Page, label: string): Locator {
  return page.getByRole("menuitem", { name: label, exact: true });
}

export function windowByTitle(page: Page, title: string): Locator {
  return page.locator(".mijdo-window", {
    has: page.locator(".mijdo-window-title", { hasText: new RegExp(`^${title}$`) }),
  });
}

export function windowTitleBar(page: Page, title: string): Locator {
  return windowByTitle(page, title).locator(".mijdo-titlebar");
}

export function statusItem(page: Page, title: string): Locator {
  return page.locator(".mijdo-status-item", { hasText: title }).first();
}

export function terminalInput(page: Page): Locator {
  return page.locator("#mijdo-terminal-input");
}

export function terminalLines(page: Page): Locator {
  return page.locator(".mijdo-terminal-line");
}

/* Waits for the boot overlay to be gone and the desktop to be interactive. */
export async function waitForDesktop(page: Page) {
  await expect(bootScreen(page)).toHaveCount(0, { timeout: 15_000 });
  await expect(desktop(page)).toBeVisible();
}

/* Boots the system and dismisses the POST sequence with a key press. */
export async function bootAndSkip(page: Page) {
  await page.goto("/");

  /*
    Waiting for the boot screen to be visible would be a race: under reduced
    motion it can be gone before the first assertion runs. The key press is
    best-effort for that reason, and reaching the desktop is the only
    requirement. The boot specs assert the boot screen itself.
  */
  await bootScreen(page)
    .waitFor({ state: "attached", timeout: 2_000 })
    .catch(() => undefined);

  await page.keyboard.press("Enter");
  await waitForDesktop(page);
}

/*
  Records the text of the boot screen's live region every time it changes.

  The announcements are transient, so asserting against the live element races
  the boot: on a fast machine the region can already read "Ready". Sampling it
  from before the application boots captures the whole sequence instead.
*/
export async function recordStatusAnnouncements(page: Page) {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { statusAnnouncements: string[] }).statusAnnouncements = seen;

    const sample = () => {
      const status = document.querySelector("[role='status']");
      if (!status) return;

      const text = (status.textContent ?? "").trim();
      if (text && seen.at(-1) !== text) seen.push(text);
    };

    new MutationObserver(sample).observe(document, { childList: true, subtree: true });
  });
}

export async function statusAnnouncements(page: Page): Promise<string[]> {
  return page.evaluate(
    () => (window as unknown as { statusAnnouncements: string[] }).statusAnnouncements ?? [],
  );
}

/*
  Runs a command in the open terminal window and waits for its output to land.

  The transcript grows by more than one line for a command that prints
  anything: the echo, a separator and then the result. Commands with no output
  are asserted in their own tests rather than here.
*/
export async function runTerminalCommand(page: Page, command: string) {
  const before = await terminalLines(page).count();

  await terminalInput(page).fill(command);
  await terminalInput(page).press("Enter");

  await expect.poll(() => terminalLines(page).count(), { timeout: 5_000 }).toBeGreaterThan(before);
}

export async function terminalText(page: Page): Promise<string> {
  return (await terminalLines(page).allTextContents()).join("\n");
}

/*
  Records the computed animation of the boot cursor the moment it appears.

  Under reduced motion the boot sequence finishes almost immediately, so by the
  time a test can query the page the cursor has already been unmounted. An
  observer installed before the application boots catches the element while it
  exists instead of racing its removal.
*/
export async function recordBootCursorAnimation(page: Page) {
  await page.addInitScript(() => {
    const store = window as unknown as { bootCursorAnimation: string | null };
    store.bootCursorAnimation = null;

    const sample = () => {
      if (store.bootCursorAnimation !== null) return;

      const cursor = document.querySelector(".mijdo-boot-cursor");
      if (!cursor) return;

      store.bootCursorAnimation = getComputedStyle(cursor).animationName;
    };

    sample();

    /*
      Observed on the document rather than the root element: an init script runs
      before the root element exists, and observing it then would throw and
      leave the recording silently empty.
    */
    new MutationObserver(sample).observe(document, { childList: true, subtree: true });
  });
}

export async function bootCursorAnimation(page: Page): Promise<string | null> {
  return page.evaluate(
    () => (window as unknown as { bootCursorAnimation: string | null }).bootCursorAnimation,
  );
}

/*
  Waits until an element stops moving before measuring it.

  Windows animate on open, minimize and restore, and those keyframes use a
  transform, which changes the reported bounding box for the duration. A
  measurement taken straight after a click would compare a mid-animation box
  with a settled one, so the helper waits for two identical samples.
*/
export async function settledBox(locator: Locator, samples = 4, interval = 70) {
  let previous: string | null = null;

  for (let attempt = 0; attempt < samples; attempt += 1) {
    const box = await locator.boundingBox();
    const current = box ? `${box.x},${box.y},${box.width},${box.height}` : "none";

    if (current !== null && current === previous) return box;

    previous = current;
    await locator.page().waitForTimeout(interval);
  }

  return locator.boundingBox();
}
