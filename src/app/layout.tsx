import "./globals.css";
import Link from "next/link";
import UpdateSnapshotButton from "@/components/UpdateSnapshotButton";
import NavLinks from "@/components/NavLinks";
import NameGate from "@/components/NameGate";
import UserBadge from "@/components/UserBadge";
import CookieBanner from "@/components/CookieBanner";

function getWeekId(): string {
  const now = new Date();
  const shifted = new Date(now);
  shifted.setDate(shifted.getDate() + 3);

  const d = new Date(Date.UTC(shifted.getFullYear(), shifted.getMonth(), shifted.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  const spieltag = weekNo + 3;
  return `Spieltag ${spieltag}`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const weekId = getWeekId();

  return (
    <html lang="de" className="dark">
      <head>
        <title>DartRanking — Lions Weyhausen</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, minHeight: "100vh", backgroundColor: "#0b0d11", color: "#f0f2f5", fontFamily: "Inter, sans-serif", position: "relative", overflow: "auto" }}>

        {/* Giant Watermark Logo — elegant background presence */}
        <div style={{
          position: "fixed",
          bottom: "-8%",
          right: "-5%",
          width: "45vmin",
          height: "45vmin",
          backgroundImage: "url(/logo.png)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.025,
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <NameGate>
          {/* Top Navigation */}
          <header style={{
            position: "sticky", top: 0, zIndex: 100,
            borderBottom: "1px solid var(--border)",
            background: "rgba(15,17,23,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}>
            <div style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 16px",
              height: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>

              {/* Logo + Nav */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
                  <img src="/logo.png" alt="Lions" style={{
                    width: 32, height: 32, objectFit: "contain",
                    filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.3))",
                  }} />
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <span className="hide-mobile" style={{ fontWeight: 900, fontSize: 15, color: "var(--text)", letterSpacing: "-0.02em" }}>
                      DartRanking
                    </span>
                    <span className="hide-mobile" style={{ fontSize: 9, color: "var(--text-dim)", fontWeight: 500, letterSpacing: "0.04em", marginTop: 1 }}>
                      LIONS WEYHAUSEN
                    </span>
                  </div>
                </Link>

                <NavLinks />
              </div>

              {/* Right side */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserBadge />
                <div className="hide-mobile" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Aktuell: <code style={{ fontFamily: "monospace", color: "var(--text)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{weekId}</code>
                </div>
                <UpdateSnapshotButton />
              </div>
            </div>
          </header>

          {/* Main */}
          <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", position: "relative", zIndex: 1 }}>
            {children}
          </main>

          {/* Footer */}
          <footer style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 40px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12, color: '#64748b' }}>
            <a href="/datenschutz" style={{ color: '#64748b', textDecoration: 'none' }}>Datenschutz</a>
            <a href="/impressum" style={{ color: '#64748b', textDecoration: 'none' }}>Impressum</a>
            <span>© {new Date().getFullYear()} SC Weyhausen</span>
          </footer>

          <CookieBanner />
        </NameGate>

      </body>
    </html>
  );
}
