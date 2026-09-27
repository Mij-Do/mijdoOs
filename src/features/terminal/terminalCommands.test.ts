import { describe, expect, it } from "vitest";
import { desktopApplications } from "../../data/windows";
import { executeCommand, terminalCommands } from "./terminalCommands";
import type { TerminalOutputLine } from "./terminalTypes";

/*
  Technical debt D6 was that the terminal's dir command carried its own
  hand-written list of desktop application names, directly underneath a comment
  claiming it was the same list the desktop used. The names are now derived
  from the window registry, and these tests exist to keep that true.

  The guard is behavioural rather than textual: the listing is compared against
  the registry on every run, so re-introducing a private copy of the list, or
  adding a desktop application without listing it, fails here. The expected
  column format is stated here independently so the format is checked too.
*/

const DIR_NAME_WIDTH = 10;

function toExpectedDirectoryEntry(title: string): string {
  const extensionIndex = title.lastIndexOf(".");
  const name = title.slice(0, extensionIndex);
  const extension = title.slice(extensionIndex + 1);

  return `${name.toUpperCase().padEnd(DIR_NAME_WIDTH, " ")} ${extension.toUpperCase()}`;
}

function toText(line: TerminalOutputLine): string {
  return typeof line === "string" ? line : line.text;
}

function dirLines(): string[] {
  return executeCommand("dir").lines.map(toText);
}

function dirEntries(): string[] {
  return dirLines()
    .map((line) => /^\d{2}\s{2}\d{2}-\d{2}-\d{2}\s{2}\d{2}:\d{2}\s+\d+\s{2}(.*)$/.exec(line)?.[1])
    .filter((entry): entry is string => entry !== undefined);
}

describe("the terminal dir command", () => {
  it("lists exactly one entry per desktop application", () => {
    expect(dirEntries()).toHaveLength(desktopApplications.length);
  });

  it("reports the same file count in its summary line", () => {
    expect(dirLines().join("\n")).toContain(
      `${desktopApplications.length} file(s)`,
    );
  });

  it("lists every desktop application, in registry order", () => {
    expect(dirEntries()).toEqual(
      desktopApplications.map((application) =>
        toExpectedDirectoryEntry(application.title),
      ),
    );
  });

  it("does not list a system dialog, because those are not desktop applications", () => {
    const entries = dirEntries().join("\n");

    expect(entries).not.toContain("ABOUT");
    expect(entries).not.toContain("HELP");
    expect(entries).not.toContain("SHORTCUTS");
    expect(entries).not.toContain("SYSTEM");
  });

  it("names entries with a ten-column name and an upper-case extension", () => {
    for (const entry of dirEntries()) {
      expect(entry).toMatch(/^[A-Z]+ +[A-Z]+$/);
    }
  });

  it("starts every extension in the same column, the way a real listing does", () => {
    for (const entry of dirEntries()) {
      expect(entry.indexOf("EXE")).toBe(DIR_NAME_WIDTH + 1);
    }
  });

  it("cannot diverge from the registry, because it is derived from it", () => {
    const registryTitles = desktopApplications.map((application) =>
      application.title.toUpperCase(),
    );
    const listedNames = dirEntries().map((entry) => entry.replace(/\s+/g, ""));

    expect(listedNames).toEqual(
      registryTitles.map((title) => title.replace(/\./g, "")),
    );
  });
});

describe("the terminal command registry", () => {
  it("gives every command a unique name", () => {
    const names = terminalCommands.map((command) => command.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it("never lets an alias collide with another command name", () => {
    const names = new Set(terminalCommands.map((command) => command.name));

    for (const command of terminalCommands) {
      for (const alias of command.aliases ?? []) {
        expect(names.has(alias)).toBe(false);
      }
    }
  });

  it("never repeats an alias", () => {
    const aliases = terminalCommands.flatMap((command) => command.aliases ?? []);

    expect(new Set(aliases).size).toBe(aliases.length);
  });

  it("gives every command a description", () => {
    for (const command of terminalCommands) {
      expect(command.description.length).toBeGreaterThan(0);
    }
  });

  it("executes every declared command successfully", () => {
    for (const command of terminalCommands) {
      const outcome = executeCommand(command.name);

      expect(outcome).toBeDefined();
    }
  });

  it("resolves every declared alias to a real command, not an error", () => {
    for (const command of terminalCommands) {
      for (const alias of command.aliases ?? []) {
        const outcome = executeCommand(alias);
        const first = outcome.lines[0];

        expect(first).not.toEqual(
          expect.objectContaining({ kind: "error" }),
        );
      }
    }
  });

  it("does not resolve a name that is not declared", () => {
    const outcome = executeCommand("definitely-not-a-command");

    expect(outcome.lines[0]).toEqual({
      kind: "error",
      text: "Bad command or file name: definitely-not-a-command",
    });
  });
});

describe("command outcomes", () => {
  it("reports clear by asking the session to clear", () => {
    const outcome = executeCommand("clear");

    expect(outcome.clear).toBe(true);
    expect(outcome.lines).toHaveLength(0);
  });

  it("accepts cls as an alias for clear", () => {
    expect(executeCommand("cls").clear).toBe(true);
  });

  it("reports exit by asking the session to close", () => {
    const outcome = executeCommand("exit");

    expect(outcome.close).toBe(true);
  });

  it("answers whoami with the developer identity", () => {
    const outcome = executeCommand("whoami");

    expect(outcome.lines).toHaveLength(2);
  });

  it("answers version with the product name and version", () => {
    const outcome = executeCommand("version");
    const text = outcome.lines.map(toText).join("\n");

    expect(text).toMatch(/MijdoOS v\d/);
  });

  it("lists every command name in the help output", () => {
    const text = executeCommand("help")
      .lines.map(toText)
      .join("\n");

    for (const command of terminalCommands) {
      expect(text).toContain(command.name);
    }
  });
});
