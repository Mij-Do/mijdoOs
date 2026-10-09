import type { ProjectRecord } from "../types/portfolio";

/*
  Portfolio projects with verified public repositories.
  A project only exposes a live demo once an anonymous visitor can actually
  reach it: the URL must answer successfully without signing in. The Todo
  app's deployment protects every route with Clerk middleware, so it keeps
  no demo link until that changes.
*/
export const projects: ProjectRecord[] = [
  {
    name: "Full-Stack Todo Application",
    date: "July 2026",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Prisma",
      "MongoDB",
      "Clerk",
    ],
    description:
      "Feature-rich full-stack Todo application using the Next.js App Router.",
    features: [
      "Server Components and Server Actions for data reads and mutations.",
      "Secure authentication with Clerk, including middleware-based route protection for every non-public route.",
      "Centralized Zod schemas with react-hook-form for validated todo forms.",
      "Optimistic UI updates via React's useOptimistic, with rollback when a mutation fails.",
      "Prisma ORM backed by MongoDB, modelling todos with completion state and per-user ownership.",
      "Vitest and React Testing Library unit tests covering the validation schemas and the todo table.",
    ],
    links: {
      github: "https://github.com/Mij-Do/Full-Stack-To-Do-app-V6",
    },
  },
  {
    name: "Real Estate Listings Platform",
    date: "July 2026",
    type: "Freelance Client Project",
    technologies: [
      "Next.js",
      "TypeScript",
      "MongoDB",
      "Prisma",
      "Tailwind CSS",
      "Cloudinary",
    ],
    description:
      "Full-stack platform where property owners list homes for sale or rent directly, with admin approval required before a listing goes public.",
    features: [
      "Broker-free listings: owners publish properties for sale or rent and buyers contact them directly.",
      "Moderation queue: new listings start as pending and stay hidden until an admin approves them.",
      "Admin dashboard to approve, decline and track live inventory, with an archive for sold properties.",
      "Search and filtering by property type, price range and region.",
      "Phone and WhatsApp call-to-action buttons on every listing for direct seller contact.",
      "Image uploads through Cloudinary; serverless Next.js deployment on Vercel backed by MongoDB via Prisma.",
    ],
    links: {
      github: "https://github.com/Mij-Do/real-state-full-stack-project",
      liveDemo: "https://real-state-full-stack-project.vercel.app/",
    },
  },
  {
    name: "MijdoOS",
    date: "2026",
    technologies: ["React", "TypeScript", "Vite", "Vitest", "Playwright"],
    description:
      "MijdoOS is the current developer portfolio: a browser-based retro operating system with a boot sequence, a desktop, draggable windows and a working terminal.",
    features: [
      "Window manager on a single useReducer: open, close, minimize, maximize, drag, and z-order focus, with no router or state library.",
      "Terminal emulator with a hand-written parser, 13 commands and scrollback history, answering from the same typed data the windows render.",
      "Eight desktop icons drawn from 16x16 pixel maps as merged SVG rectangles, with no image assets.",
      "Accessibility throughout: ARIA roles and live regions, visible focus everywhere, full keyboard operation and reduced-motion support.",
      "Responsive layouts for desktop, tablet and phone, shipping as a static build of about 87 kB gzipped.",
      "142 Vitest unit tests plus 348 Playwright runs across Chromium and Firefox.",
    ],
    links: {
      github: "https://github.com/Mij-Do/mijdoOs",
      liveDemo: "https://mijdo-os.vercel.app/",
    },
  },
];
