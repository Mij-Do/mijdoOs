import { contact } from "../data/contact";

/*
  Matches the mobile breakpoint in index.css, which the window hooks also ask,
  so the whole shell agrees on where the compact layout starts.
*/
const COMPACT_QUERY = "(max-width: 640px)";

export type LinkActivation = { preventDefault: () => void };

/*
  The CV is a static file, and a mobile browser will not open one in a new tab:
  the tap creates no tab, downloads nothing and navigates nowhere, so the link
  looks dead while target="_blank" links to ordinary pages keep working. The
  anchor still carries href and target="_blank" so the browser can open the
  resume for anyone who middle-clicks or copies it, but on the compact layout
  this handler cancels that navigation and follows the link in the current tab,
  which is the one way every mobile browser will display a PDF. Wide viewports
  return without touching the event, so they keep the new tab they always had.
*/
export function openCv(event?: LinkActivation): void {
  const isCompact =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(COMPACT_QUERY).matches;

  if (!isCompact) return;

  event?.preventDefault();
  window.location.assign(contact.cvUrl);
}
