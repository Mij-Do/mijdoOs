import { helpTopics, keyboardShortcuts } from "../../data/help";
import { systemInfo } from "../../data/system";
import type { WindowControllerProps } from "../../types/window";
import { DetailSection, DetailWindow } from "./DetailWindow";

export function AboutApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      <div className="mijdo-about">
        <h1 className="mijdo-about-title">{systemInfo.productName}</h1>
        <p className="mijdo-about-tagline">{systemInfo.tagline}</p>
      </div>
      <DetailSection title="SYSTEM">
        <p>Version: {systemInfo.version}</p>
        <p>System: {systemInfo.system}</p>
        <p>Developer: {systemInfo.developer}</p>
      </DetailSection>
    </DetailWindow>
  );
}

export function SystemInfoApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      <DetailSection title="SYSTEM">
        <p>System: {systemInfo.system}</p>
        <p>Version: {systemInfo.version}</p>
        <p>Platform: {systemInfo.platform}</p>
        <p>Developer: {systemInfo.developer}</p>
      </DetailSection>
      <DetailSection title="TECHNOLOGY">
        {systemInfo.technology.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </DetailSection>
    </DetailWindow>
  );
}

export function HelpApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      {helpTopics.map((topic) => (
        <DetailSection title={topic.title} key={topic.title}>
          {topic.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </DetailSection>
      ))}
    </DetailWindow>
  );
}

export function ShortcutsApplication(props: WindowControllerProps) {
  return (
    <DetailWindow {...props}>
      <DetailSection title="KEYBOARD SHORTCUTS">
        {keyboardShortcuts.map((shortcut) => (
          <p className="mijdo-shortcut" key={shortcut.keys}>
            <span className="mijdo-shortcut-key">{shortcut.keys}</span>
            {shortcut.action}
          </p>
        ))}
      </DetailSection>
    </DetailWindow>
  );
}
