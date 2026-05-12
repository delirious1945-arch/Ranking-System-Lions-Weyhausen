import { prisma } from "@/lib/prisma";
import { Trophy, Star, Shield, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getNominatedPlayers() {
    const snapshot = await prisma.snapshot.findFirst({
        orderBy: { timestamp: "desc" },
        include: { values: { orderBy: { rank: "asc" } } }
    });
    
    // Exact list provided by user: Rank 1, 3, 4, 5, 6, 8
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
            padding: "40px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes cardAppear {
                    from { opacity: 0; transform: translateY(30px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .nomination-card {
                    animation: cardAppear 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    opacity: 0;
                }
            ` }} />

            <div style={{ textAlign: "center", marginBottom: "60px" }}>
                <div style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: 12, 
                    background: "rgba(56, 189, 248, 0.1)", 
                    padding: "8px 20px", 
                    borderRadius: "100px",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    color: "#38bdf8",
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 20
                }}>
                    <Trophy size={14} /> OFFIZIELLE NOMINIERUNG
                </div>
                <h1 style={{ fontSize: "72px", fontWeight: 950, margin: 0, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    DAS <span style={{ color: "#38bdf8" }}>A-TEAM</span>
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "18px", marginTop: 15, fontWeight: 500 }}>
                    SAISON 2025/26 • DIE QUALIFIZIERTEN
                </p>
            </div>

            {/* Grid Layout for better visibility */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
                gap: "24px", 
                width: "100%", 
                maxWidth: "1100px",
                marginBottom: "60px"
            }}>
                {players.map((player, index) => (
                    <div 
                        key={player.id} 
                        className="nomination-card"
                        style={{
                            animationDelay: `${index * 1.5}s`,
                            background: "rgba(15, 23, 42, 0.6)",
                            border: `1px solid ${player.rank === 1 ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: "32px",
                            padding: "40px",
                            textAlign: "center",
                            backdropFilter: "blur(20px)",
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {player.rank === 1 && (
                            <div style={{ position: "absolute", top: 20, right: 20, color: "#fbbf24" }}>
                                <Star fill="#fbbf24" size={24} />
                            </div>
                        )}
                        
                        <div style={{ 
                            fontSize: "64px", 
                            fontWeight: 900, 
                            color: "rgba(255,255,255,0.05)", 
                            position: "absolute", 
                            top: 10, 
                            left: 20,
                            fontStyle: "italic" 
                        }}>
                            #{player.rank}
                        </div>

                        <div style={{ 
                            width: "80px", 
                            height: "80px", 
                            background: player.rank === 1 ? "linear-gradient(45deg, #fbbf24, #f59e0b)" : "rgba(56, 189, 248, 0.1)", 
                            borderRadius: "24px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            margin: "0 auto 24px",
                            color: player.rank === 1 ? "#000" : "#38bdf8"
                        }}>
                            {player.rank === 1 ? <Trophy size={40} /> : <Users size={40} />}
                        </div>

                        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: 8, color: "#fff" }}>
                            {player.player_name}
                        </h2>
                        
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <div style={{ fontSize: "36px", fontWeight: 950, color: player.rank === 1 ? "#fbbf24" : "#38bdf8" }}>
                                {player.total_points.toFixed(2)}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", textAlign: "left", lineHeight: 1 }}>
                                Punkte<br/>Gesamt
                            </div>
                        </div>

                        <div style={{ 
                            marginTop: 24, 
                            paddingTop: 24, 
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            justifyContent: "center",
                            gap: 20,
                            fontSize: "13px",
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
                padding: "16px 32px",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                borderRadius: "16px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                border: "1px solid rgba(255,255,255,0.1)"
            }}>
                <ArrowLeft size={18} /> ZURÜCK ZUM DASHBOARD
            </Link>
        </div>
    );
}
