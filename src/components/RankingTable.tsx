'use client';

import { Trophy, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PlayerValue {
    id: number;
    player_name: string;
    rank: number;
    total_points: number;
    points_k1: number;
    points_k2: number;
    points_k3: number;
    points_k4: number;
    points_k5: number;
    avg_total: number;
    avg_9: number;
    avg_18: number;
    siegequote_pct: number;
    avg_high_per_leg: number;
}

interface RankingTableProps {
    players: PlayerValue[];
    prevRankMap: Map<string, number>;
    activeTab: string;
}

export default function RankingTable({ players, prevRankMap, activeTab }: RankingTableProps) {
    return (
        <div className="dart-table-container" style={{
            background: "rgba(15, 23, 42, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 24,
            overflow: "hidden",
            backdropFilter: "blur(20px)"
        }}>
            <table className="dart-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ padding: "20px", textAlign: "center", width: 80 }}>Rang</th>
                        <th style={{ padding: "20px", textAlign: "left" }}>Spieler</th>
                        {activeTab === "overview" ? (
                            <th style={{ padding: "20px", textAlign: "right" }}>Gesamtpunkte</th>
                        ) : (
                            <th style={{ padding: "20px", textAlign: "right" }}>
                                {activeTab === "k1" && "∅ Average"}
                                {activeTab === "k2" && "∅ 9 Darts"}
                                {activeTab === "k3" && "∅ 18 Darts"}
                                {activeTab === "k4" && "Siegquote"}
                                {activeTab === "k5" && "HighScore/Leg"}
                            </th>
                        )}
                        <th style={{ padding: "20px", textAlign: "right", width: 50 }}></th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player) => {
                        const prevRank = prevRankMap.get(player.player_name);
                        const diff = prevRank ? prevRank - player.rank : 0;
                        const isTop3 = player.rank <= 3;

                        let displayValue: string | number = "";
                        if (activeTab === "overview") displayValue = player.total_points.toFixed(2);
                        else if (activeTab === "k1") displayValue = player.avg_total.toFixed(2);
                        else if (activeTab === "k2") displayValue = player.avg_9.toFixed(2);
                        else if (activeTab === "k3") displayValue = player.avg_18.toFixed(2);
                        else if (activeTab === "k4") displayValue = player.siegequote_pct.toFixed(1) + "%";
                        else if (activeTab === "k5") displayValue = player.avg_high_per_leg.toFixed(2);

                        return (
                            <tr key={player.id} style={{ borderTop: "1px solid rgba(255, 255, 255, 0.03)" }}>
                                <td style={{ padding: "16px 20px", textAlign: "center" }}>
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 4
                                    }}>
                                        <span style={{
                                            fontSize: isTop3 ? 20 : 16,
                                            fontWeight: 900,
                                            color: player.rank === 1 ? "#fbbf24" : player.rank === 2 ? "#94a3b8" : player.rank === 3 ? "#b45309" : "#475569"
                                        }}>
                                            #{player.rank}
                                        </span>
                                        {diff !== 0 && (
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                fontSize: 10,
                                                fontWeight: 800,
                                                color: diff > 0 ? "#10b981" : "#ef4444"
                                            }}>
                                                {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                {Math.abs(diff)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: "16px 20px" }}>
                                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>{player.player_name}</div>
                                    <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
                                        Lions Weyhausen
                                    </div>
                                </td>
                                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                    <span style={{
                                        fontSize: 18,
                                        fontWeight: 900,
                                        color: isTop3 ? "#fbbf24" : "#38bdf8"
                                    }}>
                                        {displayValue}
                                    </span>
                                </td>
                                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                    <Link href={`/history/${encodeURIComponent(player.player_name)}`} style={{ color: "#475569" }}>
                                        <ArrowRight size={20} />
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
