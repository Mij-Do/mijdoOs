import { describe, expect, it } from "vitest";
import { parseCommandLine } from "./terminalParser";

/*
  These tests describe the contract the parser has today, not the contract it
  might ideally have. In particular: there is no argument support, `input` is
  the normalized line rather than the raw one, and the command name is
  lowercased while the recorded input keeps its original case.
*/

describe("parseCommandLine", () => {
  describe("empty input", () => {
    it("returns null for an empty string", () => {
      expect(parseCommandLine("")).toBeNull();
    });

    it("returns null for spaces only", () => {
      expect(parseCommandLine("   ")).toBeNull();
    });

    it("returns null for tabs and newlines only", () => {
      expect(parseCommandLine("\t\n  \r\n")).toBeNull();
    });
  });

  describe("a command without arguments", () => {
    it("returns the lowercased name and the same line", () => {
      expect(parseCommandLine("help")).toEqual({ name: "help", input: "help" });
    });

    it("preserves the parsed name exactly when it is already lowercase", () => {
      expect(parseCommandLine("projects")?.name).toBe("projects");
    });
  });

  describe("case handling", () => {
    it("lowercases an uppercase command name", () => {
      expect(parseCommandLine("HELP")).toEqual({ name: "help", input: "HELP" });
    });

    it("lowercases a mixed-case command name", () => {
      expect(parseCommandLine("HeLp")).toEqual({ name: "help", input: "HeLp" });
    });

    it("keeps the original case in the recorded input", () => {
      expect(parseCommandLine("VERSION")?.input).toBe("VERSION");
    });
  });

  describe("whitespace", () => {
    it("trims leading and trailing whitespace", () => {
      expect(parseCommandLine("   help   ")).toEqual({
        name: "help",
        input: "help",
      });
    });

    it("collapses multiple spaces between tokens into one", () => {
      expect(parseCommandLine("help   projects")?.input).toBe("help projects");
    });

    it("collapses mixed whitespace runs into single spaces", () => {
      expect(parseCommandLine("help\t\t  projects")?.input).toBe("help projects");
    });

    it("normalizes a newline between tokens into a space", () => {
      expect(parseCommandLine("help\nprojects")?.input).toBe("help projects");
    });
  });

  describe("a command with arguments", () => {
    it("uses only the first token as the command name", () => {
      expect(parseCommandLine("dir /w")).toEqual({ name: "dir", input: "dir /w" });
    });

    it("ignores arguments for the name but keeps them in the input", () => {
      const parsed = parseCommandLine("projects --all extra");

      expect(parsed?.name).toBe("projects");
      expect(parsed?.input).toBe("projects --all extra");
    });

    it("does not strip quotes, because quoted arguments are not supported", () => {
      const parsed = parseCommandLine('help "two words"');

      expect(parsed?.name).toBe("help");
      expect(parsed?.input).toBe('help "two words"');
    });
  });

  describe("the recorded input", () => {
    it("is the normalized line, not the raw argument", () => {
      expect(parseCommandLine("  DIR   /W  ")?.input).toBe("DIR /W");
    });
  });
});
