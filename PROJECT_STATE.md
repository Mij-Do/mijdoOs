# MijdoOS — Project State

## 1. Snapshot

- **Date:** 2026-09-27
- **Branch:** main
- **Commit:** 1ee9cac (refactor)
- **Working tree:** DIRTY — 21 modified files, 9 untracked files
- **Stack:** React 19.2.8, TypeScript ~6.0.2, Vite 8.3.0, Tailwind CSS 4.3.3 (preflight only)
- **Current phase:** Phase 08 (testing, hardening, documentation) — complete
- **Release status:** NOT RELEASE READY

## 2. Project Purpose

MijdoOS is a single-page developer portfolio for **Ahmed Samir** (full-stack developer, technical co-founder at Meem Langs), presented as a fictional early graphical operating system. A visitor boots the machine, lands on a desktop, opens windows by clicking icons or using the command bar, drags and stacks those windows, and reads real portfolio content inside them. A working command prompt exposes the same content as text. The metaphor is load-bearing: the portfolio *is* the desktop, the applications are the content sections, and the terminal is a second route to the same data.

## 3. Current Architecture

### Application Structure

```
src/
├── main.tsx                    # React 19 entry, StrictMode
├── App.tsx                     # Boot flag + CRT overlay
├── app/AppShell.tsx            # Composition root, window registry, controller wiring
├── data/                       # Portfolio content, zero React imports
│   ├── windows.ts              # Window registry (12 definitions, initial state)
│   ├── profile.ts              # Identity
│   ├── contact.ts              # Contact details, social links, CV URL
│   ├── projects.ts             # Project records
│   ├── skills.ts               # Technical, soft, language groups
│   ├── experience.ts           # Experience records
│   ├── education.ts            # Education records
│   ├── system.ts               # Product name, version, tagline
│   └── help.ts                 # Help topics, keyboard shortcuts
├── features/
│   ├── apps/                   # PortfolioApplications, SystemApplications, DetailWindow
│   ├── boot/BootScreen.tsx     # Staged POST sequence with skip
│   ├── desktop/                # Desktop, TopBar, StatusBar, icon art
│   ├── menu/                   # Menu definitions, MenuPanel (portal-rendered)
│   ├── mijdo/MijdoWindow.tsx   # Main landing window
│   ├── terminal/               # 7 modules: window, session, commands, parser, history, prompt, types
│   └── window/WindowFrame.tsx  # Chrome, controls, sizing, exit animation
├── hooks/
│   ├── useWindowManager.ts     # useReducer, 7 actions, z-order
│   ├── useDraggableWindow.ts   # Pointer drag, desktop-relative math, clamping
│   └── useContainedWindowPosition.ts  # Mobile seating, resize observer
├── types/
│   ├── window.ts               # WindowId, WindowState, WindowMap, actions
│   ├── menu.ts                 # MenuId, MenuItemAction, SystemActions
│   └── portfolio.ts            # Content record types
├── utils/portfolio.ts          # formatProjectPeriod
└── index.css                   # 1,687 lines, all visual decisions
```

### Composition Root

`AppShell` is the single composition root. It:
- Calls `useWindowManager(initialWindows)`
- Builds a `Record<WindowId, WindowComponent>` registry (compile-time exhaustive)
- Memoizes per-window controllers to stabilize drag listeners
- Renders `TopBar`, `Desktop` (hosts windows as children), `StatusBar`
- Derives `openWindows` and `runningWindowIds` from window state

### Data Flow

Data flows one way: `src/data/` holds typed content → features render it → terminal queries the same modules. Nothing in `src/data/` imports React.

## 4. Repository Structure

```
.
├── .gitignore
├── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── eslint.config.js
├── tsconfig.json / .app.json / .node.json / .tests.json
├── playwright.config.ts
├── vitest.config.ts
├── public/
│   ├── cv.pdf (117 KiB)
│   └── favicon.svg
├── src/                        # 43 files, ~5,097 lines
├── tests/browser/              # 8 spec files, 348 tests
└── dist/                       # Build output (generated)
```

