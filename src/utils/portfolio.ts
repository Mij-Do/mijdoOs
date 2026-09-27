import type { ProjectRecord } from "../types/portfolio";

/*
  A project's timeline line, e.g. "July 2026 - Freelance Client Project".
  Both fields are optional, so an unconfirmed timeline renders as an empty
  string rather than a dangling separator. The Projects window and the
  terminal share this so a project is never described two ways.
*/
export function formatProjectPeriod(project: ProjectRecord): string {
  return [project.date, project.type].filter(Boolean).join(" - ");
}
