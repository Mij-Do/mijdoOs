import { contact, socialLinks } from "../../data/contact";
import { education } from "../../data/education";
import { experience } from "../../data/experience";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { technicalSkills } from "../../data/skills";
import type { WindowControllerProps } from "../../types/window";
import { DetailLinkRow } from "../apps/DetailWindow";
import { WindowFrame } from "../window/WindowFrame";

export function MijdoWindow(props: WindowControllerProps) {
  return (
    <WindowFrame {...props}>
      <div className="mijdo-profile-content">
        <div className="mijdo-profile-heading">
          <h1>{profile.name}</h1>
          <p>{profile.title}</p>
          <p>{profile.role}</p>
          <p>{profile.location}</p>
        </div>

        <section className="mijdo-profile-section">
          <h2>ABOUT THIS USER</h2>
          <p>{profile.summary}</p>
          <p>{profile.about}</p>
        </section>

        <section className="mijdo-profile-section">
          <h2>EXPERIENCE OVERVIEW</h2>
          {experience.map((record) => (
            <p key={record.company}>
              {record.role} at {record.company} - {record.description}.
            </p>
          ))}
          <p>See EXPERIENCE.EXE for documented responsibilities.</p>
        </section>

        <section className="mijdo-profile-section">
          <h2>EDUCATION</h2>
          {education.map((record) => (
            <p key={record.institution}>
              {record.institution} - {record.degree} ({record.period})
            </p>
          ))}
        </section>

        <section className="mijdo-profile-section">
          <h2>SKILLS OVERVIEW</h2>
          <p>{technicalSkills.map((group) => group.category).join(" / ")}</p>
          <p>See SKILLS.EXE for the full configuration.</p>
        </section>

        <section className="mijdo-profile-section">
          <h2>PROJECTS OVERVIEW</h2>
          {projects.map((project) => (
            <p key={project.name}>
              {project.name}
              {project.date ? ` (${project.date})` : ""}
            </p>
          ))}
          <p>See PROJECTS.EXE for documented project details.</p>
        </section>

        <section className="mijdo-profile-section">
          <h2>CONTACT</h2>
          <p>Email: {contact.email}</p>
          <p>Phone: {contact.phone}</p>
          <DetailLinkRow links={socialLinks} />
          <p>See CONTACT.EXE for full contact information.</p>
        </section>
      </div>
    </WindowFrame>
  );
}
