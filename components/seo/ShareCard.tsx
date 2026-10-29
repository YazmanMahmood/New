/** Dark card with the eagle, a red rule and a headline. Shared with the product images. */
export function ShareCard({ logo, kicker, title, photo }: { logo: Buffer; kicker: string; title: string; photo?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A0A0A", color: "#fff" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={`data:image/png;base64,${logo.toString("base64")}`} width={124} height={50} alt="" />
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4 }}>ARTEMIS UAV</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 72, height: 6, background: "#D7263D", marginBottom: 32 }} />
          <span style={{ fontSize: 26, color: "#A3A3A3", letterSpacing: 2, textTransform: "uppercase" }}>{kicker}</span>
          <span style={{ fontSize: photo ? 64 : 76, fontWeight: 700, lineHeight: 1.05, marginTop: 16, letterSpacing: -2 }}>{title}</span>
        </div>
        <span style={{ fontSize: 24, color: "#A3A3A3" }}>artemisuav.com</span>
      </div>
      {photo && (
        <div style={{ width: 520, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#161616" }}>
          <img src={photo} width={520} height={630} style={{ objectFit: "cover" }} alt="" />
        </div>
      )}
    </div>
  );
}
