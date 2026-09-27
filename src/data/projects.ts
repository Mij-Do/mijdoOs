import type { ProjectRecord } from "../types/portfolio";

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
    links: {},
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
    links: {},
  },
  {
    name: "Personal Portfolio Website",
    date: "July 2025",
    technologies: ["React.js", "TypeScript", "Tailwind CSS"],
    description:
      "Responsive personal portfolio showcasing projects, skills, and contact information.",
    features: [
      "React.js component-based architecture.",
      "TypeScript for type safety.",
      "Tailwind CSS for styling.",
      "Interactive sections, animated transitions, and a project gallery.",
      "Hosted online and version controlled using Git and GitHub.",
    ],
    links: {},
  },
];
