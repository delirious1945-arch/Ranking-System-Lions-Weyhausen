import "./globals.css";
import Link from "next/link";
import UpdateSnapshotButton from "@/components/UpdateSnapshotButton";
import NavLinks from "@/components/NavLinks";
import NameGate from "@/components/NameGate";
import UserBadge from "@/components/UserBadge";

function getWeekId(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
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
      <body style={{ margin: 0, minHeight: "100vh", backgroundColor: "#0b0d11", color: "#f0f2f5", fontFamily: "Inter, sans-serif" }}>

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
                  <div style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <div style={{
                      position: "absolute",
                      width: 44, height: 44,
                      borderRadius: "50%",
                      background: "rgba(56, 189, 248, 0.08)",
                      filter: "blur(8px)",
                    }} />
                    <img src="/logo.png" alt="Lions Weyhausen Logo" style={{
                      width: 36, height: 36, objectFit: "contain", position: "relative", zIndex: 1,
                      filter: "drop-shadow(0 0 6px rgba(56, 189, 248, 0.3))",
                    }} />
                  </div>
                  <span className="hide-mobile" style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", letterSpacing: "-0.02em" }}>
                    DartRanking
                  </span>
                </Link>

                <NavLinks />
              </div>

              {/* Right side */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserBadge />
                <div className="hide-mobile" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  KW <code style={{ fontFamily: "monospace", color: "var(--text)", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{weekId}</code>
                </div>
                <UpdateSnapshotButton />
              </div>
            </div>
          </header>

          {/* Main */}
          <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
            {children}
          </main>
        </NameGate>

      </body>
    </html>
  );
}
