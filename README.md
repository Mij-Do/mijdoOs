# MijdoOS

> **A personal computer disguised as a developer portfolio.**

MijdoOS is an interactive developer portfolio for **Ahmed Samir**, designed as a fictional early personal computer operating system inspired by the visual language of **Microsoft Windows 1.x and early graphical user interfaces**.

Instead of presenting the portfolio as a traditional modern website, MijdoOS turns the entire experience into an interactive desktop environment.

Visitors can boot the system, open applications, move windows, inspect projects, browse skills and experience, use a terminal, and explore Ahmed's professional profile through an operating-system metaphor.

---

# Concept

The central idea behind MijdoOS is:

> **The operating system is the portfolio.**

MijdoOS is not a modern portfolio with retro colors.

The entire interface follows an early graphical operating-system architecture:

```text
Boot
  ↓
Desktop
  ↓
Applications
  ↓
Windows
  ↓
Portfolio Content
```

The primary application is:

```text
Mijdo.exe
```

which acts as the main portfolio command center.

Other applications represent different parts of the portfolio:

```text
Mijdo.exe
Projects Manager
Mijdo Terminal
Skills.cfg
Experience.dat
Contact
System Information
BugCheck.log
```

---

# Goals

MijdoOS has four main goals:

1. Present Ahmed's portfolio in a memorable way.
2. Demonstrate practical React and TypeScript skills.
3. Build a real interactive desktop/window-management system.
4. Combine nostalgic computer UI design with a usable professional portfolio.

The retro interface should never prevent visitors from quickly accessing:

* About
* Experience
* Skills
* Projects
* Contact
* GitHub
* Resume / CV

---

# Technology Stack

## Core

### React

React is the primary UI framework.

It is responsible for:

* component architecture
* rendering
* application state
* window management UI
* application composition
* interactions

---

### TypeScript

TypeScript provides type safety across the application.

It will be used for:

* window state
* reducer actions
* application definitions
* terminal commands
* project data
* system state
* component props

---

### Vite

Vite is used as the development environment and build tool.

Reasons:

* fast development server
* React Fast Refresh
* TypeScript support
* simple configuration
* optimized production builds

MijdoOS is primarily a client-side interactive application, so Vite provides a lightweight foundation without introducing unnecessary server architecture.

---

# Styling

## Tailwind CSS

Tailwind CSS is the primary styling system.

Tailwind will handle:

* layout
* spacing
* sizing
* positioning
* responsive behavior
* flexbox
* grid
* typography utilities
* borders
* backgrounds
* state variants

However, MijdoOS will **not** use Tailwind's default visual identity.

A custom MijdoOS design system will be built on top of Tailwind.

The project will define its own:

* colors
* typography
* borders
* bevels
* window styles
* buttons
* menus
* dialogs
* desktop environment

Tailwind is the implementation utility layer.

MijdoOS is the visual design system.

---

# Visual Identity

MijdoOS is primarily inspired by early Windows 1.x / early graphical operating systems.

The visual language uses:

* rectangular geometry
* hard borders
* inset/outset bevels
* bitmap-inspired typography
* compact spacing
* limited colors
* monochrome controls
* navy active title bars
* gray inactive windows
* solid teal desktop background
* subtle CRT effects

Avoid:

* glassmorphism
* gradients
* rounded cards
* excessive shadows
* modern dashboard styling
* excessive animations
* neon cyberpunk styling

---

# Color System

The primary MijdoOS palette:

```text
Black       #000000
White       #FFFFFF
Light Gray  #C0C0C0
Gray        #808080
Dark Gray   #404040
Navy        #000080
Teal        #008080
```

Additional colors should be used very sparingly.

The palette should feel like an early computer display rather than a modern UI.

---

# Interaction

MijdoOS behaves like a small desktop environment.

The user can:

* open applications
* close windows
* minimize windows
* restore windows
* maximize windows
* move windows
* focus windows
* switch between running applications
* open system menus
* interact with the terminal

The interface should feel responsive and mechanical rather than heavily animated.

---

# Motion

Motion is used selectively for:

* window opening
* window closing
* minimizing
* restoring
* subtle interaction feedback
* drag interactions when appropriate

Animations should remain short and restrained.

MijdoOS should never feel like a modern motion-heavy landing page.

---

# State Management

The project will initially use native React state management.

The main OS state will be managed with:

```text
Context
+
useReducer
```

The global OS state includes:

```text
OS State
│
├── Windows
│   ├── open
│   ├── minimized
│   ├── maximized
│   ├── position
│   ├── dimensions
│   └── z-index
│
├── Active Window
├── Open Menus
├── System State
└── Terminal State
```

Example actions:

```text
OPEN_WINDOW
CLOSE_WINDOW
MINIMIZE_WINDOW
RESTORE_WINDOW
MAXIMIZE_WINDOW
FOCUS_WINDOW
MOVE_WINDOW
RESIZE_WINDOW
```

