import { prisma } from "@/lib/prisma";
import { Trophy, ArrowLeft, Users, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Map for attendance data provided by user
const attendanceMap: Record<string, string> = {
    "Sebastian Kirste": "100%",
    "Timo Feuerhahn": "50,0%",
    "Jens Goltermann": "100%",
    "Erik Schremmer": "37,5%",
    "Nicholas Stedman": "93,8%",
    "Kevin Emde": "68,8%",
    "Maik Feuerhahn": "37,5%",
    "Dirk Ostermann": "87,5%",
    "Jannik Baier": "43,8%",
    "Michael Kranz": "81,3%",
    "André Rathje": "93,8%",
    "Michael Gehrt": "87,5%",
    "Karen Schulz": "50,0%",
    "Jochen Michael": "100%",
    "Joachim Koch": "31,3%",
    "Martin Wolnik": "31,3%",
    "Malte Wolnik": "18,8%",
    "Karsten Kohnert": "31,3%",
    "Uwe Kohnert": "0%"
};

async function getPlayers() {
    const snapshot = await prisma.snapshot.findFirst({
        orderBy: { timestamp: "desc" },
        include: { values: { orderBy: { rank: "asc" } } } // Keep natural order for layout
    });
    return snapshot?.values || [];
}

export default async function SeasonRevealPage() {
    const allPlayers = await getPlayers();
    
    // Reverse the players for the delay calculation but keep the layout order
    const totalPlayers = allPlayers.length;

    return (
        <div style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#fff",
            fontFamily: "var(--font-inter), sans-serif",
            overflowX: "hidden",
            position: "relative",
            padding: "80px 20px"
        }}>
            {/* Background Effect */}
            <div style={{
                position: "fixed",
                inset: 0,
                backgroundImage: "url(/nomination-bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.1,
                zIndex: 0
            }} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes rowPop {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
                }
                @keyframes glowText {
                    0%, 100% { text-shadow: 0 0 10px rgba(56, 189, 248, 0.3); }
                    50% { text-shadow: 0 0 30px rgba(56, 189, 248, 0.6); }
                }
                .reveal-row {
                    opacity: 0;
                    animation: rowPop 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .active-reveal {
                    border-color: #38bdf8 !important;
                    background: rgba(56, 189, 248, 0.1) !important;
                }
            ` }} />

            <div style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "60px" }}>
                    <div style={{ 
                        color: "#fbbf24", 
                        fontSize: "12px", 
                        fontWeight: 900, 
                        letterSpacing: "0.4em", 
                        textTransform: "uppercase",
                        marginBottom: "10px"
                    }}>
                        Abschluss-Ranking
                    </div>
                    <h1 style={{ 
                        fontSize: "clamp(32px, 8vw, 72px)", 
                        fontWeight: 950, 
                        margin: 0,
                        lineHeight: 1,
                        animation: "glowText 3s infinite"
                    }}>
                        SAISON 2025/26
                    </h1>
                </div>

                {/* Grid container for the ladder effect */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {allPlayers.map((player) => {
                        const isTop3 = player.rank <= 3;
                        // Calculation for the "Bottom-Up" reveal:
                        // Player with rank 19 should have delay 0
                        // Player with rank 1 should have delay (18 * 5s)
                        const delay = (totalPlayers - player.rank) * 5;
                        
                        return (
                            <div 
                                key={player.id}
                                className="reveal-row"
                                style={{
                                    animationDelay: `${delay}s`,
                                    background: isTop3 ? "rgba(251, 191, 36, 0.05)" : "rgba(15, 23, 42, 0.8)",
                                    border: `1px solid ${isTop3 ? "rgba(251, 191, 36, 0.3)" : "rgba(255,255,255,0.05)"}`,
                                    borderRadius: "20px",
                                    padding: "24px 32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backdropFilter: "blur(12px)",
                                    boxShadow: isTop3 ? "0 0 30px rgba(251, 191, 36, 0.05)" : "none"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                                    <div style={{ 
                                        fontSize: isTop3 ? "36px" : "24px", 
                                        fontWeight: 950, 
                                        color: isTop3 ? "#fbbf24" : "#475569",
                                        minWidth: "60px",
                                        fontStyle: "italic"
                                    }}>
                                        #{player.rank}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: isTop3 ? "24px" : "20px", fontWeight: 800, color: "#fff" }}>
                                            {player.player_name}
                                        </div>
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            gap: 6, 
                                            fontSize: "13px", 
                                            color: "#94a3b8", 
                                            marginTop: 4,
                                            fontWeight: 600
                                        }}>
                                            <Clock size={14} className="text-sky-500" />
                                            Anwesenheit Spieltage: <span style={{ color: "#e2e8f0" }}>{attendanceMap[player.player_name] || "k.A."}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                    <div style={{ 
                                        fontSize: isTop3 ? "32px" : "24px", 
                                        fontWeight: 950, 
                                        color: isTop3 ? "#fbbf24" : "#38bdf8",
                                        lineHeight: 1
                                    }}>
                                        {player.total_points.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 800, letterSpacing: "0.1em", marginTop: 4 }}>PUNKTE</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Final Celebration Link (appears after all 19 players are revealed) */}
                <div style={{ 
                    marginTop: "100px", 
                    textAlign: "center",
                    animation: `rowPop 1s ${totalPlayers * 5}s forwards`,
                    opacity: 0
                }}>
                    <Trophy size={60} color="#fbbf24" style={{ margin: "0 auto 20px" }} />
                    <h2 style={{ fontSize: "32px", fontWeight: 900 }}>EINZIGARTIGE SAISON!</h2>
                    <p style={{ color: "#94a3b8", marginBottom: 40 }}>Glückwunsch an alle Teilnehmer.</p>
                    
                    <Link href="/" style={{
                        textDecoration: "none",
                        padding: "18px 48px",
                        background: "#fff",
                        color: "#000",
                        borderRadius: "16px",
                        fontWeight: 900,
                        fontSize: "16px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 12,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                    }}>
                        <ArrowLeft size={20} />
                        ZURÜCK ZUM DASHBOARD
                    </Link>
                </div>
            </div>
        </div>
    );
}
