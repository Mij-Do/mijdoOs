import { memo, useMemo, useState } from "react";
import type { ComponentType } from "react";
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

type WindowComponent = ComponentType<WindowControllerProps>;

/*
  Every declared window must have a component. The Record type enforces
  this at compile time, so the registry and the window table cannot drift.

  Each entry is memoised at this single boundary: a drag dispatches "move",
  the reducer replaces only the moved window's state object, and the five
  controllers are created once per mount, so the seven untouched windows
  keep identical prop identities and skip re-rendering entirely. Actions
  that must reach every window (focus, open, close, minimize, maximize,
  show-desktop) rebuild every state object in the reducer, so those still
  re-render all windows. WindowFrame itself cannot be the boundary because
  it always receives freshly created children elements, which would fail
  its shallow comparison on every parent render.
*/
const windowRegistry: Record<WindowId, WindowComponent> = {
  mijdo: memo(MijdoWindow),
  profile: memo(ProfileApplication),
  education: memo(EducationApplication),
  skills: memo(SkillsApplication),
  experience: memo(ExperienceApplication),
  projects: memo(ProjectsApplication),
  contact: memo(ContactApplication),
  terminal: memo(TerminalWindow),
  about: memo(AboutApplication),
  "system-info": memo(SystemInfoApplication),
  help: memo(HelpApplication),
  shortcuts: memo(ShortcutsApplication),
};

/*
  Render order follows the registry table, so a new window is placed by
  declaring it in data/windows.ts rather than by editing this file.
*/
const windowIds = windowDefinitions.map((definition) => definition.id);

function windowTitle(id: WindowId) {
  return windowDefinitions.find((definition) => definition.id === id)?.title;
}

/*
  When a window leaves the screen its frame unmounts, and the focus that sat
  on one of its controls would fall to the document body, where the next Tab
  press would start over from the command bar. Focus therefore moves to a
  target that survives the removal: the task bar entry when the window is only
  minimized, the desktop icon when it is closed, and the first desktop icon in
  every other case — the keyboard entry point of the desktop itself. All three
  are matched through attributes that exist before and after the re-render
  that follows the dispatch, so the same node keeps the focus, and a missing
  node is never focused.
*/
function focusIfConnected(element: HTMLElement | null) {
  if (!element?.isConnected) return;

  element.focus();
}

function focusAfterMinimize(id: WindowId) {
  const title = windowTitle(id);
  const taskItem = title
    ? document.querySelector<HTMLElement>(`.mijdo-status-item[title="${title}"]`)
    : null;

  focusIfConnected(
    taskItem ?? document.querySelector<HTMLElement>(".mijdo-desktop-icon"),
  );
}

function focusAfterClose(id: WindowId) {
  const title = windowTitle(id);
  const icon = title
    ? document.querySelector<HTMLElement>(
        `.mijdo-desktop-icon[aria-label^="Open ${title}"]`,
      )
    : null;

  focusIfConnected(
    icon ?? document.querySelector<HTMLElement>(".mijdo-desktop-icon"),
  );
}

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
        onClose: () => {
          closeWindow(id);
          focusAfterClose(id);
        },
        onMinimize: () => {
          minimizeWindow(id);
          focusAfterMinimize(id);
        },
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

  /*
    The task list only ever shows windows that are open, so it is filtered
    here and handed over as a stable list instead of the whole window map.
  */
  const openWindows = useMemo(
    () => windowIds.map((id) => windows[id]).filter((state) => state.isOpen),
    [windows],
  );

  /*
    A desktop icon shows that its application is already running, so the shell
    hands the open window ids down. Memoised because it is rebuilt from the
    window map on every render otherwise.
  */
  const runningWindowIds = useMemo(() => {
    const running = new Set<WindowId>();

    for (const id of windowIds) {
      if (windows[id].isOpen) running.add(id);
    }

    return running;
  }, [windows]);

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
        runningWindowIds={runningWindowIds}
      >
        {windowIds.map(renderWindow)}
      </Desktop>
      <StatusBar
        windows={openWindows}
        onOpenWindow={openWindow}
      />
    </div>
  );
}