An external state library such as Zustand will not be used initially.

---

# Window Manager

The Window Manager is the heart of MijdoOS.

It is responsible for:

* window registration
* opening
* closing
* minimizing
* restoring
* maximizing
* focusing
* moving
* positioning
* z-index management

Architecture:

```text
User Interaction
       ↓
Window Action
       ↓
Reducer
       ↓
OS State
       ↓
Window Manager
       ↓
Rendered Windows
```

---

# Dragging

Windows use coordinate-based movement rather than traditional sortable drag-and-drop.

The project can use Motion for pointer and drag interactions.

A drag-and-drop framework such as dnd-kit is intentionally not required because MijdoOS does not need sortable lists or drop zones as its primary interaction model.

---

# Terminal

The first version will use a custom React terminal.

Example commands:

```text
whoami
help
projects
skills
experience
contact
github
clear
```

Example:

```text
C:\MIJDO> whoami

Ahmed Samir
Developer
Egypt

C:\MIJDO>
```

A real terminal emulator such as `xterm` may be introduced later if advanced terminal behavior becomes necessary.

---

# Applications

## Mijdo.exe

The main portfolio command center.

Contains:

* introduction
* biography
* quick access
* skills summary
* recent projects
* contact shortcuts

---

## Projects Manager

Represents projects as files/programs.

Example:

```text
C:\PROJECTS\*.*

PROJECT_01.EXE
PROJECT_02.COM
PROJECT_03.SYS
```

Selecting a project opens an inspector window containing:

* project name
* description
* technologies
* GitHub
* live demo

---

## Skills.cfg

Technical skills represented as a system configuration file.

---

## Experience.dat

Professional experience represented as system data.

---

## Mijdo Terminal

Interactive command-line interface for exploring the portfolio.

---

## Contact

Contains:

* Email
* GitHub
* LinkedIn
* Instagram
* X
* CV

---

## BugCheck.log

A fictional diagnostic utility containing small developer Easter eggs.

Example:

```text
MIJDOOS SYSTEM CHECK

No critical errors detected.

This is suspicious.

[ OK ]
```

---

# Project Architecture

```text
src/
│
├── app/
│   ├── App.tsx
│   └── providers/
│       └── OSProvider.tsx
│
├── core/
│   ├── window-manager/
│   │   ├── types.ts
│   │   ├── reducer.ts
│   │   ├── actions.ts
│   │   └── selectors.ts
│   │
│   ├── terminal/
│   │   ├── commands.ts
│   │   ├── parser.ts
│   │   └── types.ts
│   │
│   └── system/
│       ├── boot.ts
│       ├── clock.ts
│       └── system-info.ts
│
├── components/
│   │
│   ├── desktop/
│   │   ├── Desktop.tsx
│   │   ├── DesktopIcon.tsx
│   │   └── DesktopIcons.tsx
│   │
│   ├── command-bar/
│   │   ├── CommandBar.tsx
│   │   ├── Menu.tsx
│   │   └── MenuItem.tsx
│   │
│   ├── window/
│   │   ├── Window.tsx
│   │   ├── WindowTitleBar.tsx
│   │   ├── WindowControls.tsx
│   │   └── WindowContent.tsx
│   │
│   ├── execution-bar/
│   │   └── ExecutionBar.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Dialog.tsx
│       ├── List.tsx
│       └── Scrollbar.tsx
│
├── applications/
│   ├── mijdo/
│   │   └── MijdoApp.tsx
│   │
│   ├── projects/
│   │   └── ProjectsApp.tsx
│   │
│   ├── terminal/
│   │   └── TerminalApp.tsx
│   │
│   ├── skills/
│   │   └── SkillsApp.tsx
│   │
│   ├── experience/
│   │   └── ExperienceApp.tsx
│   │
│   ├── contact/
│   │   └── ContactApp.tsx
│   │
│   └── system/
│       ├── AboutSystem.tsx
│       ├── BugCheck.tsx
│       └── SystemInfo.tsx
│
├── data/
│   ├── projects.ts
│   ├── skills.ts
│   ├── experience.ts
│   └── contact.ts
│
├── styles/
│   ├── globals.css
│   ├── typography.css
│   ├── desktop.css
│   └── windows.css
│
├── assets/
│   ├── icons/
│   ├── screenshots/
│   └── sounds/
│
└── utils/
    ├── clamp.ts
    ├── coordinates.ts
    └── format.ts
```

---

# Layered Architecture

MijdoOS is divided into four major layers.

```text
┌───────────────────────────────────────┐
│              APPLICATIONS             │
│ Mijdo.exe / Projects / Terminal / ... │
└───────────────────┬───────────────────┘
                    │
┌───────────────────▼───────────────────┐
│                 UI                     │
│ Desktop / Windows / Menus / Controls   │
└───────────────────┬───────────────────┘
                    │
┌───────────────────▼───────────────────┐
│                 CORE                   │
│ Window Manager / Terminal / System     │
└───────────────────┬───────────────────┘
                    │
┌───────────────────▼───────────────────┐
│                DATA                    │
│ Projects / Skills / Experience / Links │
└───────────────────────────────────────┘
```

