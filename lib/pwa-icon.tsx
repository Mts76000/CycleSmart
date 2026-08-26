import { ImageResponse } from "next/og";

/**
 * Shared glyph generator for every app icon (favicon, apple-icon, PWA manifest icons).
 * `padding` leaves safe-zone margin for maskable icons, where OS shells crop/mask the image.
 */
export function generateIconResponse(px: number, padding = 0) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2563eb",
      }}
    >
      <span
        style={{
          display: "flex",
          width: px - padding * 2,
          height: px - padding * 2,
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: (px - padding * 2) * 0.6,
          fontWeight: 700,
        }}
      >
        S
      </span>
    </div>,
    { width: px, height: px },
  );
}
