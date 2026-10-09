import type { SkillGroup } from "../types/portfolio";

export const technicalSkills: SkillGroup[] = [
  {
    category: "Languages",
    items: ["HTML", "CSS", "JavaScript", "TypeScript", "Sass"],
  },
  {
    category: "Frontend Frameworks & Libraries",
    items: ["React.js", "Next.js", "Redux", "Bootstrap", "Tailwind CSS"],
  },
  {
    category: "Backend Development",
    items: ["Node.js", "NestJS", "Express.js", "REST APIs"],
  },
  {
    category: "Databases & ORMs",
    items: ["MongoDB", "PostgreSQL", "Prisma ORM"],
  },
  {
    category: "Authentication & Data Fetching",
    items: ["Clerk", "Axios", "TanStack Query"],
  },
  {
    category: "Database Tools",
    items: ["Prisma Studio", "MongoDB Compass"],
  },
  {
    category: "Testing",
    items: ["Vitest", "Playwright"],
  },
  {
    category: "Developer Tools & OS",
    items: ["VS Code", "Git", "GitHub", "Linux (Ubuntu)"],
  },
];

export const softSkills: SkillGroup[] = [
  {
    category: "Leadership & Collaboration",
    items: [
      "Coordinates tasks, supports collaborative workflows, and works toward shared team goals.",
    ],
  },
  {
    category: "Problem Solving & Adaptability",
    items: [
      "Breaks down technical challenges into practical solutions and adapts to new tools and technologies.",
    ],
  },
  {
    category: "Time Management & Consistency",
    items: [
      "Prioritizes tasks and maintains consistent progress across learning and development projects.",
    ],
  },
  {
    category: "Communication",
    items: [
      "Communicates technical concepts and project requirements clearly in technical and non-technical contexts.",
    ],
  },
  {
    category: "Self-Learning",
    items: [
      "Continuously develops technical skills through structured learning and hands-on implementation.",
    ],
  },
];

export const spokenLanguages: SkillGroup[] = [
  { category: "Arabic", items: ["Native"] },
  { category: "English", items: ["B2 - Upper-Intermediate"] },
];