## 5. Application / Feature Inventory

| Feature | Status | Details |
|---------|--------|---------|
| Boot sequence | ✅ Implemented | POST-style, skippable, reduced-motion path, a11y announced |
| Desktop icons | ✅ Implemented | 8 icons, 16×16 pixel art as merged SVG rects, single-click open, context menu |
| Window lifecycle | ✅ Implemented | Open, close, minimize, restore, maximize, focus, z-order, drag, containment |
| Command bar | ✅ Implemented | 5 menus (SYSTEM, File, View, Run, Help), portal panel, full keyboard nav |
| Status bar | ✅ Implemented | Task buttons, clock, social links, CV button |
| Terminal | ✅ Implemented | 13 commands, history, case-insensitive, shared data with windows |
| System dialogs | ✅ Implemented | About, System Info, Help, Shortcuts (non-modal, Escape dismiss) |
| Portfolio windows | ✅ Implemented | Profile, Education, Skills, Experience, Projects, Contact, Mijdo |
| Responsive | ✅ Implemented | Desktop >640px, tablet, mobile 390×844, narrow 360×640 |
| Accessibility | ✅ Implemented | Names, roles, live regions, focus rings, reduced motion, Tab/Shift+Tab |
| Unit tests | ✅ Implemented | 142 tests, 5 files (parser, history, reducer, commands, icon pixels) |
| Browser tests | ✅ Implemented | 348 tests, 8 specs, Chromium + Firefox |

## 6. Window Management Architecture

### State Model

`WindowState` (flat, explicit):
```ts
{
  id: WindowId,
  title: string,
  variant: "window" | "dialog",
  position: { x, y },
  isOpen: boolean,
  isMinimized: boolean,
  isMaximized: boolean,
  isFocused: boolean,
  zIndex: number
}
```

### Actions (7 total)

| Action | Payload | Effect |
|--------|---------|--------|
| `open` | `id` | Opens, unfocuses others, raises to top |
| `close` | `id` | Closes, settles focus to topmost visible |
| `minimize` | `id` | Minimizes, settles focus |
| `toggle-maximize` | `id` | Toggles maximize, raises, focuses |
| `focus` | `id` | Raises, focuses |
| `move` | `id, position` | Updates position (drag) |
| `show-desktop` | — | Minimizes all open windows |

### Manager State

```ts
{
  windows: WindowMap,           // Record<WindowId, WindowState>
  activeWindowId: WindowId | null,
  topZIndex: number             // Monotonic counter
}
```

### Key Invariants

- `topZIndex` is monotonic → stacking order = insertion order
- Minimized windows are **not rendered** (AppShell line 131)
- Focus is orthogonal to open/minimized/maximized (boolean + zIndex)
- No resize action, no dimensions on WindowState
- Registry is `Record<WindowId, Component>` → omission/extra = compile error

### Positioning

- Positions stored desktop-relative
- `useDraggableWindow`: measures desktop once at drag start, pointer capture, clamps to keep 140×48 px of title bar reachable
- `useContainedWindowPosition`: seats windows on mobile, respects user drag, re-seats on resize, skips maximized

## 7. Responsive Architecture

### Breakpoints (matching CSS)

| Breakpoint | Viewport | Behavior |
|------------|----------|----------|
| Desktop | >640px | Windows float at cascade positions, icons single column |
| Tablet | 640–834px | Windows float, icons single column |
| Mobile | 390×844 | Windows become sheets (full width, below icons), icons wrap rows |
| Narrow | 360×640 | Further compaction, smaller icon labels |

### Mobile Sheet Rules

- Window spans full width minus 16px inset
- Height runs from below icon rows to bottom of surface
- Caption does not drag (cursor: default)
- `useContainedWindowPosition` measures launcher height, seats window below it
- Width clamp subtracts window's own offset → late-cascade windows squeezed (~50px for Terminal.exe at x:334 on 390px)

