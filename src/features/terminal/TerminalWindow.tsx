import { useEffect, useLayoutEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { WindowControllerProps } from "../../types/window";
import { WindowFrame } from "../window/WindowFrame";
import { TERMINAL_PROMPT } from "./terminalTypes";
import { useTerminalSession } from "./useTerminalSession";

const INPUT_ID = "mijdo-terminal-input";

export function TerminalWindow(props: WindowControllerProps) {
  const { windowState, onClose } = props;
  const { lines, input, setInput, run, recallHistory } =
    useTerminalSession(onClose);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (windowState.isFocused) inputRef.current?.focus();
  }, [windowState.isFocused]);

  useLayoutEffect(() => {
    const output = outputRef.current;

    if (output) output.scrollTop = output.scrollHeight;
  }, [lines, input]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      run(input);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      recallHistory(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      recallHistory(1);
    }
  }

  return (
    <WindowFrame {...props}>
      <div
        className="mijdo-terminal"
        ref={outputRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onPointerDown={() => inputRef.current?.focus()}
      >
        {lines.map((line, index) => (
          <div
            className="mijdo-terminal-line"
            data-kind={line.kind}
            key={index}
          >
            {line.text}
          </div>
        ))}

        <div className="mijdo-terminal-prompt">
          <label className="mijdo-terminal-prompt-label" htmlFor={INPUT_ID}>
            {TERMINAL_PROMPT}
          </label>
          <input
            className="mijdo-terminal-input"
            id={INPUT_ID}
            ref={inputRef}
            type="text"
            value={input}
            aria-label="Terminal command"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </WindowFrame>
  );
}
