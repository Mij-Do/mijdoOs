import { defineConfig } from "vitest/config";

/*
  Unit tests cover the parts of MijdoOS that are pure: the window manager
  reducer, the terminal parser, the terminal history, and the data the terminal
  reads. Nothing here needs a DOM, so the node environment is used and no
  browser, jsdom or testing-library dependency is required.

  Everything that does need a real browser lives in the Playwright suite
  (`pnpm test:browser`), which drives the production build.
*/
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
