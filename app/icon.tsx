import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Browser tab icon: the white eagle on the site's dark surface. Rendered at build time.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const logo = await readFile(join(process.cwd(), "public/images/logo-white.png"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", borderRadius: 12 }}>
        <img src={`data:image/png;base64,${logo.toString("base64")}`} width={56} height={23} alt="" />
      </div>
    ),
    size,
  );
}
