import { useCallback, useState } from "react";
import { executeCommand } from "./terminalCommands";
import {
  recallHistoryEntry,
  type HistoryDirection,
} from "./terminalHistory";
import { parseCommandLine } from "./terminalParser";
import { TERMINAL_PROMPT } from "./terminalPrompt";
import type { TerminalLine, TerminalLineKind, TerminalOutputLine } from "./terminalTypes";

const BANNER_LINES = [
  "MijdoOS Terminal",
  'Type "help" for available commands.',
  "",
];

/*
  A command marks a few of its lines; everything else is ordinary output. The
  blank line in front of a result is what separates the typed command from what
  it produced, which is the one piece of grouping the terminal needs.
*/
function toTerminalLine(line: TerminalOutputLine): TerminalLine {
  if (typeof line === "string") return { kind: "output", text: line };

  return { kind: line.kind, text: line.text };
}

function createBanner(): TerminalLine[] {
  return BANNER_LINES.map((text) => ({ kind: "banner" as TerminalLineKind, text }));
}

/*
  Terminal state belongs to the Terminal feature: the window manager only
  owns the window lifecycle, so closing the window discards the session.
*/
export function useTerminalSession(onClose: () => void) {
  const [lines, setLines] = useState<TerminalLine[]>(createBanner);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const run = useCallback(
    (rawInput: string) => {
      const echo: TerminalLine = {
        kind: "echo",
        text: `${TERMINAL_PROMPT} ${rawInput}`,
      };

      const parsed = parseCommandLine(rawInput);

      setInput("");

      if (!parsed) {
        setLines((current) => [...current, echo]);
        return;
      }

      const outcome = executeCommand(parsed.name);

      if (outcome.clear) {
        setLines([]);
      } else {
        const output: TerminalLine[] = outcome.lines.map(toTerminalLine);

        if (output.length > 0) output.unshift({ kind: "output", text: "" });

        setLines((current) => [...current, echo, ...output]);
      }

      setHistory((current) =>
        current[current.length - 1] === parsed.input ? current : [...current, parsed.input],
      );
      setHistoryIndex(null);

      if (outcome.close) onClose();
    },
    [onClose],
  );

  /*
    ArrowUp walks back through the history, ArrowDown walks forward again and
    restores the empty draft once the newest entry is passed.
  */
  const recallHistory = useCallback(
    (direction: HistoryDirection) => {
      const recall = recallHistoryEntry(history, historyIndex, direction);

      if (!recall) return;

      setHistoryIndex(recall.index);
      setInput(recall.input);
    },
    [history, historyIndex],
  );

  return { lines, input, setInput, run, recallHistory };
}
