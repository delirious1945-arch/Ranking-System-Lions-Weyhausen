import { prisma } from "@/lib/prisma";
import { Trophy, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getAllPlayers() {
    const snapshot = await prisma.snapshot.findFirst({
        orderBy: { timestamp: "desc" },
        include: { values: { orderBy: { rank: "desc" } } } // Start from the last rank
    });
    return snapshot?.values || [];
}

export default async function SeasonRevealPage() {
    const players = await getAllPlayers();

    return (
        <div style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#fff",
            fontFamily: "var(--font-inter), sans-serif",
            overflowX: "hidden",
            position: "relative",
            padding: "60px 20px"
        }}>
            {/* Background */}
            <div style={{
                position: "fixed",
                inset: 0,
                backgroundImage: "url(/nomination-bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.15,
                zIndex: 0
            }} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes rowSlideIn {
                    0% { opacity: 0; transform: translateX(100px); filter: blur(10px); }
                    100% { opacity: 1; transform: translateX(0); filter: blur(0); }
                }
                @keyframes highlightPulse {
                    0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(56, 189, 248, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
                }
                .reveal-row {
                    opacity: 0;
                    animation: rowSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .top-3-row {
                    animation-duration: 1.5s;
                    border-left: 4px solid #fbbf24 !important;
                }
            ` }} />

            <div style={{ position: "relative", zIndex: 10, maxWidth: "900px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "80px" }}>
                    <h1 style={{ 
                        fontSize: "clamp(32px, 6vw, 64px)", 
                        fontWeight: 900, 
                        margin: 0,
                        background: "linear-gradient(to right, #fff, #94a3b8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        GESAMTRANKING
                    </h1>
                    <p style={{ color: "#38bdf8", fontWeight: 800, letterSpacing: "0.2em", marginTop: "12px", fontSize: "14px" }}>
                        DER GROSSE SAISON-COUNTDOWN
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {players.map((player, index) => {
                        const isTop3 = player.rank <= 3;
                        // Calculate delay: starts at 1s, each subsequent row adds 1.5s (slower countdown)
                        // Top 3 get even more delay for drama
                        const delay = index * 1.8 + 1;
                        
                        return (
                            <div 
                                key={player.id}
                                className={`reveal-row ${isTop3 ? 'top-3-row' : ''}`}
                                style={{
                                    animationDelay: `${delay}s`,
                                    background: isTop3 ? "rgba(251, 191, 36, 0.1)" : "rgba(15, 23, 42, 0.6)",
                                    border: isTop3 ? "1px solid rgba(251, 191, 36, 0.3)" : "1px solid rgba(255,255,255,0.05)",
                                    borderRadius: "16px",
                                    padding: "20px 32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backdropFilter: "blur(10px)",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                                    <div style={{ 
                                        fontSize: isTop3 ? "32px" : "24px", 
                                        fontWeight: 900, 
                                        color: isTop3 ? "#fbbf24" : "#64748b",
                                        minWidth: "50px",
                                        fontStyle: "italic"
                                    }}>
                                        #{player.rank}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: isTop3 ? "22px" : "18px", fontWeight: 800, color: "#fff" }}>
                                            {player.player_name}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
                                            {player.avg_total.toFixed(1)} AVG • {player.cnt_180}x 180s
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                    <div style={{ 
                                        fontSize: isTop3 ? "28px" : "20px", 
                                        fontWeight: 900, 
                                        color: isTop3 ? "#fbbf24" : "#38bdf8" 
                                    }}>
                                        {player.total_points.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 800 }}>PUNKTE</div>
                                </div>

                                {isTop3 && (
                                    <div style={{
                                        position: "absolute",
                                        right: "-10px",
                                        top: "-10px",
                                        opacity: 0.1
                                    }}>
                                        <Trophy size={80} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div style={{ 
                    marginTop: "100px", 
                    textAlign: "center",
                    animation: `rowSlideIn 1s ${players.length * 1.8 + 2}s forwards`,
                    opacity: 0
                }}>
                    <div style={{ marginBottom: "40px" }}>
                        <Trophy size={64} color="#fbbf24" style={{ margin: "0 auto" }} />
                        <h2 style={{ fontSize: "32px", fontWeight: 900, marginTop: "20px" }}>HERZLICHEN GLÜCKWUNSCH!</h2>
                        <p style={{ color: "#94a3b8" }}>Was für eine überragende Saison.</p>
                    </div>
                    
                    <Link href="/" style={{
                        textDecoration: "none",
                        padding: "16px 40px",
                        background: "#fff",
                        color: "#000",
                        borderRadius: "12px",
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 12
                    }}>
                        <ArrowLeft size={20} />
                        ZURÜCK ZUM DASHBOARD
                    </Link>
                </div>
            </div>
        </div>
    );
}
