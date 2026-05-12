import { prisma } from "@/lib/prisma";
import { Trophy, Star, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getNominatedPlayers() {
    const snapshot = await prisma.snapshot.findFirst({
        orderBy: { timestamp: "desc" },
        include: { values: { orderBy: { rank: "asc" } } }
    });
    
    // Ranks: 1, 3, 4, 5, 6, 8
    const selectedRanks = [1, 3, 4, 5, 6, 8];
    return snapshot?.values.filter(v => selectedRanks.includes(v.rank)) || [];
}

export default async function NominationPage() {
    const players = await getNominatedPlayers();

    return (
        <div style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#fff",
            fontFamily: "var(--font-inter), sans-serif",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center" // Center content vertically
        }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes cardAppear {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .nomination-card {
                    animation: cardAppear 0.5s ease-out forwards;
                    opacity: 0;
                }
            ` }} />

            {/* Header Area - Much smaller */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <div style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: 8, 
                    background: "rgba(56, 189, 248, 0.1)", 
                    padding: "4px 12px", 
                    borderRadius: "100px",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    color: "#38bdf8",
                    fontSize: "10px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 10
                }}>
                    <Trophy size={12} /> OFFIZIELLE NOMINIERUNG
                </div>
                <h1 style={{ fontSize: "42px", fontWeight: 950, margin: 0, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    DAS <span style={{ color: "#38bdf8" }}>A-TEAM</span>
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: 5, fontWeight: 500 }}>
                    SAISON 2025/26 • DIE TOP QUALIFIZIERTEN
                </p>
            </div>

            {/* Compact Grid Layout */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(3, 1fr)", // Force 3 columns
                gap: "16px", 
                width: "100%", 
                maxWidth: "1000px",
                marginBottom: "30px"
            }}>
                {players.map((player, index) => (
                    <div 
                        key={player.id} 
                        className="nomination-card"
                        style={{
                            animationDelay: `${index * 5}s`,
                            background: "rgba(15, 23, 42, 0.6)",
                            border: `1px solid ${player.rank === 1 ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: "20px",
                            padding: "20px",
                            textAlign: "center",
                            backdropFilter: "blur(20px)",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: player.rank === 1 ? "0 10px 30px -10px rgba(251, 191, 36, 0.3)" : "none"
                        }}
                    >
                        {player.rank === 1 && (
                            <div style={{ position: "absolute", top: 12, right: 12, color: "#fbbf24" }}>
                                <Star fill="#fbbf24" size={16} />
                            </div>
                        )}
                        
                        <div style={{ 
                            fontSize: "32px", 
                            fontWeight: 900, 
                            color: "rgba(255,255,255,0.03)", 
                            position: "absolute", 
                            top: 5, 
                            left: 12,
                            fontStyle: "italic" 
                        }}>
                            #{player.rank}
                        </div>

                        <div style={{ 
                            width: "48px", 
                            height: "48px", 
                            background: player.rank === 1 ? "linear-gradient(45deg, #fbbf24, #f59e0b)" : "rgba(56, 189, 248, 0.1)", 
                            borderRadius: "14px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            margin: "0 auto 12px",
                            color: player.rank === 1 ? "#000" : "#38bdf8"
                        }}>
                            {player.rank === 1 ? <Trophy size={24} /> : <Users size={24} />}
                        </div>

                        <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: 4, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {player.player_name}
                        </h2>
                        
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <div style={{ fontSize: "24px", fontWeight: 950, color: player.rank === 1 ? "#fbbf24" : "#38bdf8" }}>
                                {player.total_points.toFixed(2)}
                            </div>
                            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", textAlign: "left", lineHeight: 1 }}>
                                Pkt
                            </div>
                        </div>

                        <div style={{ 
                            marginTop: 12, 
                            paddingTop: 12, 
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            justifyContent: "center",
                            gap: 12,
                            fontSize: "11px",
                            color: "#94a3b8",
                            fontWeight: 600
                        }}>
                            <div>AVG: <span style={{ color: "#fff" }}>{player.avg_total.toFixed(1)}</span></div>
                            <div>SIEGE: <span style={{ color: "#fff" }}>{player.wins}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            <Link href="/" style={{
                textDecoration: "none",
                padding: "10px 20px",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid rgba(255,255,255,0.1)"
            }}>
                <ArrowLeft size={14} /> DASHBOARD
            </Link>
        </div>
    );
}
