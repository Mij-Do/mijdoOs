import { useEffect, useState } from "react";
import type { WindowId, WindowState } from "../../types/window";

function getCurrentTime() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

type StatusBarProps = {
  windows: WindowState[];
  onOpenWindow: (id: WindowId) => void;
  onOpenCv: () => void;
};

export function StatusBar({ windows, onOpenWindow, onOpenCv }: StatusBarProps) {
  const [time, setTime] = useState(getCurrentTime);

  useEffect(() => {
    const clock = window.setInterval(() => setTime(getCurrentTime()), 1000);

    return () => window.clearInterval(clock);
  }, []);

  return (
    <footer className="mijdo-status-bar">
      <div className="mijdo-status-apps">
        {windows
          .filter((windowState) => windowState.isOpen)
          .map((windowState) => (
            <button
              className="mijdo-status-item"
              type="button"
              key={windowState.id}
              data-active={windowState.isFocused}
              data-minimized={windowState.isMinimized}
              aria-label={
                windowState.isMinimized
                  ? `Restore ${windowState.title}`
                  : `Focus ${windowState.title}`
              }
              onClick={() => onOpenWindow(windowState.id)}
            >
              [{windowState.title}]
            </button>
          ))}
      </div>
      <div className="mijdo-status-actions">
        <button
          className="mijdo-status-cv"
          type="button"
          aria-label="Open CV"
          onClick={onOpenCv}
        >
          [CV]
        </button>
        <time dateTime={new Date().toISOString()}>{time}</time>
      </div>
    </footer>
  );
}
