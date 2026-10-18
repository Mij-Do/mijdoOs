import { afterEach, describe, expect, it } from "vitest";
import { prefersReducedMotion } from "./motion";

type WindowStub = {
  matchMedia?: (query: string) => { matches: boolean };
};

const scope = globalThis as unknown as { window?: WindowStub };
const originalWindow = scope.window;

/*
  The stub records the query so the test also pins the exact media query the
  reduced-motion contract uses, not just the boolean it returns.
*/
function stubWindow(matches: boolean | null) {
  const queries: string[] = [];

  scope.window =
    matches === null
      ? {}
      : {
          matchMedia: (query: string) => {
            queries.push(query);
            return { matches };
          },
        };

  return queries;
}

afterEach(() => {
  if (originalWindow === undefined) delete scope.window;
  else scope.window = originalWindow;
});

describe("prefersReducedMotion", () => {
  it("reports the media query's answer on a browser that supports it", () => {
    const queries = stubWindow(true);

    expect(prefersReducedMotion()).toBe(true);
    expect(queries).toEqual(["(prefers-reduced-motion: reduce)"]);
  });

  it("is false when the visitor has not asked for reduced motion", () => {
    stubWindow(false);

    expect(prefersReducedMotion()).toBe(false);
  });

  it("is false when matchMedia is unavailable", () => {
    stubWindow(null);

    expect(prefersReducedMotion()).toBe(false);
  });
});
