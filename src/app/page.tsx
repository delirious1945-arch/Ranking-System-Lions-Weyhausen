// Final Build Trigger - Force Sync
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, Users } from "lucide-react";


interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getData(selectedWeek?: string, selectedId?: string) {
  let snapshot;
  let previousSnapshot;

  if (selectedId) {
    snapshot = await prisma.snapshot.findUnique({
      where: { snapshot_id: parseInt(selectedId) },
      include: { values: { orderBy: { rank: 'asc' } } }
    });
  } else if (selectedWeek) {
    snapshot = await prisma.snapshot.findFirst({
      where: { week_id: selectedWeek },
      orderBy: { timestamp: 'desc' },
      include: { values: { orderBy: { rank: 'asc' } } }
    });
  } else {
    snapshot = await prisma.snapshot.findFirst({
      orderBy: { timestamp: 'desc' },
      include: { values: { orderBy: { rank: 'asc' } } }
    });
  }

  if (snapshot) {
    // Try to find the latest snapshot of a DIFFERENT week_id
    previousSnapshot = await prisma.snapshot.findFirst({
      where: {
        week_id: { notIn: [snapshot.week_id, "Saison 2025/26 - Final"] },
        timestamp: { lt: snapshot.timestamp }
      },
      orderBy: { timestamp: 'desc' },
      include: { values: true }
    });

    // Fallback: If no different week found, just take any older snapshot
    if (!previousSnapshot) {
      previousSnapshot = await prisma.snapshot.findFirst({
        where: {
          snapshot_id: { not: snapshot.snapshot_id },
          week_id: { not: "Saison 2025/26 - Final" },
          timestamp: { lt: snapshot.timestamp }
        },
        orderBy: { timestamp: 'desc' },
        include: { values: true }
      });
    }
  }

  const rawSnapshots = await prisma.snapshot.findMany({
    orderBy: { timestamp: "desc" },
    select: { snapshot_id: true, week_id: true, timestamp: true },
  });

  const seenWeeks = new Set();
  const allSnapshots = rawSnapshots.filter((s) => {
    if (seenWeeks.has(s.week_id)) return false;
    seenWeeks.add(s.week_id);
    return true;
  });

  const vetos = await prisma.veto.findMany({ where: { active: true } });
  const vetoSet = new Set(vetos.map((v: any) => v.player_name));

  return { snapshot, previousSnapshot, allSnapshots, vetoSet };
}

const TABS = [
  { id: "overview", label: "Übersicht" },
  { id: "k1", label: "∅ Average" },
  { id: "k2", label: "∅ 9 Darts" },
  { id: "k3", label: "∅ 18 Darts" },
  { id: "k4", label: "Siegquote" },
  { id: "k5", label: "HighScore/Leg" },
];



export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedId = typeof params.id === 'string' ? params.id : undefined;
  const selectedWeek = typeof params.week === 'string' ? params.week : undefined;
  const activeTab = typeof params.tab === 'string' ? params.tab : "overview";

  const { snapshot, previousSnapshot, allSnapshots, vetoSet } = await getData(selectedWeek, selectedId);
  const allValues: any[] = snapshot?.values ?? [];
  const prevValues: any[] = previousSnapshot?.values ?? [];
  
  const prevRankMap = new Map(prevValues.map(v => [v.player_name, v.rank]));

  const eligible = allValues.filter(v => !vetoSet.has(v.player_name));

  const lastUpdated = snapshot?.timestamp
    ? new Date(snapshot.timestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Hero Banner */}
      <div style={{
        position: "relative",
        padding: "30px 16px 40px",
        borderRadius: 24,
        background: "#080b12",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        minHeight: 300,
        boxShadow: "0 20px 50px -10px rgba(0,0,0,0.8), inset 0 0 60px rgba(236, 72, 153, 0.15)",
        width: "100%",
        maxWidth: "100%",
      }}>
        {/* Dynamic Neon Background */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 40%",
          opacity: 0.9,
          filter: "contrast(1.2) brightness(0.9) saturate(1.2)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* Subtle top gradient for text readability */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to bottom, rgba(8,11,18,0.9) 0%, transparent 100%)",
          zIndex: 1,
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100%", maxWidth: "100%" }}>

          {/* Top Text */}
          <h1 style={{
            margin: "0 0 4px",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "clamp(24px, 8vw, 56px)",
            fontWeight: 900,
            letterSpacing: "0.02em",
            color: "#ffffff",
            lineHeight: 1.1,
            textTransform: "uppercase",
            textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.2)",
            wordBreak: "break-word",
            maxWidth: "100%"
          }}>
            SAISON 2025/26
          </h1>
          <p style={{
            margin: "4px 0 0",
            fontSize: "clamp(12px, 3.5vw, 14px)",
            color: "#e2e8f0",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            maxWidth: "100%",
            wordBreak: "break-word",
          }}>
            ABSCHLUSSRANKING - FINAL
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/season-reveal" style={{
              marginTop: 32,
              padding: "18px 48px",
              background: "linear-gradient(45deg, #fbbf24, #f59e0b)",
              color: "#000",
              textDecoration: "none",
              borderRadius: "18px",
              fontSize: "18px",
              fontWeight: 950,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 20px 40px -10px rgba(245, 158, 11, 0.6)",
              transition: "all 0.2s",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              border: "2px solid #fff"
            }}>
              <Trophy size={24} />
              GROSSES SAISON-FINALE STARTEN
            </Link>
          </div>

        </div>
      </div>

      {/* Highlights removed */}



      {allValues.length === 0 && (
        <div style={{
          padding: 16,
          background: "var(--amber-muted)",
          border: "1px solid var(--amber)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--amber)",
          textAlign: "center"
        }}>
          ⚠ Keine Daten für diesen Zeitraum.
        </div>
      )}

      {/* Spoiler Protection: Hide results during Finale */}
      <div style={{
        padding: "60px 20px",
        background: "rgba(15, 23, 42, 0.4)",
        border: "1px dashed rgba(56, 189, 248, 0.2)",
        borderRadius: 24,
        textAlign: "center",
        backdropFilter: "blur(10px)",
        marginTop: 20
      }}>
        <div style={{ 
          width: 60, 
          height: 60, 
          background: "rgba(56, 189, 248, 0.1)", 
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          margin: "0 auto 20px",
          color: "#38bdf8"
        }}>
          <Trophy size={32} />
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10, color: "#fff" }}>ERGEBNISSE GESPERRT</h3>
        <p style={{ color: "#94a3b8", maxWidth: 400, margin: "0 auto", fontSize: 14, lineHeight: 1.6 }}>
          Die finalen Platzierungen der Saison 2025/26 sind momentan unter Verschluss. 
          Starte das <strong>Saison-Finale</strong> oben, um die Rangliste live zu enthüllen!
        </p>
      </div>

    </div>
  );
}
