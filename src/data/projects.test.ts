import cvSource from "../../cv/cv.tex?raw";
import { describe, expect, it } from "vitest";
import { projects } from "./projects";

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
