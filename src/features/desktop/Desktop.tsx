import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { desktopApplications } from "../../data/windows";
import type { MenuAnchor, SystemActions } from "../../types/menu";
import type { DesktopAppId } from "../../types/window";
import { MenuPanel } from "../menu/MenuPanel";
import { createDesktopMenuDefinitions } from "../menu/menuDefinitions";

type DesktopProps = {
  actions: SystemActions;
  isIconsArranged: boolean;
  onOpenWindow: (id: DesktopAppId) => void;
  children: ReactNode;
};

export function Desktop({
  actions,
  isIconsArranged,
  onOpenWindow,
  children,
}: DesktopProps) {
  const [contextAnchor, setContextAnchor] = useState<MenuAnchor | null>(null);

  /*
    Arranging icons is deterministic: the registry order becomes
    alphabetical order and the icons are laid out in columns.
  */
  const icons = isIconsArranged
    ? [...desktopApplications].sort((first, second) =>
        first.title.localeCompare(second.title),
      )
    : desktopApplications;

  const contextItems = createDesktopMenuDefinitions(
    { ...actions, closeMenu: () => setContextAnchor(null) },
    isIconsArranged,
  );

  function handleContextMenu(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setContextAnchor({ left: event.clientX, top: event.clientY });
  }

  return (
    <main className="mijdo-desktop" onContextMenu={handleContextMenu}>
      <div
        className={
          isIconsArranged
            ? "mijdo-desktop-icons is-arranged"
            : "mijdo-desktop-icons"
        }
      >
        {icons.map((application) => (
          <button
            className="mijdo-desktop-icon"
            type="button"
            key={application.id}
            aria-label={`Open ${application.title}`}
            onClick={() => onOpenWindow(application.id)}
            onContextMenu={(event) => event.stopPropagation()}
          >
            <span className="mijdo-desktop-icon-art" aria-hidden="true">
              {application.icon}
            </span>
            <span>
              {isIconsArranged
                ? application.title.toUpperCase()
                : application.title}
            </span>
          </button>
        ))}
      </div>

      {children}

      {contextAnchor ? (
        <MenuPanel
          id="desktop-context-menu"
          label="Desktop"
          items={contextItems}
          anchorLeft={contextAnchor.left}
          anchorTop={contextAnchor.top}
          onClose={() => setContextAnchor(null)}
        />
      ) : null}
    </main>
  );
}
