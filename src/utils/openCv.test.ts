import { afterEach, describe, expect, it, vi } from "vitest";
import { contact } from "../data/contact";
import { openCv } from "./openCv";

type WindowStub = {
  matchMedia?: (query: string) => { matches: boolean };
  location: { assign: (url: string) => void };
};

const scope = globalThis as unknown as { window?: WindowStub };
const originalWindow = scope.window;

function stubWindow({ compact, hasMatchMedia = true }: { compact: boolean; hasMatchMedia?: boolean }) {
  const assign = vi.fn();

  scope.window = {
    ...(hasMatchMedia ? { matchMedia: () => ({ matches: compact }) } : {}),
    location: { assign },
  };

  return assign;
}

afterEach(() => {
  if (originalWindow === undefined) delete scope.window;
  else scope.window = originalWindow;
});

/*
  The compact layout is the only place the CV gives up its new tab, because
  that is where a mobile browser refuses to open a PDF in one. Everything else
  must be left alone so the anchor keeps opening the resume for a desktop.
*/
describe("opening the CV", () => {
  it("follows the link in the current tab on a compact viewport", () => {
    const assign = stubWindow({ compact: true });
    const preventDefault = vi.fn();

    openCv({ preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(contact.cvUrl);
  });

  it("lets the anchor open a new tab on a wide viewport", () => {
    const assign = stubWindow({ compact: false });
    const preventDefault = vi.fn();

    openCv({ preventDefault });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it("stays quiet when matchMedia is unavailable", () => {
    const assign = stubWindow({ compact: true, hasMatchMedia: false });
    const preventDefault = vi.fn();

    openCv({ preventDefault });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it("stays quiet when there is no window to navigate", () => {
    const preventDefault = vi.fn();

    openCv({ preventDefault });

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
