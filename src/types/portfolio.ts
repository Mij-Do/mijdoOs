/*
  A rendered outbound link. Social rows and project rows share this shape so
  every external link in the app is produced by one component.
*/
export type LinkItem = {
  label: string;
  url: string;
};

export type HelpTopic = {
  title: string;
  lines: string[];
};

export type KeyboardShortcut = {
  keys: string;
  action: string;
};

export type EducationRecord = {
  institution: string;
  period: string;
  degree: string;
  location: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type ExperienceRecord = {
  role: string;
  company: string;
  period: string;
  description: string;
  responsibilities: string[];
};

export type ProjectRecord = {
  name: string;
  /*
    Optional: a project only carries a date once its timeline is confirmed.
    MijdoOS is the current project and has no published date yet.
  */
  date?: string;
  type?: string;
  technologies: string[];
  description: string;
  features: string[];
  links: {
    github?: string;
    liveDemo?: string;
  };
};
