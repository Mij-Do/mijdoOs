import type { ReactNode } from "react";
import type { LinkItem, ProjectRecord } from "../../types/portfolio";
import type { WindowControllerProps } from "../../types/window";
import { WindowFrame } from "../window/WindowFrame";

type DetailWindowProps = WindowControllerProps & {
  children: ReactNode;
};

export function DetailWindow(props: DetailWindowProps) {
  return (
    <WindowFrame {...props}>
      <div className="mijdo-detail-content">{props.children}</div>
    </WindowFrame>
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mijdo-detail-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function DetailList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mijdo-detail-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/*
  The one place a row of outbound links is rendered. Project links and the
  profile links both come in as LinkItem data, so the retro link styling and
  the new-tab behaviour cannot drift apart between windows.
*/
export function DetailLinkRow({ links }: { links: LinkItem[] }) {
  if (links.length === 0) return null;

  return (
    <p className="mijdo-detail-links">
      {links.map((link) => (
        <a href={link.url} key={link.label} target="_blank" rel="noopener noreferrer">
          [{link.label}]
        </a>
      ))}
    </p>
  );
}

/*
  Project links are optional, so missing entries are dropped before the row
  is rendered rather than producing an empty or broken link.
*/
export function DetailLinks({ links }: { links: ProjectRecord["links"] }) {
  const availableLinks: LinkItem[] = [
    { label: "GITHUB", url: links.github },
    { label: "LIVE DEMO", url: links.liveDemo },
  ].filter((link): link is LinkItem => Boolean(link.url));

  return <DetailLinkRow links={availableLinks} />;
}