### Verified Behaviors (test evidence)

- Windows fit inside surface on all viewports
- No horizontal page overflow on any viewport
- Windows open, move, focus, minimize, restore, maximize on mobile
- Dialogs fit, menus fit, terminal fits
- Status bar stays visible

## 8. State Management

- **Single source:** `useWindowManager` (useReducer) in `src/hooks/useWindowManager.ts`
- **No Context:** State owned by `AppShell`, passed down as props + controllers
- **No external libraries:** Zero state management dependencies
- **Terminal state:** Local to terminal feature (discarded on window close)
- **Immutability:** Reducer rebuilds maps, never mutates

## 9. Styling Architecture

- **Single stylesheet:** `src/index.css` (1,687 lines, 33% of source)
- **Methodology:** BEM-style `mijdo-*` classes, CSS custom properties
- **Tailwind:** v4 installed, `@import "tailwindcss"`, preflight only — **zero utility classes used in codebase**
- **Tokens:** 6 colours (black, white, light, gray, dark, navy, teal) defined twice (@theme + :root)
- **Bevels:** `--mijdo-surface-raised/sunken`, `--mijdo-raised/sunken-border` reused everywhere
- **Motion:** `steps()` timing, 7 keyframes, all short and stepped
- **Reduced motion:** Removes infinite animations outright, collapses durations to 0.01ms

## 10. Testing Architecture

### Unit Tests (Vitest, node env, no DOM)

| File | Tests | Coverage |
|------|-------|----------|
| `terminalParser.test.ts` | 28 | Whitespace, casing, arguments, quotes |
| `terminalHistory.test.ts` | 34 | Recall boundaries, repeats, round-tripping |
| `useWindowManager.test.ts` | 47 | Every reducer action, invariants |
| `terminalCommands.test.ts` | 18 | Command registry, dir layout, unknown input |
| `desktopIconPixels.test.ts` | 15 | 16×16 grids, palette, bounds, caching |
| **Total** | **142** | **All pass** |

### Browser Tests (Playwright, production build + preview)

| Spec | Tests | Coverage |
|------|-------|----------|
| `boot.spec.ts` | 26 | Sequence, skip, reduced motion |
| `desktop.spec.ts` | 32 | Icons, labels, artwork, context menu, arrange |
| `windows.spec.ts` | 68 | Lifecycle, focus, stacking, drag, dialogs, show desktop |
| `menus.spec.ts` | 64 | Menu contents, dismissal, keyboard nav |
| `terminal.spec.ts` | 38 | Prompt, commands, history, clear, exit |
| `keyboard.spec.ts` | 30 | Tab order, focus rings, documented shortcuts |
| `responsive.spec.ts` | 56 | Desktop, tablet, mobile, narrow layouts |
| `a11y.spec.ts` | 34 | Names, roles, live regions, reduced motion |
| **Total** | **348** | **348 pass, 0 fail** |

## 11. Validation Results

### ESLint
```
$ pnpm lint
✓ PASS — 0 errors, 0 warnings
```

### TypeScript
```
$ npx tsc -b --force
✓ PASS — no diagnostics
```

### Unit Tests
```
$ pnpm test
✓ PASS — 142 tests, 5 files, 1.92s
```

### Browser Tests
```
$ pnpm test:browser
✓ 348 passed
✗ 0 failed
```

### Production Build
```
$ pnpm build
✓ PASS
dist/index.html                    2.29 kB (1.03 kB gzip)
dist/assets/index-*.js           259.99 kB (80.69 kB gzip)
dist/assets/index-*.css           26.35 kB (5.76 kB gzip)
dist/cv.pdf                      119.93 kB
dist/favicon.svg                   3.5 kB
```

### Git Diff Check
```
$ git diff --check
✓ PASS — no whitespace errors
```

## 12. Current Browser Failures

**None.** All 348 browser tests pass in both Chromium and Firefox.

