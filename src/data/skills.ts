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
    category: "Backend & Databases",
    items: ["Node.js", "Express", "Prisma ORM", "MongoDB", "Strapi"],
  },
  {
    category: "Authentication & APIs",
    items: ["Clerk Authentication", "REST APIs", "Axios", "TanStack Query"],
  },
  {
    category: "Database Tools & Management",
    items: ["Prisma Studio", "MongoDB Compass"],
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
      "Guides small teams, organizes tasks, and works effectively within a team toward shared goals.",
    ],
  },
  {
    category: "Problem Solving & Adaptability",
    items: [
      "Breaks down complex challenges into practical solutions and quickly adapts to new tools and frameworks.",
    ],
  },
  {
    category: "Time Management & Consistency",
    items: [
      "Prioritizes tasks, meets deadlines, and maintains disciplined, reliable output over time.",
    ],
  },
  {
    category: "Communication",
    items: [
      "Clear and professional in both technical and non-technical contexts.",
    ],
  },
  {
    category: "Self-Learning",
    items: [
      "Continuously improves technical skills through independent study and hands-on projects.",
    ],
  },
];

export const spokenLanguages: SkillGroup[] = [
  { category: "Arabic", items: ["Native"] },
  { category: "English", items: ["B2 - Upper-Intermediate"] },
];
