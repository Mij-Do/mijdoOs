import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { initialWindows } from "../data/windows";
import {
  ContactApplication,
  EducationApplication,
  ExperienceApplication,
  ProfileApplication,
  ProjectsApplication,
  SkillsApplication,
} from "../features/apps/PortfolioApplications";
import {
  AboutApplication,
  HelpApplication,
  ShortcutsApplication,
  SystemInfoApplication,
} from "../features/apps/SystemApplications";
import { Desktop } from "../features/desktop/Desktop";
import { StatusBar } from "../features/desktop/StatusBar";
import { TopBar } from "../features/desktop/TopBar";
import { MijdoWindow } from "../features/mijdo/MijdoWindow";
import { TerminalWindow } from "../features/terminal/TerminalWindow";
import { useWindowManager } from "../hooks/useWindowManager";
import type { SystemActions } from "../types/menu";
import type { WindowControllerProps, WindowId } from "../types/window";

type WindowComponent = (props: WindowControllerProps) => ReactElement;

const windowRegistry: Record<WindowId, WindowComponent> = {
  mijdo: MijdoWindow,
  profile: ProfileApplication,
  education: EducationApplication,
  skills: SkillsApplication,
  experience: ExperienceApplication,
  projects: ProjectsApplication,
  contact: ContactApplication,
  terminal: TerminalWindow,
  about: AboutApplication,
  "system-info": SystemInfoApplication,
  help: HelpApplication,
  shortcuts: ShortcutsApplication,
};

const windowIds = Object.keys(windowRegistry) as WindowId[];

export function AppShell() {
  const {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
    moveWindow,
    showDesktop,
  } = useWindowManager(initialWindows);

  const [isIconsArranged, setIsIconsArranged] = useState(false);
  const [desktopRevision, setDesktopRevision] = useState(0);

  /*
    Window callbacks stay stable per window so dragging never
    re-subscribes its pointer listeners.
  */
  const windowControllers = useMemo(() => {
    const controllers = {} as Record<
      WindowId,
      Omit<WindowControllerProps, "windowState">
    >;

    for (const id of windowIds) {
      controllers[id] = {
        onClose: () => closeWindow(id),
        onMinimize: () => minimizeWindow(id),
        onToggleMaximize: () => toggleMaximize(id),
        onFocus: () => focusWindow(id),
        onMove: (position) => moveWindow(id, position),
      };
    }

    return controllers;
  }, [closeWindow, minimizeWindow, toggleMaximize, focusWindow, moveWindow]);

  const systemActions = useMemo<SystemActions>(
    () => ({
      openWindow,
      closeActiveWindow: () => {
        if (activeWindowId) closeWindow(activeWindowId);
      },
      showDesktop,
      toggleArrangeIcons: () => setIsIconsArranged((current) => !current),
      refreshDesktop: () => setDesktopRevision((current) => current + 1),
    }),
    [openWindow, closeWindow, activeWindowId, showDesktop],
  );

  function renderWindow(id: WindowId) {
    const windowState = windows[id];

    if (!windowState.isOpen || windowState.isMinimized) return null;

    const Window = windowRegistry[id];

    return (
      <Window
        key={id}
        windowState={windowState}
        {...windowControllers[id]}
      />
    );
  }

  return (
    <div className="mijdo-app-shell">
      <TopBar
        actions={systemActions}
        hasActiveWindow={activeWindowId !== null}
        isIconsArranged={isIconsArranged}
      />
      <Desktop
        actions={systemActions}
        isIconsArranged={isIconsArranged}
        layoutKey={`${isIconsArranged ? "arranged" : "stacked"}:${desktopRevision}`}
        onOpenWindow={openWindow}
      >
        {windowIds.map(renderWindow)}
      </Desktop>
      <StatusBar
        windows={windowIds.map((id) => windows[id])}
        onOpenWindow={openWindow}
      />
    </div>
  );
}
