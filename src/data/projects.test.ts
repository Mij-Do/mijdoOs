import cvSource from "../../cv/cv.tex?raw";
import { describe, expect, it } from "vitest";
import { contact } from "./contact";
import { education } from "./education";
import { experience } from "./experience";
import { profile } from "./profile";
import { projects } from "./projects";
import { technicalSkills } from "./skills";

/*
  The link matrix the portfolio has to present. The URLs are written out here
  rather than read from the records, so a link that is edited, dropped or
  invented shows up as a failing test instead of quietly becoming the truth.
*/
const EXPECTED_LINKS: Record<string, { github: string; liveDemo?: string }> = {
  "Full-Stack Todo Application": {
    github: "https://github.com/Mij-Do/Full-Stack-To-Do-app-V6",
    liveDemo: "https://to-do-app-v6-eta.vercel.app/",
  },
  "Real Estate Listings Platform": {
    github: "https://github.com/Mij-Do/real-state-full-stack-project",
  },
  MijdoOS: {
    github: "https://github.com/Mij-Do/mijdoOs",
    liveDemo: "https://mijdo-os.vercel.app/",
  },
};

const REMOVED_DEMO = "https://real-state-full-stack-project.vercel.app/";

function expectedLinksFor(projectName: string) {
  const links = EXPECTED_LINKS[projectName];

  if (!links) throw new Error(`no expected links recorded for "${projectName}"`);

  return links;
}

describe("the project records", () => {
  it("holds exactly the projects the matrix describes", () => {
    expect(projects.map((project) => project.name)).toEqual(Object.keys(EXPECTED_LINKS));
  });

  it("presents exactly the verified links for every project", () => {
    for (const project of projects) {
      expect({ name: project.name, links: project.links }).toEqual({
        name: project.name,
        links: expectedLinksFor(project.name),
      });
    }
  });

  it("drops the Real Estate live demo instead of hiding it", () => {
    const serialized = JSON.stringify(projects);

    expect(serialized).not.toContain(REMOVED_DEMO);
    expect(
      projects.find((project) => project.name === "Real Estate Listings Platform")?.links,
    ).toEqual({ github: expectedLinksFor("Real Estate Listings Platform").github });
  });
});

/*
  The link policy the project owner confirmed, pinned as literals so a URL is
  never silently shortened, swapped or invented.
*/
describe("the confirmed link policy", () => {
  it("gives the Todo project the exact live-demo URL the owner confirmed", () => {
    const todo = projects.find((project) => project.name === "Full-Stack Todo Application");

    expect(todo?.links.liveDemo).toBe("https://to-do-app-v6-eta.vercel.app/");
  });

  it("gives the Real Estate project no live-demo property at all", () => {
    const realEstate = projects.find(
      (project) => project.name === "Real Estate Listings Platform",
    );

    expect(realEstate?.links).not.toHaveProperty("liveDemo");
  });

  it("keeps the verified MijdoOS live demo untouched", () => {
    const mijdo = projects.find((project) => project.name === "MijdoOS");

    expect(mijdo?.links.liveDemo).toBe("https://mijdo-os.vercel.app/");
  });
});

describe("the reference CV", () => {
  it("lists the verified link for every project", () => {
    for (const links of Object.values(EXPECTED_LINKS)) {
      expect(cvSource).toContain(links.github);
      if (links.liveDemo) expect(cvSource).toContain(links.liveDemo);
    }
  });

  it("carries the same links as the project records", () => {
    const hrefs = [...cvSource.matchAll(/\\href\{([^}]+)\}/g)].map((match) => match[1]);

    expect(hrefs).toContain(expectedLinksFor("Full-Stack Todo Application").liveDemo);
    expect(hrefs).toContain(expectedLinksFor("MijdoOS").liveDemo);
  });

  it("keeps the Real Estate live demo out of the CV", () => {
    expect(cvSource).not.toContain(REMOVED_DEMO);
  });
});

/*
  The portfolio data and the CV are two renderings of the same profile, and
  they have already drifted once (project bullets, education wording, the
  language level). Only fields that can be matched reliably are guarded here:
  exact names, dates, contact channels, skill items, responsibilities. Wording
  that LaTeX reflows or rephrases is deliberately not asserted, so the guard
  stays signal rather than a fragile parser.

  The CV escapes "&" and wraps lines, so containment is checked against a
  normalized copy: LaTeX "\&" becomes "&" and runs of whitespace collapse.
*/
const normalizedCv = cvSource.replace(/\\&/g, "&").replace(/\s+/g, " ");

describe("portfolio data against the reference CV", () => {
  it("carries every project name", () => {
    for (const project of projects) {
      expect(normalizedCv, `${project.name} should appear in the CV`).toContain(
        project.name,
      );
    }
  });

  it("carries every project date", () => {
    for (const project of projects) {
      if (!project.date) continue;

      expect(normalizedCv, `${project.date} should appear in the CV`).toContain(
        project.date,
      );
    }
  });

  it("carries every project technology", () => {
    for (const project of projects) {
      for (const technology of project.technologies) {
        expect(
          normalizedCv,
          `${project.name}: ${technology} should appear in the CV`,
        ).toContain(technology);
      }
    }
  });

  it("carries the contact channels", () => {
    expect(normalizedCv).toContain(contact.email);
    expect(normalizedCv).toContain(contact.phone);
    expect(normalizedCv).toContain(contact.github);
    expect(normalizedCv).toContain(contact.linkedIn);
  });

  it("carries the identity", () => {
    expect(normalizedCv).toContain(profile.name);
    expect(normalizedCv).toContain(profile.title);
    expect(normalizedCv).toContain(profile.location);
  });

  it("carries the experience record and every responsibility", () => {
    for (const record of experience) {
      expect(normalizedCv).toContain(record.role);
      expect(normalizedCv).toContain(record.company);
      expect(normalizedCv).toContain(record.description);

      for (const responsibility of record.responsibilities) {
        expect(normalizedCv, `responsibility should appear in the CV`).toContain(
          responsibility,
        );
      }
    }
  });

  it("carries every education institution and degree", () => {
    for (const record of education) {
      for (const field of [record.degree, record.location]) {
        expect(normalizedCv, `${field} should appear in the CV`).toContain(field);
      }
    }

    /* The CS50 entry is titled slightly differently in each surface. */
    expect(normalizedCv).toContain("CS50");
    expect(normalizedCv).toContain("Harvard University");
    expect(normalizedCv).toContain("Minya University");
  });

  it("carries every technical skill item", () => {
    for (const group of technicalSkills) {
      for (const item of group.items) {
        expect(
          normalizedCv,
          `${group.category}: ${item} should appear in the CV`,
        ).toContain(item);
      }
    }
  });

  it("carries every technical skill category heading", () => {
    for (const group of technicalSkills) {
      expect(
        normalizedCv,
        `${group.category} should appear in the CV`,
      ).toContain(group.category);
    }
  });

  it("carries the spoken-language level without pinning its punctuation", () => {
    expect(normalizedCv).toContain("Upper-Intermediate");
    expect(normalizedCv).toContain("Arabic");
    expect(normalizedCv).toContain("English");
  });
});
