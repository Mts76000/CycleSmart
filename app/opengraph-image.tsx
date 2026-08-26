import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7f7",
        color: "#047857",
        fontSize: 64,
        fontWeight: 700,
      }}
    >
      CycleSmart
      <div style={{ fontSize: 28, fontWeight: 400, color: "#3f6c60", marginTop: 16 }}>
        Le meilleur moment pour lancer tes machines
      </div>
    </div>,
    { ...size },
  );
}
