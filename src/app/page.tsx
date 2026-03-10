import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SnapshotSelector from "@/components/SnapshotSelector";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getData(selectedWeek?: string, selectedId?: string) {
  let snapshot;

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

  return { snapshot, allSnapshots, vetoSet };
}

const TABS = [
  { id: "overview", label: "Übersicht" },
  { id: "k1", label: "K1" },
  { id: "k2", label: "K2" },
  { id: "k3", label: "K3" },
  { id: "k4", label: "K4" },
  { id: "k5", label: "K5" },
];

function rankStyle(rank: number): { color: string; bg: string } {
  if (rank <= 5) return { color: "var(--rank-top5)", bg: "var(--rank-top5-bg)" };
  if (rank <= 10) return { color: "var(--rank-6to10)", bg: "var(--rank-6to10-bg)" };
  return { color: "var(--text-muted)", bg: "transparent" };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedId = typeof params.id === 'string' ? params.id : undefined;
  const selectedWeek = typeof params.week === 'string' ? params.week : undefined;
  const activeTab = typeof params.tab === 'string' ? params.tab : "overview";

  const { snapshot, allSnapshots, vetoSet } = await getData(selectedWeek, selectedId);
  const allValues: any[] = snapshot?.values ?? [];

  const eligible = allValues.filter(v => !vetoSet.has(v.player_name));
  const top5 = eligible.slice(0, 5);

  const lastUpdated = snapshot?.timestamp
    ? new Date(snapshot.timestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ padding: "0 2px" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
          Ranking Dashboard
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
          Lions Weyhausen — Saison 2025/26
          {lastUpdated && <span style={{ marginLeft: 8, color: "var(--text-dim)" }}>· {lastUpdated}</span>}
        </p>
      </div>

      {/* Snapshot Selector */}
      <SnapshotSelector
        allSnapshots={allSnapshots}
        currentId={snapshot?.snapshot_id?.toString()}
      />

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
              {/* TOP 5 CARDS */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--rank-top5)" }}>
                    Top 5
                  </span>
                  <div style={{ height: 1, flex: 1, background: "var(--rank-top5-bg)" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                  {top5.map((p, i) => (
                    <Link key={p.id} href={`/history/${encodeURIComponent(p.player_name)}`} style={{ textDecoration: "none" }}>
                      <div className="card-hover" style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--rank-top5-bg)",
                        borderRadius: 12,
                        padding: "14px",
                        position: "relative",
                        overflow: "hidden"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--rank-top5)" }}>#{i + 1}</span>
                          {vetoSet.has(p.player_name) && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--amber)", background: "var(--amber-muted)", padding: "2px 6px", borderRadius: 4 }}>VETO</span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.player_name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 10 }}>{p.verein}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                          <span style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>
                            {p.total_points}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 600 }}>PKT</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* FULL RANKING TABLE */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    Gesamtranking
                  </span>
                  <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{allValues.length} Spieler</span>
                </div>
                <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg-card)" }}>
                  <table className="dart-table">
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}>#</th>
                        <th>Spieler</th>
                        <th style={{ textAlign: "right" }}>Pkt</th>
                        <th className="hide-mobile" style={{ textAlign: "right" }}>K1</th>
                        <th className="hide-mobile" style={{ textAlign: "right" }}>K2</th>
                        <th className="hide-mobile" style={{ textAlign: "right" }}>K3</th>
                        <th className="hide-mobile" style={{ textAlign: "right" }}>K4</th>
                        <th className="hide-mobile" style={{ textAlign: "right" }}>K5</th>
                        <th className="hide-mobile" style={{ textAlign: "right" }}>Avg</th>
                        <th className="hide-mobile" style={{ textAlign: "right" }}>Sieg%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allValues.map((p, i) => {
                        const rank = i + 1;
                        const rs = rankStyle(rank);
                        const isVeto = vetoSet.has(p.player_name);

                        return (
                          <tr key={p.id} style={{ opacity: isVeto ? 0.45 : 1, background: rs.bg }}>
                            <td>
                              <span style={{ fontSize: 13, fontWeight: 800, color: rs.color }}>
                                {rank}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                <Link href={`/history/${encodeURIComponent(p.player_name)}`} style={{
                                  textDecoration: "none",
                                  fontWeight: rank <= 10 ? 700 : 500,
                                  color: "var(--text)",
                                  fontSize: 13,
                                }}>
                                  {p.player_name}
                                </Link>
                                {/* Show Mannschaft on mobile (since column is hidden) */}
                                <span className="show-mobile-only" style={{ fontSize: 10, color: "var(--text-dim)" }}>
                                  {p.verein}
                                </span>
                              </div>
                              {isVeto && <span style={{ marginLeft: 6, fontSize: 9, color: "var(--amber)", background: "var(--amber-muted)", padding: "1px 4px", borderRadius: 3 }}>VETO</span>}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 800, color: rs.color, fontSize: 14 }}>{p.total_points}</td>
                            <td className="hide-mobile" style={{ textAlign: "right", color: p.points_k1 > 0 ? "var(--text)" : "var(--text-dim)", fontSize: 12 }}>{p.points_k1}</td>
                            <td className="hide-mobile" style={{ textAlign: "right", color: p.points_k2 > 0 ? "var(--text)" : "var(--text-dim)", fontSize: 12 }}>{p.points_k2}</td>
                            <td className="hide-mobile" style={{ textAlign: "right", color: p.points_k3 > 0 ? "var(--text)" : "var(--text-dim)", fontSize: 12 }}>{p.points_k3}</td>
                            <td className="hide-mobile" style={{ textAlign: "right", color: p.points_k4 > 0 ? "var(--text)" : "var(--text-dim)", fontSize: 12 }}>{p.points_k4}</td>
                            <td className="hide-mobile" style={{ textAlign: "right", color: p.points_k5 > 0 ? "var(--text)" : "var(--text-dim)", fontSize: 12 }}>{p.points_k5}</td>
                            <td className="hide-mobile" style={{ textAlign: "right", fontFamily: "monospace", color: "var(--text-muted)", fontSize: 12 }}>{p.avg_total.toFixed(1)}</td>
                            <td className="hide-mobile" style={{ textAlign: "right", color: "var(--text-muted)", fontSize: 12 }}>{p.siegequote_pct.toFixed(0)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeTab !== "overview" && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{
                  activeTab === "k1" ? "K1: Avg Total" :
                    activeTab === "k2" ? "K2: Avg 9-Dart" :
                      activeTab === "k3" ? "K3: Avg 18-Dart" :
                        activeTab === "k4" ? "K4: Siegquote" :
                          "K5: High-Scores"
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
                        const displayValue = activeTab === "k4" ? `${metricValue.toFixed(0)}%` : metricValue.toFixed(1);

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
            <div className="card" style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 10, fontSize: 11 }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "var(--rank-top5)", marginRight: 4, verticalAlign: "middle" }} /> Platz 1–5</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "var(--rank-6to10)", marginRight: 4, verticalAlign: "middle" }} /> Platz 6–10</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, fontSize: 11, color: "var(--text-muted)" }}>
                {[
                  { k: "K1 — Avg Total", desc: "<25=0, 25-29=1, 30-34=2, 35-39=3, 40-42=4, 42-44=5, 45-47=6, 47-49=7, 50-54=8, 55-59=9, ≥60=10" },
                  { k: "K2 — Avg 9-Dart", desc: "<25=0, 25-29=1, 30-34=2, 35-39=3, 40-42=4, 42-44=5, 45-47=6, 47-49=7, 50-54=8, 55-59=9, ≥60=10" },
                  { k: "K3 — Avg 18-Dart", desc: "<25=0, 25-29=1, 30-34=2, 35-39=3, 40-42=4, 42-44=5, 45-47=6, 47-49=7, 50-54=8, 55-59=9, ≥60=10" },
                  { k: "K4 — Siegquote", desc: "<10%=0, 10-19=1, 20-29=2, 30-39=3, 40-49=4, 50-59=5, 60-69=6, 70-79=7, 80-84=8, 85-89=9, ≥90%=10" },
                  { k: "K5 — High/Leg", desc: "<0.20=0, 0.4=1, 0.6=2, 0.8=3, 1.0=4, 1.2=5, 1.4=6, 1.6=7, 1.8=8, 2.0=9, >2.0=10" },
                ].map(({ k, desc }) => (
                  <div key={k}>
                    <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.4 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}
