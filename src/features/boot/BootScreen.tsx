import { useCallback, useEffect, useRef, useState } from "react";
import { systemInfo } from "../../data/system";
import { TERMINAL_PROMPT } from "../terminal/terminalPrompt";

/*
  A short power-on self test, in the shape of the machines this system is
  imitating. The sequence is a fixed list with fixed delays, so it always runs
  the same way.

  The shell is already mounted underneath, so nothing is actually delayed: the
  sequence only decides when the desktop is allowed to become visible. It ends
  on its own once the last line has been read, any key or pointer press skips
  it, and reduced motion shows the whole thing at once.
*/
const BOOT_LINES = [
  `${systemInfo.productName} ${systemInfo.version}`,
  systemInfo.tagline,
  "",
  "Memory Test: 640K OK",
  "Detecting System Components . . . OK",
  "",
  "Loading Mijdo.exe . . . OK",
];

const LINE_INTERVAL = 165;
const LINE_HOLD = 420;
const REDUCED_MOTION_HOLD = 260;
const FADE_OUT = 120;

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [visibleLines, setVisibleLines] = useState(() =>
    reducedMotion ? BOOT_LINES.length : 1,
  );
  const [isLeaving, setIsLeaving] = useState(false);

  const timersRef = useRef<number[]>([]);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;

    doneRef.current = true;
    clearTimers();
    setIsLeaving(true);
    window.setTimeout(() => onDoneRef.current(), reducedMotion ? 0 : FADE_OUT);
  }, [clearTimers, reducedMotion]);

  useEffect(() => {
    /*
      Reduced motion has nothing to reveal in stages, so the finished output is
      shown for a beat and the machine simply arrives at the desktop. The
      timeout matters here: a visitor who only ever presses Tab must never be
      held on the boot screen, because Tab is left alone by the skip handler.
    */
    if (reducedMotion) {
      const timer = window.setTimeout(finish, REDUCED_MOTION_HOLD);

      return () => window.clearTimeout(timer);
    }

    for (let index = 1; index < BOOT_LINES.length; index += 1) {
      const timer = window.setTimeout(() => setVisibleLines(index + 1), index * LINE_INTERVAL);

      timersRef.current.push(timer);
    }

    /*
      The sequence finishes by itself once the last line has been on screen for
      a moment, the way a machine carries on without being told to. Keys and
      pointer presses only shorten the wait.
    */
    const last = window.setTimeout(
      finish,
      (BOOT_LINES.length - 1) * LINE_INTERVAL + LINE_HOLD,
    );

    timersRef.current.push(last);

    return clearTimers;
  }, [clearTimers, finish, reducedMotion]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Tab") return;

      event.preventDefault();
      finish();
    }

    window.addEventListener("keydown", handleKeyDown, true);

    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [finish]);

  return (
    <div
      className={isLeaving ? "mijdo-boot is-leaving" : "mijdo-boot"}
      onPointerDown={(event) => {
        event.preventDefault();
        finish();
      }}
    >
      <p className="mijdo-sr-only" role="status">
        {`${systemInfo.productName} starting up. ${BOOT_LINES.join(" ")} Ready.`}
      </p>
      <div className="mijdo-boot-screen" aria-hidden="true">
        {BOOT_LINES.slice(0, visibleLines).map((line, index) => (
          <p className="mijdo-boot-line" key={`${index}-${line}`}>
            {line}
          </p>
        ))}
        <p className="mijdo-boot-line mijdo-boot-prompt">
          {TERMINAL_PROMPT}
          <span className="mijdo-boot-cursor" />
        </p>
      </div>
      <p className="mijdo-boot-skip" aria-hidden="true">
        Press any key to skip
      </p>
    </div>
  );
}
