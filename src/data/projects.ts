import type { ProjectRecord } from "../types/portfolio";

/*
  Portfolio projects with their verified public repositories.
  A project only exposes a live demo once a deployed URL is confirmed,
  so the live demo field stays absent until then.
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
      "Server Components and Server Actions.",
      "Secure user authentication and route protection using Clerk.",
      "Database schemas designed using Prisma ORM with MongoDB.",
      "Prisma Studio and MongoDB Compass used for database visualization and record inspection.",
      "Responsive UI built with Tailwind CSS and TypeScript used for type safety.",
      "Git and GitHub used for version control.",
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
      "Full-stack real estate platform that allows users to list properties for sale or rent directly without brokers.",
    features: [
      "Admin moderation system with a pending review queue for new listings.",
      "Advanced search and filtering by property type, price range, and region.",
      "Admin dashboard for tracking live inventory.",
      "Ability to archive sold properties.",
      "Deployed on Vercel using a serverless Next.js architecture with MongoDB.",
    ],
    links: {
      github: "https://github.com/Mij-Do/real-state-full-stack-project",
    },
  },
  {
    name: "MijdoOS",
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS"],
    description:
      "MijdoOS is the current developer portfolio, designed as a fictional retro operating system rather than a traditional modern portfolio website.",
    features: [],
    links: {
      github: "https://github.com/Mij-Do/mijdoOs",
    },
  },
];
