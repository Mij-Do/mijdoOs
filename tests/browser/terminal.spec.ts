import { expect, test } from "@playwright/test";
import {
  DESKTOP_APP_TITLES,
  bootAndSkip,
  desktopIcon,
  runTerminalCommand,
  terminalInput,
  terminalLines,
  terminalText,
  windowByTitle,
} from "./helpers";

/*
  The terminal window: the prompt, the command set, the scrollback history and
  the ways a session can be closed.
*/

async function openTerminal(page: import("@playwright/test").Page) {
  await bootAndSkip(page);
  await desktopIcon(page, "Terminal.exe").click();
  await expect(windowByTitle(page, "Terminal.exe")).toBeVisible();
}

test.describe("the terminal prompt", () => {
  test("opens with a prompt ready for input", async ({ page }) => {
    await openTerminal(page);

    await expect(terminalInput(page)).toBeVisible();
    await expect(terminalInput(page)).toHaveValue("");
  });

  test("focuses the input as soon as the window opens", async ({ page }) => {
    await openTerminal(page);

    await expect(terminalInput(page)).toBeFocused();
  });

  test("echoes each command into the transcript", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "whoami");

    /*
      The transcript reads top to bottom: the echo sits above the result the
      command produced, so the echoed command is looked up rather than assumed
      to be the final line.
    */
    await expect(terminalLines(page).filter({ hasText: "C:\\MIJDO> whoami" })).toHaveCount(1);
  });

  test("announces output politely rather than interrupting", async ({ page }) => {
    await openTerminal(page);

    await expect(page.locator('.mijdo-terminal [role="log"]')).toHaveAttribute("aria-live", "polite");
  });
});

test.describe("running commands", () => {
  test("identifies the user", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "whoami");

    await expect(await terminalText(page)).toContain("Ahmed Samir");
    await expect(await terminalText(page)).toMatch(/developer/i);
  });

  test("ignores the case of a command", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "WHOAMI");

    await expect(await terminalText(page)).toContain("Ahmed Samir");
    await expect(await terminalText(page)).not.toMatch(/bad command/i);
  });

  test("lists the desktop files in the DOS column layout", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "dir");

    const transcript = await terminalText(page);

    /* dir prints an upper-case name column followed by a separate extension. */
    for (const title of DESKTOP_APP_TITLES) {
      const stem = title.slice(0, title.lastIndexOf(".")).toUpperCase();
      expect(transcript).toContain(stem);
    }

    expect(transcript).toContain("EXE");
  });

  test("rejects an unknown command", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "nope");

    await expect(await terminalText(page)).toMatch(/bad command or file name/i);
  });

  test("echoes an empty line without reporting an error", async ({ page }) => {
    await openTerminal(page);
    const before = await terminalLines(page).count();

    await terminalInput(page).press("Enter");

    /* An empty line is not a command, so it is echoed and nothing else. */
    await expect(terminalLines(page)).toHaveCount(before + 1);
    await expect(await terminalText(page)).not.toMatch(/bad command/i);
  });

  test("lists the available commands from help", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "help");

    const transcript = await terminalText(page);

    for (const command of ["dir", "whoami", "help", "clear"]) {
      expect(transcript).toContain(command);
    }
  });
});

test.describe("scrollback history", () => {
  test("recalls the previous command with ArrowUp", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "dir");
    await runTerminalCommand(page, "whoami");

    await terminalInput(page).press("ArrowUp");

    await expect(terminalInput(page)).toHaveValue("whoami");
  });

  test("steps further back through the history with ArrowUp", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "dir");
    await runTerminalCommand(page, "whoami");

    await terminalInput(page).press("ArrowUp");
    await terminalInput(page).press("ArrowUp");

    await expect(terminalInput(page)).toHaveValue("dir");
  });

  test("steps forward again with ArrowDown", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "dir");
    await runTerminalCommand(page, "whoami");

    await terminalInput(page).press("ArrowUp");
    await terminalInput(page).press("ArrowUp");
    await terminalInput(page).press("ArrowDown");

    await expect(terminalInput(page)).toHaveValue("whoami");
  });

  test("runs a recalled command when Enter is pressed", async ({ page }) => {
    await openTerminal(page);

    await runTerminalCommand(page, "dir");
    await runTerminalCommand(page, "whoami");

    const before = (await terminalText(page)).split("whoami").length - 1;

    await terminalInput(page).press("ArrowUp");
    await terminalInput(page).press("Enter");

    await expect
      .poll(async () => (await terminalText(page)).split("whoami").length - 1)
      .toBeGreaterThan(before);
    await expect(terminalInput(page)).toHaveValue("");
  });
});

test.describe("closing a terminal session", () => {
  test("clears the transcript", async ({ page }) => {
    await openTerminal(page);
    await runTerminalCommand(page, "dir");
    await expect(terminalLines(page).first()).toBeVisible();

    await terminalInput(page).fill("clear");
    await terminalInput(page).press("Enter");

    await expect(terminalLines(page)).toHaveCount(0);
  });

  test("keeps the prompt after clearing", async ({ page }) => {
    await openTerminal(page);

    await terminalInput(page).fill("clear");
    await terminalInput(page).press("Enter");

    await expect(page.locator(".mijdo-terminal-prompt")).toBeVisible();
    await expect(terminalInput(page)).toBeVisible();
  });

  test("leaves an empty transcript ready for the next command", async ({ page }) => {
    await openTerminal(page);

    await terminalInput(page).fill("clear");
    await terminalInput(page).press("Enter");
    await runTerminalCommand(page, "whoami");

    await expect(await terminalText(page)).toContain("Ahmed Samir");
  });

  test("closes the window on exit", async ({ page }) => {
    await openTerminal(page);

    await terminalInput(page).fill("exit");
    await terminalInput(page).press("Enter");

    await expect(windowByTitle(page, "Terminal.exe")).toHaveCount(0);
  });

  test("returns to the desktop after closing", async ({ page }) => {
    await openTerminal(page);
    await expect(windowByTitle(page, "Terminal.exe")).toBeVisible();

    await page.getByRole("button", { name: "Close Terminal.exe" }).click();

    await expect(page.locator(".mijdo-desktop")).toBeVisible();
  });
});
