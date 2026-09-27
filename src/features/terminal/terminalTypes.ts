/*
  The terminal is a simulated portfolio command line.
  It has no access to the host system: only the commands declared in
  terminalCommands.ts can ever run.
*/
export const TERMINAL_PROMPT = "C:\\MIJDO>";

export type TerminalLineKind = "banner" | "echo" | "output";

export type TerminalLine = {
  kind: TerminalLineKind;
  text: string;
};

export type TerminalCommandOutcome = {
  lines: string[];
  clear?: boolean;
  close?: boolean;
};

export type TerminalCommand = {
  name: string;
  description: string;
  /*
    Commands are pure: they return text and intent only.
    The session performs the window side effects.
  */
  execute: () => TerminalCommandOutcome;
};
