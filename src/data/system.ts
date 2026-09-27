import { profile } from "./profile";

export type SystemInfo = {
  productName: string;
  tagline: string;
  version: string;
  platform: string;
  technology: string[];
};

/*
  The product identity. The developer name is deliberately absent: it comes
  from the profile so the person is described in exactly one place.
*/
export const systemInfo: SystemInfo = {
  productName: "MijdoOS",
  tagline: `${profile.name}'s Personal Computer`,
  version: "1.0",
  platform: "Browser-based operating system portfolio",
  technology: ["React", "TypeScript", "Vite", "Tailwind CSS"],
};
