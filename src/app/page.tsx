import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, Users, Search } from "lucide-react";
import { cookies } from "next/headers";
import RankingTable from "@/components/RankingTable";
import SnapshotSelector from "@/components/SnapshotSelector";

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
    previousSnapshot = await prisma.snapshot.findFirst({
      where: {
        week_id: { notIn: [snapshot.week_id, "Saison 2025/26 - Final"] },
        timestamp: { lt: snapshot.timestamp }
      },
      orderBy: { timestamp: 'desc' },
      include: { values: true }
    });

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

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("lions-auth-role")?.value === "admin";

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

        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "40%",
          background: "linear-gradient(to bottom, rgba(8,11,18,0.9) 0%, transparent 100%)",
          zIndex: 1,
        }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100%", maxWidth: "100%" }}>
          <h1 style={{
            margin: "0 0 4px",
            fontSize: "clamp(24px, 8vw, 56px)",
            fontWeight: 900,
            letterSpacing: "0.02em",
            color: "#ffffff",
            lineHeight: 1.1,
            textTransform: "uppercase",
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
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
          }}>
            ABSCHLUSSRANKING - FINAL
          </p>

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
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            border: "2px solid #fff"
          }}>
            <Trophy size={24} />
            GROSSES SAISON-FINALE STARTEN
          </Link>
        </div>
      </div>

      {!isAdmin ? (
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
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
              {TABS.map((tab) => (
                <Link
                  key={tab.id}
                  href={`/?tab=${tab.id}${selectedWeek ? `&week=${selectedWeek}` : ""}${selectedId ? `&id=${selectedId}` : ""}`}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    color: activeTab === tab.id ? "#fff" : "#64748b",
                    background: activeTab === tab.id ? "rgba(56, 189, 248, 0.2)" : "transparent",
                    transition: "all 0.2s"
                  }}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <SnapshotSelector snapshots={allSnapshots} currentWeek={snapshot?.week_id} currentId={snapshot?.snapshot_id} />
          </div>

          <RankingTable players={allValues} prevRankMap={prevRankMap} activeTab={activeTab} />
        </>
      )}

    </div>
  );
}