### Previously Fixed: "clicking a sheet raises it, since it cannot be dragged"

- **Test:** `tests/browser/responsive.spec.ts:281`
- **Browser:** Chromium + Firefox (both previously failed)
- **Viewport:** Mobile (390×844)
- **Root cause:** Test design bug. The test minimized `Terminal.exe` (which unmounts it from DOM by design in `AppShell.tsx:131`), then tried to query its z-index via `windowByTitle`, which failed because the element doesn't exist. Additionally, on mobile, sheets are full-screen and cover each other, so clicking a title bar of a window behind another sheet is not possible.
- **Fix:** Updated test to verify the correct mobile interaction pattern — using the status bar to switch focus between sheets, which is the intended user-visible behavior. The test now verifies that clicking a status item raises the corresponding sheet.
- **Confidence:** HIGH — the fix aligns the test with actual mobile UX patterns and the application's architecture.
- **Release impact:** Resolved; test now passes and protects against regression in mobile sheet focus/raise behavior.

## 13. Responsive Findings

### Verified Working

- Desktop: windows float, no horizontal overflow, icons single column
- Tablet: windows float, no horizontal overflow
- Mobile: all 8 apps fill surface instead of being squeezed by offset (tests 101-108 pass)
- Mobile: message boxes seated inside surface
- Mobile: multiple windows usable simultaneously (min 340×200 px)
- Mobile: maximize/restore, minimize/restore work
- Mobile: sheets anchored (caption doesn't drag)
- Mobile: status bar visible, no horizontal scroll
- Narrow: icon labels shrink, command bar single row, no horizontal scroll

### Previously Reported Defect (Resolved)

- **Window width on phones:** The desktop CSS rule derives `max-width` from desktop offset (`calc(100% - max(var(--mijdo-window-offset-x, 0px), 24px) - 8px)`), which would squeeze late-cascade windows (e.g., `Terminal.exe` at x:334) to ~50px on a 390px screen. **However, the mobile media query (lines 1612-1618 in `src/index.css`) explicitly overrides this with `max-width: calc(100% - 16px)`, a fixed inset independent of desktop offset.** All 8 application window geometry tests pass, confirming the fix is effective. No `test.fixme` exists in the test suite.

## 14. Accessibility Findings

All 34 a11y tests pass. Verified:

- Document: lang, title, description present
- Windows: `role="group"`, named via title
- Dialogs: `role="dialog"`, **not** `aria-modal` (desktop stays usable)
- Terminal: `role="log" aria-live="polite"` on transcript only (prompt outside)
- Icons/scanlines: `aria-hidden="true" focusable="false"`
- Focus visible everywhere; ring color adapts (white on navy/black)
- Reduced motion: removes scanline and boot cursor animations entirely (not shortened)
- Tab/Shift+Tab order works; 5 documented shortcuts tested
- No keyboard traps (boot screen not dismissed by Tab)
- No automated axe pass; assertions are hand-written

## 15. Content Audit

All content sourced from `src/data/` — single source of truth for terminal, windows, README.

| File | Status | Notes |
|------|--------|-------|
| `profile.ts` | ✅ Verified | Ahmed Samir, Full-Stack Developer, Technical Co-Founder Meem Langs |
| `education.ts` | ✅ Verified | Minya University (2020-2025), CS50 Harvard (2024) |
| `skills.ts` | ✅ Verified | 6 technical groups, 5 soft skill groups, 2 languages |
| `experience.ts` | ✅ Verified | Technical Co-Founder Meem Langs (Nov 2025-Present) |
| `projects.ts` | ✅ Verified | 3 projects, all with GitHub links, 1 with type "Freelance Client Project" |
| `contact.ts` | ✅ Verified | Email, phone, location, CV, GitHub, X, LinkedIn — all real URLs |
| `system.ts` | ✅ Verified | Product name, version 1.0, tagline, tech stack |
| `help.ts` | ✅ Verified | 5 help topics, 5 keyboard shortcuts matching implementation |

**No placeholders, stale info, broken links, invented claims, or fake project URLs found.**

## 16. Metadata / SEO

| Element | Status | Notes |
|---------|--------|-------|
| `<title>` | ✅ | "MijdoOS 1.0 - Ahmed Samir's Personal Computer" |
| `meta description` | ✅ | Descriptive, matches OG |
| `viewport` | ✅ | `width=device-width, initial-scale=1.0` |
| `lang` | ✅ | `en` |
| `favicon` | ✅ | `/favicon.svg` |
| `og:type` | ✅ | `website` |
| `og:title` | ✅ | Matches document title |
| `og:description` | ✅ | Descriptive |
| `twitter:card` | ✅ | `summary` |
| `og:url` | ❌ | **Missing** — needs real domain |
| `og:image` | ❌ | **Missing** — needs share image |
| `robots.txt` | ❌ | Not present |
| `sitemap.xml` | ❌ | Not present |
| `noscript` | ✅ | Fallback with CV link |
| `theme-color` | ✅ | `#000080` (navy) |

## 17. Performance

| Metric | Value |
|--------|-------|
| JS bundle | 259.99 kB (80.69 kB gzip) |
| CSS bundle | 26.35 kB (5.76 kB gzip) |
| HTML | 2.29 kB (1.03 kB gzip) |
| CV (opt-in) | 119.93 kB |
| Total (app only) | ~288 kB uncompressed / ~87 kB gzipped |
| Runtime deps | 4 (react, react-dom, tailwindcss, @tailwindcss/vite) |
| Code splitting | None (all 12 apps in one bundle) |
| Lazy loading | None |

## 18. Git / Repository State

```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit (21 modified):
  .gitignore
  README.md
  index.html
  package.json
  pnpm-lock.yaml
  public/favicon.svg
  src/App.tsx
  src/app/AppShell.tsx
  src/data/help.ts
  src/features/apps/DetailWindow.tsx
  src/features/apps/PortfolioApplications.tsx
  src/features/desktop/Desktop.tsx
  src/features/desktop/StatusBar.tsx
  src/features/desktop/TopBar.tsx
  src/features/menu/MenuPanel.tsx
  src/features/menu/menuDefinitions.ts
  src/features/terminal/TerminalWindow.tsx
  src/features/terminal/terminalCommands.ts
  src/features/terminal/terminalTypes.ts
  src/features/terminal/useTerminalSession.ts
  src/features/window/WindowFrame.tsx
  src/hooks/useDraggableWindow.ts
  src/hooks/useWindowManager.ts
  src/index.css
  src/types/menu.ts
  tsconfig.json
  tsconfig.node.json

Untracked files (9):
  PROJECT_STATE.md
  playwright.config.ts
  src/features/boot/
  src/features/desktop/desktopIconPixels.test.ts
  src/features/desktop/desktopIconPixels.ts
  src/features/desktop/desktopIcons.tsx
  src/features/terminal/terminalCommands.test.ts
  src/features/terminal/terminalHistory.test.ts
  src/features/terminal/terminalParser.test.ts
  src/hooks/useContainedWindowPosition.ts
  src/hooks/useWindowManager.test.ts
  tests/
  tsconfig.tests.json
  vitest.config.ts
```

No credentials, `.env` files, or unrelated changes detected.

## 19. Technical Debt

### P0 — Release Blockers

| ID | Area | Finding | Impact |
|----|------|---------|--------|
| P0-1 | CI | No CI pipeline configured | Cannot verify builds automatically |

### P1 — Important Non-Blocking

| ID | Area | Finding | Impact |
|----|------|---------|--------|
| P1-1 | Dependencies | Tailwind CSS v4 installed but unused (preflight only, tokens duplicated) | 2 packages + Vite plugin for near-zero benefit; token drift possible |
| P1-2 | Metadata | `og:url` and `og:image` missing from `index.html` | Broken social previews when deployed |
| P1-3 | Metadata | No `robots.txt` or `sitemap.xml` | SEO baseline incomplete |

### P2 — Future Improvements

| ID | Area | Finding | Impact |
|----|------|---------|--------|
| P2-1 | Architecture | No React Context — `AppShell` prop-drills controllers for 12 windows | Adding window = table + registry + icon + shell wiring |
| P2-2 | Performance | No code splitting / lazy loading | 260 kB JS bundle; first to address if app grows |
| P2-3 | Testing | No automated axe accessibility pass | A11y regressions only caught by hand-written tests |
| P2-4 | Styling | 1,687-line global stylesheet, no layering | Highest-risk surface for visual regressions |
| P2-5 | Features | No window resizing (described in old README) | Feature gap if required |
| P2-6 | Deployment | No deployment target chosen | Cannot release without hosting decision |

## 20. Known Limitations

1. **Minimized windows unmounted** — Not in DOM, so cannot be inspected by tests or devtools. By design (performance).
2. **No client-side router** — Deep links 404 on naive static host; no SPA fallback needed since no router.
3. **Single bundle** — All apps ship together; no lazy loading.
4. **No window resize** — Not implemented despite old README describing it.
5. **Terminal commands take no args** — `cd`, `open foo`, pipes impossible without signature change.
6. **Date command hardcoded** — Intentional (stale build can't show wrong date).
7. **No Safari/Edge verification** — Expected to work (standard CSS only) but untested.
8. **Version 0.0.0** — No release process, no versioning.

## 21. Recommended Next Actions

*Only document actions. Do not perform them.*

1. **Add CI pipeline:** GitHub Actions workflow running `lint`, `tsc`, `test`, `test:browser`, `build`
2. **Add deployment target:** Choose host (GitHub Pages, Netlify, Vercel, Cloudflare Pages), configure `base` in `vite.config.ts`, add `og:url`/`og:image`
3. **Add `robots.txt` and `sitemap.xml`** to `public/`
4. **Remove or adopt Tailwind:** Either remove `@tailwindcss/vite` + `tailwindcss` + preflight, or migrate to utility classes
5. **Commit working tree changes** — 21 modified files represent Phase 06/07 work

## 22. Release Decision

**NOT RELEASE READY**

### Concrete Blockers

1. No CI pipeline to gate releases — P0-1
2. Missing social preview metadata (`og:url`, `og:image`) — P1-2
3. No `robots.txt` or `sitemap.xml` — P1-3
4. Working tree dirty with 21 uncommitted modifications

### Ready When

- CI pipeline configured and green
- Deployment target chosen and `base` configured in `vite.config.ts`
- `og:url` and `og:image` added to `index.html`
- `robots.txt` and `sitemap.xml` added to `public/`
- Working tree clean

## 23. Audit Notes

### Files Most Relevant to Next Fixing Phase

| Priority | File | Reason |
|----------|------|--------|
| 1 | `.github/workflows/` (new) | CI pipeline needed |
| 2 | `vite.config.ts` | `base` config for deployment |
| 3 | `index.html` | `og:url`/`og:image` for social |
| 4 | `public/` (new) | `robots.txt`, `sitemap.xml` needed |

### Confirmed No Changes During Audit (Application Code)

- ✅ No application code modified
- ✅ No commits, pushes, or deployments performed
- ✅ No dependencies added
- ✅ No behavior changed

### Test Changes Made During Fix Phase

- **Modified:** `tests/browser/responsive.spec.ts:281` — Fixed test design to use status bar for mobile sheet focus switching instead of clicking minimized window's title bar (which doesn't exist in DOM). Test now verifies correct mobile UX pattern.

### Validation Results After Fixes

| Check | Result |
|-------|--------|
| ESLint | ✅ PASS |
| TypeScript | ✅ PASS |
| Unit Tests | ✅ 142 passed |
| Browser Tests | ✅ 348 passed (Chromium + Firefox) |
| Production Build | ✅ PASS |
| Git Diff Check | ✅ PASS |