The important rule is:

> Applications should not own the operating system.

The OS core manages the environment.

Applications only provide their content and application-specific behavior.

---

# Tailwind CSS Architecture

Tailwind is used throughout the component layer.

Example:

```tsx
<div className="border border-black bg-mijdo-gray text-black">
  ...
</div>
```

MijdoOS-specific Tailwind tokens should be defined in the Tailwind configuration/theme rather than repeatedly hardcoding colors throughout components.

Example conceptual tokens:

```text
bg-mijdo-teal
bg-mijdo-gray
bg-mijdo-light
bg-mijdo-dark
bg-mijdo-navy

text-mijdo-black
text-mijdo-white

border-mijdo-black
border-mijdo-gray
```

Reusable visual primitives such as bevels and title bars can remain in CSS when the effect is too complex or repetitive for utility classes.

---

# Data Architecture

Portfolio content is separated from UI components.

Example:

```ts
export const projects = [
  {
    id: "project-01",
    filename: "PROJECT_01.EXE",
    title: "Project Name",
    description: "Project description",
    technologies: ["React", "TypeScript"],
    github: "...",
    demo: "...",
  },
];
```

This allows content to change without modifying the OS architecture.

---

# Responsive Strategy

MijdoOS must remain usable on desktop, tablet, and mobile.

## Desktop

Full desktop environment:

```text
Desktop
├── Command Bar
├── Desktop Icons
├── Multiple Windows
└── Execution Bar
```

## Mobile

The OS remains visually consistent but adapts its window system:

```text
Desktop
   ↓
Application selected
   ↓
Window becomes full-screen
   ↓
Application remains accessible
```

The mobile version should not become a standard card-based portfolio.

---

# Testing

## Vitest

Used for:

* reducers
* window actions
* terminal parser
* utility functions
* data helpers

## Playwright

Used for:

* boot sequence
* opening applications
* window interactions
* dragging
* minimizing
* restoring
* terminal commands
* responsive behavior

---

# Performance

MijdoOS should remain lightweight despite simulating a desktop environment.

Principles:

* minimize dependencies
* avoid unnecessary global state
* lazy-load non-critical applications when useful
* optimize images
* keep animations minimal
* use CSS for simple effects
* avoid unnecessary re-renders

---

# Development Roadmap

## Phase 1 — Foundation

* [ ] React + TypeScript + Vite
* [ ] Tailwind CSS
* [ ] Global design tokens
* [ ] Typography
* [ ] Base UI primitives

## Phase 2 — OS Shell

* [ ] Boot screen
* [ ] Desktop
* [ ] Command bar
* [ ] Desktop icons
* [ ] Execution bar
* [ ] System clock

## Phase 3 — Window Manager

* [ ] Window state
* [ ] Open
* [ ] Close
* [ ] Minimize
* [ ] Restore
* [ ] Maximize
* [ ] Focus
* [ ] z-index
* [ ] Dragging
* [ ] Responsive behavior

## Phase 4 — Applications

* [ ] Mijdo.exe
* [ ] Projects Manager
* [ ] Terminal
* [ ] Skills.cfg
* [ ] Experience.dat
* [ ] Contact
* [ ] System Information
* [ ] BugCheck.log

## Phase 5 — Real Content

* [ ] Projects
* [ ] Experience
* [ ] Skills
* [ ] GitHub
* [ ] Social links
* [ ] CV
* [ ] Contact information

## Phase 6 — Polish

* [ ] CRT effect
* [ ] Pixel icons
* [ ] Keyboard shortcuts
* [ ] Easter eggs
* [ ] Sound effects
* [ ] Accessibility
* [ ] Mobile refinement

## Phase 7 — Testing

* [ ] Unit tests
* [ ] Window Manager tests
* [ ] Terminal tests
* [ ] E2E tests
* [ ] Mobile tests
* [ ] Cross-browser testing

## Phase 8 — Deployment

* [ ] Production build
* [ ] Performance audit
* [ ] Accessibility audit
* [ ] Final content review
* [ ] Deployment

---

# Final Stack

```text
MijdoOS
│
├── React
├── TypeScript
├── Vite
│
├── Tailwind CSS
│
├── Motion
│
├── Vitest
└── Playwright
```

Optional future dependency:

```text
xterm.js
```

MijdoOS intentionally avoids large UI component libraries.

The UI is custom-built around the MijdoOS design language while Tailwind provides the utility layer needed to build and maintain the interface efficiently.

---

# Philosophy

MijdoOS should demonstrate both creativity and engineering.

The visual interface is nostalgic.

The implementation is modern.

The goal is not to recreate an old operating system technically.

The goal is to create a convincing **fictional personal operating system** that happens to be a developer portfolio.

> **Boot the system. Explore the computer. Discover the developer.**
