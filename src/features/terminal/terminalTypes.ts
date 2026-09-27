export type TerminalLineKind = "banner" | "echo" | "heading" | "output" | "error";

export type TerminalLine = {
  kind: TerminalLineKind;
  text: string;
};

/*
  A command returns plain text, and may mark the lines that carry a heading or
  an error so the session can present them differently without every command
  having to describe presentation itself.
*/
export type TerminalOutputLine = string | TerminalLine;

export type TerminalCommandOutcome = {
  lines: TerminalOutputLine[];
  clear?: boolean;
  close?: boolean;
};

export type TerminalCommand = {
  name: string;
  description: string;
  aliases?: string[];
  /*
    Commands are pure: they return text and intent only.
    The session performs the window side effects.
  */
  execute: () => TerminalCommandOutcome;
};
