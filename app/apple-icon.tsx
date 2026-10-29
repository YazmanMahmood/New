import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Home-screen icon on iPhone and iPad. iOS rounds the corners itself, so the square stays square.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logo = await readFile(join(process.cwd(), "public/images/logo-white.png"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A" }}>
        <img src={`data:image/png;base64,${logo.toString("base64")}`} width={140} height={57} alt="" />
      </div>
    ),
    size,
  );
}
