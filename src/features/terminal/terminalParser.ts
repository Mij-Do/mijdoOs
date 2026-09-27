export type ParsedCommandLine = {
  name: string;
  input: string;
};

/*
  Parsing is intentionally minimal and pure:
  commands are case-insensitive, surrounding and repeated whitespace
  is normalized, and empty input produces no command at all.
  Arguments are not supported in this phase, so anything after the
  command name is ignored.
*/
export function parseCommandLine(input: string): ParsedCommandLine | null {
  const normalized = input.trim().replace(/\s+/g, " ");

  if (normalized.length === 0) return null;

  const name = normalized.split(" ")[0];

  if (name === undefined) return null;

  return { name: name.toLowerCase(), input: normalized };
}
