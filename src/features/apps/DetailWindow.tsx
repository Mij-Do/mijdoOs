import type { ReactNode } from "react";
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
  return (
    <ul className="mijdo-detail-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

type DetailLinksProps = {
  links: {
    github?: string;
    liveDemo?: string;
  };
};

export function DetailLinks({ links }: DetailLinksProps) {
  const availableLinks = [
    { label: "GITHUB", url: links.github },
    { label: "LIVE DEMO", url: links.liveDemo },
  ].filter((link) => Boolean(link.url));

  if (availableLinks.length === 0) return null;

  return (
    <p className="mijdo-detail-links">
      {availableLinks.map((link) => (
        <a href={link.url} key={link.label} target="_blank" rel="noreferrer">
          [{link.label}]
        </a>
      ))}
    </p>
  );
}
