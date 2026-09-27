import { useEffect, useState } from "react";
import { contact, socialLinks } from "../../data/contact";
import type { WindowId, WindowState } from "../../types/window";

type StatusBarProps = {
  windows: WindowState[];
  onOpenWindow: (id: WindowId) => void;
};

/*
  The clock ticks on its own, so it lives in its own component. Otherwise every
  second would re-render the whole task list and the link row for no reason.
*/
function Clock() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const timer = window.setInterval(
      () => setTime(formatTime(new Date())),
      1000,
    );

    return () => window.clearInterval(timer);
  }, []);

  return (
    <time className="mijdo-status-clock" dateTime={new Date().toISOString()}>
      {time}
    </time>
  );
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function StatusBar({ windows, onOpenWindow }: StatusBarProps) {
  return (
    <footer className="mijdo-status-bar">
      <div className="mijdo-status-apps">
        {windows.map((windowState) => (
          <button
            className="mijdo-status-item"
            type="button"
            key={windowState.id}
            data-active={windowState.isFocused}
            data-minimized={windowState.isMinimized}
            aria-current={windowState.isFocused ? "true" : undefined}
            aria-label={
              windowState.isMinimized
                ? `Restore ${windowState.title}`
                : `Focus ${windowState.title}`
            }
            title={windowState.title}
            onClick={() => onOpenWindow(windowState.id)}
          >
            [{windowState.title}]
          </button>
        ))}
      </div>
      <div className="mijdo-status-actions">
        <div className="mijdo-status-links">
          {socialLinks.map((link) => (
            <a
              className="mijdo-status-link"
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              aria-label={`Open ${link.label} in a new tab`}
            >
              [{link.badge}]
            </a>
          ))}
        </div>
        <a
          className="mijdo-status-cv"
          href={contact.cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open CV in a new tab"
          aria-label="Open CV in a new tab"
        >
          [CV]
        </a>
        <Clock />
      </div>
    </footer>
  );
}
