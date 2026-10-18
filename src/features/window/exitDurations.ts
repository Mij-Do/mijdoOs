/*
  Durations of the two exit keyframes declared in index.css. The window frame
  waits this long before handing the removal back to the window manager, so the
  manager never has to know that windows animate out. Whichever of the CSS
  keyframe and this timeout ends first wins, so the two have to agree.

  Lives in its own module, beside a matching pointer in index.css, because CSS
  cannot import it and a component file may not export plain constants without
  breaking fast refresh. A test pins these values.
*/
export const EXIT_DURATIONS = {
  close: 110,
  minimize: 140,
} as const;

export type ExitKind = keyof typeof EXIT_DURATIONS;
