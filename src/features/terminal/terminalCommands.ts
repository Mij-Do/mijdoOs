import { contact, socialLinks } from "../../data/contact";
import { experience } from "../../data/experience";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { technicalSkills } from "../../data/skills";
import { systemInfo } from "../../data/system";
import type { TerminalCommand, TerminalCommandOutcome } from "./terminalTypes";

const NAME_COLUMN_WIDTH = 12;
const INDEX_WIDTH = 2;
const DETAIL_INDENT = "    ";

function getCurrentDate() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function createHelpLines() {
  return [
    "Available commands:",
    "",
    ...terminalCommands.map(
      (command) =>
        command.name.padEnd(NAME_COLUMN_WIDTH, " ") + command.description,
    ),
  ];
}

function createAboutLines() {
  return [
    systemInfo.productName,
    systemInfo.tagline,
    "",
    `${systemInfo.platform} presenting the work, skills,`,
    `experience and projects of ${profile.name}.`,
    "",
    `Built with ${systemInfo.technology.join(", ")}.`,
  ];
}

function createProjectLines() {
  const lines = ["PROJECTS", ""];

  projects.forEach((project, index) => {
    const number = String(index + 1).padStart(INDEX_WIDTH, "0");

    lines.push(`${number}  ${project.name}`);

    const details = [project.date, project.type].filter(Boolean).join(" - ");

    if (details) lines.push(`${DETAIL_INDENT}${details}`);
    if (project.links.github) lines.push(`${DETAIL_INDENT}${project.links.github}`);

    lines.push("");
  });

  return lines;
}

function createSkillLines() {
  return technicalSkills.flatMap((group) => [
    group.category.toUpperCase(),
    ...group.items,
    "",
  ]);
}

function createExperienceLines() {
  const lines = ["EXPERIENCE", ""];

  for (const record of experience) {
    lines.push(`${record.role} - ${record.company}`);
    lines.push(record.period);
    lines.push(record.description);
    lines.push("");
  }

  return lines;
}

function createContactLines() {
  return [
    "CONTACT",
    "",
    contact.name,
    `Email: ${contact.email}`,
    `Phone: ${contact.phone}`,
    `Location: ${contact.location}`,
    "",
    ...socialLinks.map((link) => `${link.label}: ${link.url}`),
    `CV: ${contact.cvUrl}`,
  ];
}

/*
  The GitHub command reuses the same project records as the Projects
  application, so a repository is never described in two places.
*/
function createGitHubLines() {
  const lines = ["GITHUB", "", `Profile: ${contact.github}`, "", "Repositories:", ""];

  for (const project of projects) {
    if (!project.links.github) continue;

    lines.push(`${DETAIL_INDENT}${project.name}`);
    lines.push(`${DETAIL_INDENT}${DETAIL_INDENT}${project.links.github}`);
    lines.push("");
  }

  return lines;
}

export const terminalCommands: TerminalCommand[] = [
  {
    name: "help",
    description: "Show available commands",
    execute: () => ({ lines: createHelpLines() }),
  },
  {
    name: "whoami",
    description: "Display developer identity",
    execute: () => ({ lines: [profile.name, profile.title] }),
  },
  {
    name: "about",
    description: "Display information about MijdoOS",
    execute: () => ({ lines: createAboutLines() }),
  },
  {
    name: "projects",
    description: "List projects",
    execute: () => ({ lines: createProjectLines() }),
  },
  {
    name: "skills",
    description: "List technical skills",
    execute: () => ({ lines: createSkillLines() }),
  },
  {
    name: "experience",
    description: "Display experience",
    execute: () => ({ lines: createExperienceLines() }),
  },
  {
    name: "contact",
    description: "Display contact information",
    execute: () => ({ lines: createContactLines() }),
  },
  {
    name: "github",
    description: "Display GitHub profile and repositories",
    execute: () => ({ lines: createGitHubLines() }),
  },
  {
    name: "clear",
    description: "Clear terminal",
    execute: () => ({ lines: [], clear: true }),
  },
  {
    name: "date",
    description: "Display current date",
    execute: () => ({ lines: [getCurrentDate()] }),
  },
  {
    name: "version",
    description: "Display MijdoOS version",
    execute: () => ({
      lines: [`${systemInfo.productName} v${systemInfo.version}`],
    }),
  },
  {
    name: "exit",
    description: "Close terminal",
    execute: () => ({ lines: [], close: true }),
  },
];

export function executeCommand(name: string): TerminalCommandOutcome {
  const command = terminalCommands.find((entry) => entry.name === name);

  if (!command) {
    return {
      lines: [
        `Unknown command: ${name}`,
        'Type "help" for available commands.',
      ],
    };
  }

  return command.execute();
}
