/*
  Verified contact details.
  The CV at public/cv.pdf is the source for the name, email, phone and location.
*/
export const contact = {
  name: "Ahmed Samir",
  email: "ahmedmijdo2@gmail.com",
  phone: "+201146615338",
  location: "Qena-Nagaa Hamadi, Egypt",
  /*
    Resolved against the Vite base so the CV still resolves when the site is
    deployed under a sub-path instead of the domain root.
  */
  cvUrl: `${import.meta.env.BASE_URL}cv.pdf`,
  github: "https://github.com/Mij-Do",
  x: "https://x.com/Mij_do",
  linkedIn: "https://www.linkedin.com/in/ahmed-mijdo-samir/",
};

/*
  One place turns the verified profiles into link rows, so the Status Bar,
  the Contact window and the terminal never describe the same links twice.
  "badge" is the compact Status Bar form of the same link.
*/
export const socialLinks = [
  { label: "LINKEDIN", badge: "in", url: contact.linkedIn },
  { label: "X", badge: "X", url: contact.x },
  { label: "GITHUB", badge: "GH", url: contact.github },
];
