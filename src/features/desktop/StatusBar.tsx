import { useEffect, useState } from "react";
import { contact, socialLinks } from "../../data/contact";
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
};

export function StatusBar({ windows, onOpenWindow }: StatusBarProps) {
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
        <div className="mijdo-status-links">
          {socialLinks.map((link) => (
            <a
              className="mijdo-status-link"
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              aria-label={`Open ${link.label}`}
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
          title="CV"
          aria-label="Open CV"
        >
          [CV]
        </a>
        <time dateTime={new Date().toISOString()}>{time}</time>
      </div>
    </footer>
  );
}
