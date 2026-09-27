export type HistoryDirection = -1 | 1;

export interface HistoryRecall {
  index: number;
  input: string;
}

/*
  historyIndex counts from the end of the history, so the live draft sits at
  the index just past the last entry. Stepping back restores older commands,
  stepping forward past the newest entry restores the empty draft.
*/
export function recallHistoryEntry(
  history: string[],
  historyIndex: number | null,
  direction: HistoryDirection,
): HistoryRecall | null {
  if (history.length === 0) return null;

  const from = historyIndex ?? history.length;
  const to = Math.min(history.length, Math.max(0, from + direction));

  return {
    index: to,
    input: to >= history.length ? "" : history[to],
  };
}
