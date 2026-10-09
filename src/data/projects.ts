import type { ProjectRecord } from "../types/portfolio";

/*
  Portfolio projects, aligned with the reference CV (the canonical profile).
  Live demos appear only where an anonymous visitor can actually reach the
  URL: the Todo app's deployment protects every route with Clerk middleware,
  so it keeps no demo link until that changes.
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
      "Full-stack Todo application with secure authentication, validated forms, and persistent data storage.",
    features: [
      "Used Next.js App Router, Server Components, and Server Actions to handle data mutations and application workflows.",
      "Implemented authentication and route protection using Clerk to manage user sessions and protect application access.",
      "Designed database models using Prisma ORM with MongoDB for persistent data storage.",
      "Used Prisma Studio and MongoDB Compass to inspect records, manage data, and troubleshoot database issues.",
      "Built a responsive user interface with Tailwind CSS and maintained type safety using TypeScript.",
      "Managed source code and version control using Git and GitHub.",
    ],
    links: {
      github: "https://github.com/Mij-Do/Full-Stack-To-Do-app-V6",
    },
  },
  {
    name: "Real Estate Listings Platform",
    date: "July 2026",
    type: "Freelance Client Project",
    technologies: ["Next.js", "MongoDB", "Prisma"],
    description:
      "Full-stack real estate platform enabling property owners to list properties for sale or rent and connect directly with potential buyers or tenants.",
    features: [
      "Implemented an admin moderation workflow in which submitted listings require approval before publication.",
      "Built property search and filtering by type, price range, and location, alongside administrative tools for managing listings and archiving sold properties.",
      "Deployed the application on Vercel with MongoDB-backed data storage.",
    ],
    links: {
      github: "https://github.com/Mij-Do/real-state-full-stack-project",
      liveDemo: "https://real-state-full-stack-project.vercel.app/",
    },
  },
  {
    name: "MijdoOS",
    date: "September 2026",
    technologies: ["React 19", "TypeScript", "Vite", "CSS", "Vitest", "Playwright"],
    description:
      "Interactive developer portfolio built as a browser-based desktop environment with a retro operating-system interface.",
    features: [
      "Implemented a window management system supporting dragging, minimizing, maximizing, restoring, closing, and window focus management.",
      "Developed an interactive terminal with 13 commands for exploring profile information, projects, skills, experience, and contact details.",
      "Structured the application with React and TypeScript, using a centralized state-management reducer and reusable UI components.",
      "Added responsive layouts, keyboard navigation, accessible controls, and reduced-motion support.",
      "Implemented automated unit and browser tests using Vitest and Playwright to validate application behavior and user interactions.",
    ],
    links: {
      github: "https://github.com/Mij-Do/mijdoOs",
      liveDemo: "https://mijdo-os.vercel.app/",
    },
  },
];
