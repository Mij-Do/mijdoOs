import { useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import type { MenuAnchor, SystemActions } from "../../types/menu";
import type { DesktopAppId } from "../../types/window";
import { MenuPanel } from "../menu/MenuPanel";
import { createDesktopMenuDefinitions } from "../menu/menuDefinitions";

type DesktopProps = {
  actions: SystemActions;
  isIconsArranged: boolean;
  layoutKey: string;
  onOpenWindow: (id: DesktopAppId) => void;
  children: ReactNode;
};

const desktopApplications: { id: DesktopAppId; label: string; icon: string }[] = [
  { id: "mijdo", label: "Mijdo.exe", icon: "EXE" },
  { id: "profile", label: "Profile.exe", icon: "PRF" },
  { id: "education", label: "Education.exe", icon: "EDU" },
  { id: "skills", label: "Skills.exe", icon: "SKL" },
  { id: "experience", label: "Experience.exe", icon: "EXP" },
  { id: "projects", label: "Projects.exe", icon: "PRJ" },
  { id: "contact", label: "Contact.exe", icon: "CNT" },
  { id: "terminal", label: "Terminal.exe", icon: "TRM" },
];

export function Desktop({
  actions,
  isIconsArranged,
  layoutKey,
  onOpenWindow,
  children,
}: DesktopProps) {
  const [contextAnchor, setContextAnchor] = useState<MenuAnchor | null>(null);

  /*
    Refresh Desktop recalculates the desktop arrangement, so the layout
    descriptor is rebuilt whenever the shell bumps the layout key.
  */
  const layout = useMemo(
    () => ({ isArranged: isIconsArranged, layoutKey }),
    [isIconsArranged, layoutKey],
  );

  /*
    Arranging icons is deterministic: the registry order becomes
    alphabetical order and the icons are laid out in columns.
  */
  const icons = useMemo(() => {
    if (!layout.isArranged) return desktopApplications;

    return [...desktopApplications].sort((first, second) =>
      first.label.localeCompare(second.label),
    );
  }, [layout]);

  const contextItems = useMemo(
    () =>
      createDesktopMenuDefinitions(
        { ...actions, closeMenu: () => setContextAnchor(null) },
        layout.isArranged,
      ),
    [actions, layout],
  );

  function handleContextMenu(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    setContextAnchor({ left: event.clientX, top: event.clientY });
  }

  return (
    <main className="mijdo-desktop" onContextMenu={handleContextMenu}>
      <div
        className={
          layout.isArranged
            ? "mijdo-desktop-icons is-arranged"
            : "mijdo-desktop-icons"
        }
      >
        {icons.map((application) => (
          <button
            className="mijdo-desktop-icon"
            type="button"
            key={application.id}
            aria-label={`Open ${application.label}`}
            onClick={() => onOpenWindow(application.id)}
            onContextMenu={(event) => event.stopPropagation()}
          >
            <span className="mijdo-desktop-icon-art" aria-hidden="true">
              {application.icon}
            </span>
            <span>
              {layout.isArranged
                ? application.label.toUpperCase()
                : application.label}
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
