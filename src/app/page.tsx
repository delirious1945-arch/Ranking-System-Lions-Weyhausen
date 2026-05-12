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

      {allValues.length > 0 && (
        <>
          {/* CATEGORY TABS */}
          <div className="tabs-scroll" style={{ borderBottom: "1px solid var(--border)" }}>
            <nav style={{ display: "flex", gap: 2 }}>
              {TABS.map(t => (
                <Link
                  key={t.id}
                  href={{ query: { ...params, tab: t.id } }}
                  style={{
                    textDecoration: "none",
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: activeTab === t.id ? "var(--accent)" : "var(--text-dim)",
                    borderBottom: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>

          {activeTab === "overview" && (
            <>
              {/* RANKINGS */}
              {/* Force new Vercel deploy */}
              {(() => {
                const teamA = eligible.slice(0, 6);
                // Team B gets the next 12 players (7 to 18) from the remaining list
                const teamB = allValues.filter(p => !teamA.some(a => a.id === p.id)).slice(0, 12);
                
                const RankingTable = ({ players, title, color, bg }: { players: any[], title: string, color: string, bg: string }) => (
                  <section style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: bg,
                        padding: "4px 12px",
                        borderRadius: 6,
                      }}>
                        <span style={{
                          display: "inline-block", width: 8, height: 8, borderRadius: 2,
                          background: color,
                        }} />
                        <span style={{
                          fontSize: 12, fontWeight: 800, textTransform: "uppercase",
                          letterSpacing: "0.08em", color: color,
                        }}>
                          {title}
                        </span>
                      </div>
                      <div style={{ height: 1, flex: 1, background: bg }} />
                      <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{players.length} Spieler</span>
                    </div>
                    <div style={{ borderRadius: 16, border: `1px solid ${bg}`, overflow: "hidden", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(10px)" }}>
                      <table className="dart-table">
                        <thead>
                          <tr>
                            <th style={{ width: 36, textAlign: "center" }}>#</th>
                            <th>Spieler</th>
                            <th style={{ textAlign: "right", width: 90 }}>Punkte</th>
                            <th className="hide-mobile" style={{ textAlign: "center", width: 180 }}>Verteilung (🎯 / 🏆 / 🔥)</th>
                            <th className="hide-mobile" style={{ textAlign: "right" }}>Siegquote</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map((p) => {
                            const isVeto = vetoSet.has(p.player_name);
                            // Visual Weight Calculation (relative contribution)
                            const k13_sum = (p.points_k1 + p.points_k2 + p.points_k3);
                            const k4_val = p.points_k4;
                            const k5_val = p.points_k5;
                            const total_points_sum = k13_sum + k4_val + k5_val || 1;

                            return (
                              <tr key={p.id} style={{ opacity: isVeto && title !== "Gesamtranking" ? 0.7 : 1 }}>
                                <td style={{ textAlign: "center" }}>
                                  <span style={{ fontSize: 15, fontWeight: 900, color: color, opacity: 0.8 }}>
                                    {p.rank}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <Link href={`/history/${encodeURIComponent(p.player_name)}`} style={{
                                        textDecoration: "none",
                                        fontWeight: 800,
                                        color: "#fff",
                                        fontSize: "14px",
                                      }}>
                                        {p.player_name}
                                      </Link>
                                      {isVeto && title !== "Gesamtranking" && <span style={{ fontSize: 9, color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", padding: "1px 6px", borderRadius: 4, fontWeight: 800, border: "1px solid rgba(245, 158, 11, 0.2)" }}>VETO</span>}
                                    </div>
                                    <div style={{ display: "flex", gap: 8, fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                                      <span>∅ {p.avg_total.toFixed(1)}</span>
                                      <span>•</span>
                                      <span>{p.wins} Siege</span>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <div style={{
                                    display: "inline-block",
                                    padding: "6px 12px",
                                    borderRadius: "10px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: `1px solid ${bg}`,
                                    color: color,
                                    fontWeight: 900,
                                    fontSize: "16px",
                                    boxShadow: `0 4px 12px ${bg}`
                                  }}>
                                    {p.total_points.toFixed(2)}
                                  </div>
                                </td>
                                <td className="hide-mobile" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                  <div style={{ 
                                    width: "140px", 
                                    height: "8px", 
                                    background: "rgba(255,255,255,0.05)", 
                                    borderRadius: "10px", 
                                    margin: "0 auto",
                                    display: "flex",
                                    overflow: "hidden",
                                    border: "1px solid rgba(255,255,255,0.05)"
                                  }}>
                                    <div style={{ width: `${(k13_sum / total_points_sum) * 100}%`, background: "#38bdf8", transition: "width 1s ease" }} title="Average Points" />
                                    <div style={{ width: `${(k4_val / total_points_sum) * 100}%`, background: "#fbbf24", transition: "width 1s ease" }} title="Win Rate Points" />
                                    <div style={{ width: `${(k5_val / total_points_sum) * 100}%`, background: "#f43f5e", transition: "width 1s ease" }} title="Highscore Points" />
                                  </div>
                                </td>
                                <td className="hide-mobile" style={{ textAlign: "right" }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "13px" }}>{p.siegequote_pct.toFixed(0)}%</span>
                                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>Quote</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                    <RankingTable players={allValues} title="Gesamtranking" color="var(--accent)" bg="var(--surface)" />
                    
                    <div style={{ display: "flex", gap: 20, flexDirection: "column" }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "10px 0 0 0" }}>Team-Aufstellung</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                        <RankingTable players={teamA} title="A-Team (Pl. 1-6)" color="var(--rank-top5)" bg="var(--rank-top5-bg)" />
                        <RankingTable players={teamB} title="B-Team (Pl. 7-18)" color="var(--rank-6to10)" bg="var(--rank-6to10-bg)" />
                      </div>
                    </div>
                  </div>
                );
              })()}

            </>
          )}

          {activeTab !== "overview" && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{
                  activeTab === "k1" ? "∅ Average" :
                    activeTab === "k2" ? "∅ 9 Darts" :
                      activeTab === "k3" ? "∅ 18 Darts" :
                        activeTab === "k4" ? "Siegquote" :
                          "Hohe Scores pro Leg"
                }</h3>
                <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
              </div>

              <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg-card)" }}>
                <table className="dart-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>#</th>
                      <th>Spieler</th>
                      <th style={{ textAlign: "right" }}>Wert</th>
                      <th style={{ textAlign: "right" }}>Pkt</th>
                      <th className="hide-mobile" style={{ textAlign: "right" }}>Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...allValues]
                      .sort((a, b) => {
                        const key = `points_${activeTab}` as keyof typeof a;
                        const valKey = activeTab === "k1" ? "avg_total" :
                          activeTab === "k2" ? "avg_9" :
                            activeTab === "k3" ? "avg_18" :
                              activeTab === "k4" ? "siegequote_pct" :
                                "avg_high_per_leg";
                        const pA = a[key] as number;
                        const pB = b[key] as number;
                        if (pB !== pA) return pB - pA;
                        return (b[valKey as keyof typeof b] as number) - (a[valKey as keyof typeof a] as number);
                      })
                      .map((p, i) => {
                        const ptsKey = `points_${activeTab}` as keyof typeof p;
                        const valKey = activeTab === "k1" ? "avg_total" :
                          activeTab === "k2" ? "avg_9" :
                            activeTab === "k3" ? "avg_18" :
                              activeTab === "k4" ? "siegequote_pct" :
                                "avg_high_per_leg";

                        const metricValue = p[valKey as keyof typeof p] as number;
                        const displayValue =
                          activeTab === "k4" ? `${metricValue.toFixed(0)}%` :
                            activeTab === "k5" ? metricValue.toFixed(2) :
                              metricValue.toFixed(1);

                        return (
                          <tr key={p.id}>
                            <td><span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>{i + 1}</span></td>
                            <td style={{ fontSize: 13 }}>{p.player_name}</td>
                            <td style={{ textAlign: "right", fontWeight: 600, fontSize: 13 }}>{displayValue}</td>
                            <td style={{ textAlign: "right" }}>
                              <span style={{ padding: "2px 7px", borderRadius: 4, background: "var(--accent-muted)", color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>
                                {p[ptsKey] as number}
                              </span>
                            </td>
                            <td className="hide-mobile" style={{ textAlign: "right", color: "var(--text-dim)", fontSize: 12 }}>{p.total_points}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Punkteschlüssel */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                Legende
              </span>
              <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
            </div>
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 24, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "var(--rank-top5)" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rank-top5)" }}>A-Team · 1. Kreisklasse (Platz 1–6)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "var(--rank-6to10)" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rank-6to10)" }}>B-Team · 2. Kreisklasse (Platz 7–19)</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "32px 24px" }}>
                {/* Tables for each category */}
                {[
                  {
                    title: "∅ Average | ∅ 9-Dart | ∅ 18-Dart",
                    desc: "Punkteverteilung basierend auf dem Durchschnitt",
                    steps: [
                      { range: "< 25.0", pts: 0 },
                      { range: "25.0 – 29.9", pts: 1 },
                      { range: "30.0 – 34.9", pts: 2 },
                      { range: "35.0 – 39.9", pts: 3 },
                      { range: "40.0 – 42.4", pts: 4 },
                      { range: "42.5 – 44.9", pts: 5 },
                      { range: "45.0 – 47.4", pts: 6 },
                      { range: "47.5 – 49.9", pts: 7 },
                      { range: "50.0 – 54.9", pts: 8 },
                      { range: "55.0 – 59.9", pts: 9 },
                      { range: "≥ 60.0", pts: 10 }
                    ]
                  },
                  {
                    title: "Siegquote (%)",
                    desc: "Anteil gewonnener Einzel-Matches",
                    steps: [
                      { range: "< 10.0%", pts: 0 },
                      { range: "10 – 19.9%", pts: 1 },
                      { range: "20 – 29.9%", pts: 2 },
                      { range: "30 – 39.9%", pts: 3 },
                      { range: "40 – 49.9%", pts: 4 },
                      { range: "50 – 59.9%", pts: 5 },
                      { range: "60 – 69.9%", pts: 6 },
                      { range: "70 – 79.9%", pts: 7 },
                      { range: "80 – 84.9%", pts: 8 },
                      { range: "85 – 89.9%", pts: 9 },
                      { range: "≥ 90.0%", pts: 10 }
                    ]
                  },
                  {
                    title: "Hohe Scores pro Leg (HighScore/Leg)",
                    desc: "Wurf-Zähler ≥ 80 pro gespieltem Leg",
                    steps: [
                      { range: "0.00 – 0.20", pts: 0 },
                      { range: "0.21 – 0.40", pts: 1 },
                      { range: "0.41 – 0.60", pts: 2 },
                      { range: "0.61 – 0.80", pts: 3 },
                      { range: "0.81 – 1.00", pts: 4 },
                      { range: "1.01 – 1.20", pts: 5 },
                      { range: "1.21 – 1.40", pts: 6 },
                      { range: "1.41 – 1.60", pts: 7 },
                      { range: "1.61 – 1.80", pts: 8 },
                      { range: "1.81 – 2.00", pts: 9 },
                      { range: "> 2.00", pts: 10 }
                    ]
                  }
                ].map((cat, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 800, color: "#38bdf8", fontSize: 13, marginBottom: 2 }}>{cat.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12 }}>{cat.desc}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 12px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                      {cat.steps.map((s, idx) => (
                        <div key={idx} style={{ display: 'contents' }}>
                          <span style={{ fontSize: 10, color: "var(--text)", fontFamily: 'monospace' }}>{s.range}</span>
                          <span style={{ fontSize: 10, fontWeight: 800, color: "#38bdf8", textAlign: 'right' }}>{s.pts} Pkt</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                💡 <strong>Berechnung:</strong> Die Gesamtpunktzahl ist die Summe der Punkte aus allen 5 Kategorien (gewichtet nach Einstellungen des Admins). Ein Spieler wird nur dann gelistet, wenn er in der entsprechenden Woche aktiv war.
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}
