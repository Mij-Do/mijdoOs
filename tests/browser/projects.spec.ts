import { expect, test, type Page } from "@playwright/test";
import { bootAndSkip, desktopIcon, windowByTitle } from "./helpers";

/*
  The Projects window renders one link row per project from the records, so
  this is where the matrix is either right or quietly wrong. The URLs are
  written out rather than read from the data: a link that is edited, dropped
  or hidden has to fail here instead of becoming the new expectation.
*/

const RETIRED_DEMO = "https://real-state-full-stack-project.vercel.app/";

const EXPECTED_PROJECT_LINKS = [
  {
    title: "Full-Stack Todo Application",
    links: [
      { label: "GITHUB", href: "https://github.com/Mij-Do/Full-Stack-To-Do-app-V6" },
      { label: "LIVE DEMO", href: "https://to-do-app-v6-eta.vercel.app/" },
    ],
  },
  {
    title: "Real Estate Listings Platform",
    links: [{ label: "GITHUB", href: "https://github.com/Mij-Do/real-state-full-stack-project" }],
  },
  {
    title: "MijdoOS",
    links: [
      { label: "GITHUB", href: "https://github.com/Mij-Do/mijdoOs" },
      { label: "LIVE DEMO", href: "https://mijdo-os.vercel.app/" },
    ],
  },
] as const;

function projectSection(page: Page, title: string) {
  return windowByTitle(page, "Projects.exe")
    .locator(".mijdo-detail-section")
    .filter({ has: page.getByRole("heading", { name: title, level: 2 }) });
}

test("presents exactly the verified links for every project", async ({ page }) => {
  await bootAndSkip(page);
  await desktopIcon(page, "Projects.exe").click();

  for (const project of EXPECTED_PROJECT_LINKS) {
    const anchors = projectSection(page, project.title).locator("a");

    await expect(anchors).toHaveCount(project.links.length);

    for (const [index, link] of project.links.entries()) {
      const anchor = anchors.nth(index);

      await expect(anchor).toHaveAttribute("href", link.href);
      await expect(anchor).toHaveText(`[${link.label}]`);
      await expect(anchor).toBeVisible();
    }
  }
});

test("leaves the retired Real Estate live demo out of the window", async ({ page }) => {
  await bootAndSkip(page);
  await desktopIcon(page, "Projects.exe").click();

  await expect(
    windowByTitle(page, "Projects.exe").locator(`a[href="${RETIRED_DEMO}"]`),
  ).toHaveCount(0);
});

/*
  The summary already ends with the Meem Langs bio sentence. Both the Profile
  window and the home window used to render that sentence a second time as a
  separate paragraph, so a visitor read it twice in a row. Counted in the
  rendered text so a re-addition fails here instead of shipping.
*/
const CLOSING_SENTENCE =
  "an AI-powered language learning platform, combining software development with product planning, technical coordination, and community leadership.";

async function countInWindow(page: Page, title: string): Promise<number> {
  const text = (await windowByTitle(page, title).textContent()) ?? "";
  return text.split(CLOSING_SENTENCE).length - 1;
}

test("shows the closing bio sentence once in the profile window", async ({ page }) => {
  await bootAndSkip(page);
  await desktopIcon(page, "Profile.exe").click();

  await expect(windowByTitle(page, "Profile.exe")).toBeVisible();
  expect(await countInWindow(page, "Profile.exe")).toBe(1);
});

test("shows the closing bio sentence once in the home window", async ({ page }) => {
  await bootAndSkip(page);
  await desktopIcon(page, "Mijdo.exe").click();

  await expect(windowByTitle(page, "Mijdo.exe")).toBeVisible();
  expect(await countInWindow(page, "Mijdo.exe")).toBe(1);
});
