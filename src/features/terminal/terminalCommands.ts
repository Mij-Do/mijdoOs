import { contact, contactLinks } from "../../data/contact";
import { experience } from "../../data/experience";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { technicalSkills } from "../../data/skills";
import { systemInfo } from "../../data/system";
import { desktopApplications } from "../../data/windows";
import { formatProjectPeriod } from "../../utils/portfolio";
import type {
  TerminalCommand,
  TerminalCommandOutcome,
  TerminalOutputLine,
} from "./terminalTypes";

const NAME_COLUMN_WIDTH = 12;
const INDEX_WIDTH = 2;
const DETAIL_INDENT = "    ";

const heading = (text: string): TerminalOutputLine => ({ kind: "heading", text });

/*
  dir lists the same executables the desktop and the Run menu offer, so the
  command prompt and the rest of the system never describe different programs.
  The names are derived from the window registry rather than written out here,
  so a desktop application cannot exist without appearing in the listing.
*/
const DIR_NAME_WIDTH = 10;

function toDirectoryEntry(title: string): string {
  const extensionIndex = title.lastIndexOf(".");

  if (extensionIndex === -1) return title.toUpperCase();

  const name = title.slice(0, extensionIndex);
  const extension = title.slice(extensionIndex + 1);

  return `${name.toUpperCase().padEnd(DIR_NAME_WIDTH, " ")} ${extension.toUpperCase()}`;
}

const desktopCommandNames = desktopApplications.map((application) =>
  toDirectoryEntry(application.title),
);

function getCurrentDate() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function createHelpLines(): TerminalOutputLine[] {
  return [
    "Available commands:",
    "",
    ...terminalCommands.map(
      (command) =>
        command.name.padEnd(NAME_COLUMN_WIDTH, " ") + command.description,
    ),
    "",
    "Commands are not case sensitive.",
  ];
}

function createAboutLines(): TerminalOutputLine[] {
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

function createProjectLines(): TerminalOutputLine[] {
  const lines: TerminalOutputLine[] = [heading("PROJECTS"), ""];

  projects.forEach((project, index) => {
    const number = String(index + 1).padStart(INDEX_WIDTH, "0");

    lines.push(`${number}  ${project.name}`);

    const period = formatProjectPeriod(project);

    if (period) lines.push(`${DETAIL_INDENT}${period}`);
    if (project.links.github) lines.push(`${DETAIL_INDENT}${project.links.github}`);

    lines.push("");
  });

  return lines;
}

function createSkillLines(): TerminalOutputLine[] {
  return technicalSkills.flatMap((group) => [
    heading(group.category.toUpperCase()),
    ...group.items,
    "",
  ]);
}

function createExperienceLines(): TerminalOutputLine[] {
  const lines: TerminalOutputLine[] = [heading("EXPERIENCE"), ""];

  for (const record of experience) {
    lines.push(`${record.role} - ${record.company}`);
    lines.push(record.period);
    lines.push(record.description);
    lines.push("");
  }

  return lines;
}

function createContactLines(): TerminalOutputLine[] {
  return [
    heading("CONTACT"),
    "",
    contact.name,
    `Email: ${contact.email}`,
    `Phone: ${contact.phone}`,
    `Location: ${contact.location}`,
    "",
    ...contactLinks.map((link) => `${link.label}: ${link.url}`),
  ];
}

/*
  The GitHub command reuses the same project records as the Projects
  application, so a repository is never described in two places.
*/
function createGitHubLines(): TerminalOutputLine[] {
  const lines: TerminalOutputLine[] = [
    heading("GITHUB"),
    "",
    `Profile: ${contact.github}`,
    "",
    "Repositories:",
    "",
  ];

  for (const project of projects) {
    if (!project.links.github) continue;

    lines.push(`${DETAIL_INDENT}${project.name}`);
    lines.push(`${DETAIL_INDENT}${DETAIL_INDENT}${project.links.github}`);
    lines.push("");
  }

  return lines;
}

/*
  dir is here because it is the first thing anyone types into a command prompt.
  It reports the volume rather than pretending to touch the host file system.
*/
function createDirectoryLines(): TerminalOutputLine[] {
  const volume = systemInfo.productName.toUpperCase();
  const lines: TerminalOutputLine[] = [
    ` Volume in drive C is ${volume}`,
    ` Directory of C:\\MIJDO`,
    "",
  ];
  desktopCommandNames.forEach((name, index) => {
    const number = String(index + 1).padStart(INDEX_WIDTH, "0");
    const stamp = "07-27-26  09:14";
    const size = String(1024 * (32 - index * 3)).padStart(9, " ");

    lines.push(`${number}  ${stamp}  ${size}  ${name}`);
  });

  lines.push(
    "",
    `      ${desktopCommandNames.length} file(s)     4096 bytes free`,
    "",
  );

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
    name: "dir",
    description: "List the volume contents",
    execute: () => ({ lines: createDirectoryLines() }),
  },
  {
    name: "clear",
    description: "Clear terminal",
    aliases: ["cls"],
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
  const command = terminalCommands.find(
    (entry) => entry.name === name || entry.aliases?.includes(name),
  );

  if (!command) {
    return {
      lines: [
        { kind: "error", text: `Bad command or file name: ${name}` },
        'Type "help" for available commands.',
      ],
    };
  }

  return command.execute();
}
