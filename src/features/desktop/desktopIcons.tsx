/*
  Desktop icon renderer.

  The artwork itself lives in desktopIconPixels.ts, so this module only has the
  one component that paints it.
*/
import type { DesktopAppId } from "../../types/window";
import { desktopIconPixels, getDesktopIconRects } from "./desktopIconPixels";

export type DesktopIconArtProps = {
  applicationId: DesktopAppId;
};

export function DesktopIconArt({ applicationId }: DesktopIconArtProps) {
  const pixels = desktopIconPixels[applicationId];
  const rects = getDesktopIconRects(applicationId);

  /*
    The table above is complete, so this cannot normally be reached. It stays
    as a runtime guard: an icon that fails to draw is worse than a window with
    no artwork at all.
  */
  if (!pixels) return null;

  return (
    <svg
      className="mijdo-desktop-icon-art"
      viewBox={`0 0 ${pixels[0]?.length ?? 16} ${pixels.length}`}
      width={32}
      height={32}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      {rects.map((rect) => (
        <rect
          key={`${rect.y}-${rect.x}-${rect.width}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={1}
          fill={rect.fill}
        />
      ))}
    </svg>
  );
}
