import { contact, socialLinks } from "../../data/contact";
import { education } from "../../data/education";
import { experience } from "../../data/experience";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import {
  softSkills,
  spokenLanguages,
  technicalSkills,
} from "../../data/skills";
import type { WindowControllerProps } from "../../types/window";
import { formatProjectPeriod } from "../../utils/portfolio";
import {
  DetailLinkRow,
  DetailLinks,
  DetailList,
  DetailSection,
  DetailWindow,
} from "./DetailWindow";

export function ProfileApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      <DetailSection title="IDENTITY">
        <p>{profile.name}</p>
        <p>{profile.title}</p>
        <p>{profile.role}</p>
        <p>{profile.location}</p>
      </DetailSection>
      <DetailSection title="SUMMARY">
        <p>{profile.summary}</p>
        <p>{profile.about}</p>
      </DetailSection>
    </DetailWindow>
  );
}

export function EducationApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      {education.map((record) => (
        <DetailSection title={record.institution} key={record.institution}>
          <p>{record.degree}</p>
          <p>{record.period}</p>
          <p>{record.location}</p>
        </DetailSection>
      ))}
    </DetailWindow>
  );
}

export function SkillsApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      <DetailSection title="TECHNICAL SKILLS">
        {technicalSkills.map((group) => (
          <div className="mijdo-detail-group" key={group.category}>
            <h3>{group.category}</h3>
            <p>{group.items.join(" / ")}</p>
          </div>
        ))}
      </DetailSection>
      <DetailSection title="SOFT SKILLS">
        {softSkills.map((group) => (
          <div className="mijdo-detail-group" key={group.category}>
            <h3>{group.category}</h3>
            <p>{group.items.join(" ")}</p>
          </div>
        ))}
      </DetailSection>
      <DetailSection title="LANGUAGES">
        {spokenLanguages.map((group) => (
          <p key={group.category}>
            {group.category}: {group.items.join(", ")}
          </p>
        ))}
      </DetailSection>
    </DetailWindow>
  );
}

export function ExperienceApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      {experience.map((record) => (
        <DetailSection
          title={`${record.role} - ${record.company}`}
          key={record.company}
        >
          <p>{record.period}</p>
          <p>{record.description}</p>
          <DetailList items={record.responsibilities} />
        </DetailSection>
      ))}
    </DetailWindow>
  );
}

export function ProjectsApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      {projects.map((project) => {
        /*
          A project without a confirmed timeline has no period line at all.
          Rendering the empty result would leave a blank gap above the
          technology line for every such project.
        */
        const period = formatProjectPeriod(project);

        return (
          <DetailSection title={project.name} key={project.name}>
            {period ? <p>{period}</p> : null}
            <p>TECH: {project.technologies.join(" / ")}</p>
            <p>{project.description}</p>
            <DetailList items={project.features} />
            <DetailLinks links={project.links} />
          </DetailSection>
        );
      })}
    </DetailWindow>
  );
}

export function ContactApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      <DetailSection title="CONTACT">
        <p>{contact.name}</p>
        <p>Email: {contact.email}</p>
        <p>Phone: {contact.phone}</p>
        <p>Location: {contact.location}</p>
      </DetailSection>
      <DetailSection title="PROFILES">
        <DetailLinkRow links={socialLinks} />
        {/*
          The CV keeps its own paragraph: folding it into the row above would
          move it onto the same line and give it the row's link styling, which
          is a visual change rather than a refactor.
        */}
        <p>
          <a href={contact.cvUrl} target="_blank" rel="noopener noreferrer">
            [CV]
          </a>
        </p>
      </DetailSection>
    </DetailWindow>
  );
}
