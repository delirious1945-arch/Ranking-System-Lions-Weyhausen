import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SnapshotSelector from "@/components/SnapshotSelector";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getData(selectedWeek?: string, selectedId?: string) {
  // If we have a specific ID, use it. Otherwise, if we have a week, get the latest for that week.
  // If nothing, get the absolute latest.

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

  // Get all snapshots for the week selector (history)
  const rawSnapshots = await prisma.snapshot.findMany({
    orderBy: { timestamp: "desc" },
    select: { snapshot_id: true, week_id: true, timestamp: true },
  });

  // Deduplicate: Keep only the latest snapshot per week
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

function pts(n: number, label: string) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{n}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Übersicht" },
  { id: "k1", label: "K1: Avg Total" },
  { id: "k2", label: "K2: Avg 9-Dart" },
  { id: "k3", label: "K3: Avg 18-Dart" },
  { id: "k4", label: "K4: Siegquote" },
  { id: "k5", label: "K5: High-Scores" },
];

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedId = typeof params.id === 'string' ? params.id : undefined;
  const selectedWeek = typeof params.week === 'string' ? params.week : undefined;
  const activeTab = typeof params.tab === 'string' ? params.tab : "overview";

  const { snapshot, allSnapshots, vetoSet } = await getData(selectedWeek, selectedId);
  const allValues: any[] = snapshot?.values ?? [];

  // For Top 5: exclude vetoed players
  const eligible = allValues.filter(v => !vetoSet.has(v.player_name));
  const top5 = eligible.slice(0, 5);

  const lastUpdated = snapshot?.timestamp
    ? new Date(snapshot.timestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Ranking Dashboard</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
            Lions Weyhausen — Saison 2025/26
            {lastUpdated && <span style={{ marginLeft: 12, color: "var(--text-dim)" }}>Stand: {lastUpdated}</span>}
          </p>
        </div>

        {/* Week / Version Selector */}
        <SnapshotSelector
          allSnapshots={allSnapshots}
          currentId={snapshot?.snapshot_id?.toString()}
        />
      </div>

      {allValues.length === 0 && (
        <div style={{
          padding: "20px",
          background: "var(--amber-muted)",
          border: "1px solid var(--amber)",
          borderRadius: 8,
          fontSize: 14,
          color: "var(--amber)",
          textAlign: "center"
        }}>
          ⚠ Keine Daten für diesen Zeitraum gefunden.
        </div>
      )}

      {allValues.length > 0 && (
        <>
          {/* CATEGORY TABS */}
          <nav style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
            {TABS.map(t => (
              <Link
                key={t.id}
                href={{ query: { ...params, tab: t.id } }}
                style={{
                  textDecoration: "none",
                  padding: "10px 16px",
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

          {activeTab === "overview" && (
            <>
              {/* TOP 5 CARDS */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    A-Team Nominierung
                  </span>
                  <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Top 5 Spieler</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 12 }}>
                  {top5.map((p, i) => (
                    <Link key={p.id} href={`/history/${encodeURIComponent(p.player_name)}`} style={{ textDecoration: "none" }}>
                      <div className="card-hover" style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        padding: "20px 24px",
                        position: "relative"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>#{i + 1}</span>
                          {vetoSet.has(p.player_name) && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--amber)", background: "var(--amber-muted)", padding: "2px 8px", borderRadius: 4 }}>VETO</span>
                          )}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.player_name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>{p.verein}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>
                            {p.total_points}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Punkte</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* FULL LEADERBOARD TABLE */}
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    Gesamtranking
                  </span>
                  <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{allValues.length} Spieler</span>
                </div>
                <div style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg-card)" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="dart-table">
                      <thead>
                        <tr>
                          <th style={{ width: 48 }}>#</th>
                          <th>Spieler</th>
                          <th>Verein</th>
                          <th style={{ textAlign: "center" }}>Kader</th>
                          <th style={{ textAlign: "right" }}>Gesamt</th>
                          <th style={{ textAlign: "right" }}>K1</th>
                          <th style={{ textAlign: "right" }}>K2</th>
                          <th style={{ textAlign: "right" }}>K3</th>
                          <th style={{ textAlign: "right" }}>K4</th>
                          <th style={{ textAlign: "right" }}>K5</th>
                          <th style={{ textAlign: "right" }}>Avg</th>
                          <th style={{ textAlign: "right" }}>Sieg%</th>
                          <th style={{ textAlign: "right" }}>Spiele</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allValues.map((p, i) => {
                          const isTop5 = i < 5 && !vetoSet.has(p.player_name);
                          const isVeto = vetoSet.has(p.player_name);
                          return (
                            <tr key={p.id} style={{ opacity: isVeto ? 0.45 : 1 }}>
                              <td><span style={{ fontSize: 14, fontWeight: 700, color: isTop5 ? "var(--accent)" : "var(--text-muted)" }}>#{i + 1}</span></td>
                              <td>
                                <Link href={`/history/${encodeURIComponent(p.player_name)}`} style={{ textDecoration: "none", fontWeight: 500, color: "var(--text)", fontSize: 14 }}>
                                  {p.player_name}
                                </Link>
                                {isVeto && <span style={{ marginLeft: 8, fontSize: 10, color: "var(--amber)", background: "var(--amber-muted)", padding: "1px 5px", borderRadius: 3 }}>VETO</span>}
                              </td>
                              <td style={{ fontSize: 14, color: "var(--text-muted)" }}>{p.verein}</td>
                              <td style={{ textAlign: "center" }}>
                                <span style={{
                                  fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                                  background: isTop5 ? "var(--accent-muted)" : "rgba(255,255,255,0.04)",
                                  color: isTop5 ? "var(--accent)" : "var(--text-muted)"
                                }}>
                                  {isTop5 ? 'A-Team' : 'B-Team'}
                                </span>
                              </td>
                              <td style={{ textAlign: "right", fontWeight: 700, color: isTop5 ? "var(--accent)" : "var(--text)" }}>{p.total_points}</td>
                              {[p.points_k1, p.points_k2, p.points_k3, p.points_k4, p.points_k5].map((v, ki) => (
                                <td key={ki} style={{ textAlign: "right", color: v > 0 ? "var(--text)" : "var(--text-dim)" }}>{v}</td>
                              ))}
                              <td style={{ textAlign: "right", fontFamily: "monospace", color: "var(--text-muted)" }}>{p.avg_total.toFixed(1)}</td>
                              <td style={{ textAlign: "right", color: "var(--text-muted)" }}>{p.siegequote_pct.toFixed(0)}%</td>
                              <td style={{ textAlign: "right", color: "var(--text-dim)" }}>{p.gespielte_single_spiele}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab !== "overview" && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{TABS.find(t => t.id === activeTab)?.label}</h3>
                <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
              </div>

              <div style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", background: "var(--bg-card)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table className="dart-table">
                    <thead>
                      <tr>
                        <th style={{ width: 48 }}>#</th>
                        <th>Spieler</th>
                        <th>Verein</th>
                        <th style={{ textAlign: "right" }}>Metrik</th>
                        <th style={{ textAlign: "right" }}>Punkte</th>
                        <th style={{ textAlign: "right" }}>Gesamt</th>
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
                                  activeTab === "k5" ? "avg_high_per_leg" : "";
                          // Sort by points, then by value
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
                                  activeTab === "k5" ? "avg_high_per_leg" : "";

                          const metricValue = p[valKey as keyof typeof p] as number;
                          const displayValue = activeTab === "k4" ? `${metricValue.toFixed(0)}%` : metricValue.toFixed(1);

                          return (
                            <tr key={p.id}>
                              <td><span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)" }}>#{i + 1}</span></td>
                              <td>{p.player_name}</td>
                              <td style={{ fontSize: 13, color: "var(--text-dim)" }}>{p.verein}</td>
                              <td style={{ textAlign: "right", fontWeight: 600 }}>{displayValue}</td>
                              <td style={{ textAlign: "right" }}>
                                <span style={{ padding: "3px 8px", borderRadius: 4, background: "var(--accent-muted)", color: "var(--accent)", fontWeight: 700 }}>
                                  {p[ptsKey] as number}
                                </span>
                              </td>
                              <td style={{ textAlign: "right", color: "var(--text-dim)" }}>{p.total_points}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Punkteschlüssel */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                Punkteschlüssel
              </span>
              <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
            </div>
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, fontSize: 12, color: "var(--text-muted)" }}>
                {[
                  { k: "K1 — Avg Total", desc: "<30=0, 30-39=1, 40-44=2, 45-49=3, 50-54=4, ≥55=5" },
                  { k: "K2 — Avg 9 Dart", desc: "<30=0, 30-39=1, 40-44=2, 45-49=3, 50-54=4, ≥55=5" },
                  { k: "K3 — Avg 18 Dart", desc: "<30=0, 30-39=1, 40-44=2, 45-49=3, 50-54=4, ≥55=5" },
                  { k: "K4 — Siegquote %", desc: "<10=0, 10-19=1, 20-49=2, 50-79=3, 80-89=4, ≥90=5" },
                  { k: "K5 — High Scores/Leg", desc: "0-0.4=1, 0.41-0.8=2, 0.81-1.2=3, 1.21-1.6=4, ≥1.61=5" },
                ].map(({ k, desc }) => (
                  <div key={k}>
                    <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 3, fontSize: 12 }}>{k}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{desc}</div>
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
