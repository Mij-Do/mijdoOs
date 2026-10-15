import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { desktopApplications } from "../../data/windows";
import type { MenuAnchor, SystemActions } from "../../types/menu";
import type { DesktopAppId, WindowId } from "../../types/window";
import { MenuPanel } from "../menu/MenuPanel";
import { createDesktopMenuDefinitions } from "../menu/menuDefinitions";
import { DesktopIconArt } from "./desktopIcons";

type DesktopProps = {
  actions: SystemActions;
  isIconsArranged: boolean;
  onOpenWindow: (id: DesktopAppId) => void;
  runningWindowIds: ReadonlySet<WindowId>;
  children: ReactNode;
};

/*
  Titles carry the .exe suffix that gives the desktop its identity, so the
  suffix is split off and kept on its own line. A classic icon label wraps
  rather than growing, and "Experience" over ".exe" is a readable break
  instead of a mid-word one.
*/
function splitLabel(title: string) {
  const dot = title.lastIndexOf(".");

  if (dot <= 0) return { name: title, extension: "" };

  return { name: title.slice(0, dot), extension: title.slice(dot) };
}

export function Desktop({
  actions,
  isIconsArranged,
  onOpenWindow,
  runningWindowIds,
  children,
}: DesktopProps) {
  const [contextAnchor, setContextAnchor] = useState<MenuAnchor | null>(null);
  const iconsRef = useRef<HTMLDivElement | null>(null);
  /*
    The element the context menu hands focus back to when it closes. Captured
    at right-click time: usually the body, because the click itself has already
    blurred whatever was focused, but a real control when the menu was opened
    from the keyboard over a focused icon.
  */
  const contextReturnRef = useRef<HTMLElement | null>(null);

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

    /*
      Escape must leave the keyboard somewhere real instead of on the document
      body: with the element that held focus when the menu opened when it is
      still mounted and focusable, and otherwise with the first icon — the
      desktop's own keyboard entry point.
    */
    const owner = document.activeElement;

    contextReturnRef.current =
      owner instanceof HTMLElement &&
      owner !== document.body &&
      owner !== document.documentElement &&
      owner.isConnected
        ? owner
        : (iconsRef.current?.querySelector<HTMLElement>(".mijdo-desktop-icon") ??
          null);

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
        ref={iconsRef}
      >
        {icons.map((application) => {
          const isRunning = runningWindowIds.has(application.id);
          const label = splitLabel(
            isIconsArranged ? application.title.toUpperCase() : application.title,
          );

          return (
            <button
              className="mijdo-desktop-icon"
              type="button"
              key={application.id}
              data-running={isRunning}
              title={isRunning ? `${application.title} (running)` : application.title}
              aria-label={
                isRunning
                  ? `Open ${application.title}, already running`
                  : `Open ${application.title}`
              }
              onClick={() => onOpenWindow(application.id)}
            >
              <DesktopIconArt applicationId={application.id} />
              <span className="mijdo-desktop-icon-label">
                <span className="mijdo-desktop-icon-name">{label.name}</span>
                {label.extension ? (
                  <span className="mijdo-desktop-icon-extension">
                    {label.extension}
                  </span>
                ) : null}
              </span>
              {isRunning ? (
                <span className="mijdo-desktop-icon-flag" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
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
          returnFocusRef={contextReturnRef}
        />
      ) : null}
    </main>
  );
}
