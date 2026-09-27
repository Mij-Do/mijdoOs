import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { initialWindows, windowDefinitions } from "../data/windows";
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

/*
  Every declared window must have a component. The Record type enforces
  this at compile time, so the registry and the window table cannot drift.
*/
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

/*
  Render order follows the registry table, so a new window is placed by
  declaring it in data/windows.ts rather than by editing this file.
*/
const windowIds = windowDefinitions.map((definition) => definition.id);

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
