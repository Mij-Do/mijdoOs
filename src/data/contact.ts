import type { LinkItem } from "../types/portfolio";
import { profile } from "./profile";

export type Contact = {
  name: string;
  email: string;
  phone: string;
  location: string;
  /*
    Resolved against the Vite base so the CV still resolves when the site is
    deployed under a sub-path instead of the domain root.
  */
  cvUrl: string;
  /* The verified profile channels, labelled for display by socialLinks. */
  github: string;
  x: string;
  linkedIn: string;
};

export type SocialLink = LinkItem & {
  /* The compact form the status bar shows instead of the full label. */
  badge: string;
};

/*
  Verified contact details. The CV at public/cv.pdf is the source for the
  name, email, phone and location; identity itself is owned by the profile.
*/
export const contact: Contact = {
  name: profile.name,
  email: "ahmedmijdo2@gmail.com",
  phone: "+201146615338",
  location: profile.location,
  cvUrl: `${import.meta.env.BASE_URL}cv.pdf`,
  github: "https://github.com/Mij-Do",
  x: "https://x.com/Mij_do",
  linkedIn: "https://www.linkedin.com/in/ahmed-mijdo-samir/",
};

/*
  One place turns the verified profiles into link rows, so the status bar,
  the contact window and the terminal never describe the same links twice.
*/
export const socialLinks: SocialLink[] = [
  { label: "LINKEDIN", badge: "in", url: contact.linkedIn },
  { label: "X", badge: "X", url: contact.x },
  { label: "GITHUB", badge: "GH", url: contact.github },
];

/* Everything the contact window and the terminal offer as a way to reach out. */
export const contactLinks: LinkItem[] = [
  ...socialLinks,
  { label: "CV", url: contact.cvUrl },
];
