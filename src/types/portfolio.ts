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
  date: string;
  type?: string;
  technologies: string[];
  description: string;
  features: string[];
  links: {
    github?: string;
    liveDemo?: string;
  };
};
