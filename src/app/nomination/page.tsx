import { prisma } from "@/lib/prisma";
import { Trophy, Star, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getTop6() {
    const snapshot = await prisma.snapshot.findFirst({
        orderBy: { timestamp: "desc" },
        include: { values: { orderBy: { rank: "asc" }, take: 6 } }
    });
    return snapshot?.values || [];
}

export default async function NominationPage() {
    const players = await getTop6();

    return (
        <div style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#fff",
            fontFamily: "var(--font-inter), sans-serif",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            {/* Background Image with Overlay */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url(/nomination-bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.4,
                zIndex: 0
            }} />
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at center, transparent 0%, #020617 80%)",
                zIndex: 1
            }} />

            {/* Animation Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes cardReveal {
                    0% { opacity: 0; transform: translateY(40px) scale(0.9); filter: blur(10px); }
                    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                }
                @keyframes titleGlow {
                    0%, 100% { text-shadow: 0 0 20px rgba(56, 189, 248, 0.5); }
                    50% { text-shadow: 0 0 40px rgba(56, 189, 248, 0.8), 0 0 60px rgba(236, 72, 153, 0.3); }
                }
                @keyframes borderRotate {
                    0% { border-color: rgba(56, 189, 248, 0.3); }
                    50% { border-color: rgba(236, 72, 153, 0.6); }
                    100% { border-color: rgba(56, 189, 248, 0.3); }
                }
                .nominee-card {
                    animation: cardReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    opacity: 0;
                }
            ` }} />

            <div style={{ position: "relative", zIndex: 10, textAlign: "center", width: "100%", maxWidth: "1200px" }}>
                <div style={{ marginBottom: "60px" }}>
                    <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 12, 
                        background: "rgba(56, 189, 248, 0.1)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        padding: "8px 20px",
                        borderRadius: "100px",
                        color: "#38bdf8",
                        fontSize: "14px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        marginBottom: "20px"
                    }}>
                        <Trophy size={16} />
                        Offizielle Nominierung
                    </div>
                    <h1 style={{ 
                        fontSize: "clamp(40px, 8vw, 84px)", 
                        fontWeight: 900, 
                        margin: 0,
                        lineHeight: 1,
                        background: "linear-gradient(to bottom, #fff 30%, #94a3b8 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animation: "titleGlow 3s infinite"
                    }}>
                        DAS A-TEAM
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "18px", marginTop: "16px", fontWeight: 500 }}>
                        Saison 2025/26 - Die Top 6 Spieler
                    </p>
                </div>

                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                    gap: "24px",
                    perspective: "1000px"
                }}>
                    {players.map((player, index) => (
                        <div 
                            key={player.id} 
                            className="nominee-card"
                            style={{ 
                                animationDelay: `${(index * 0.4) + 1}s`,
                                background: "rgba(15, 23, 42, 0.6)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "24px",
                                padding: "32px",
                                textAlign: "left",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                                animation: `cardReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${(index * 0.4) + 1}s forwards`,
                                opacity: 0
                            }}
                        >
                            {/* Rank Badge */}
                            <div style={{
                                position: "absolute",
                                top: "20px",
                                right: "24px",
                                fontSize: "48px",
                                fontWeight: 950,
                                color: "rgba(255,255,255,0.05)",
                                lineHeight: 1,
                                fontStyle: "italic"
                            }}>
                                #{player.rank}
                            </div>

                            <div style={{ position: "relative", zIndex: 2 }}>
                                <div style={{ 
                                    width: "48px", 
                                    height: "48px", 
                                    background: index === 0 ? "#fbbf24" : "rgba(56, 189, 248, 0.2)",
                                    borderRadius: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "20px",
                                    color: index === 0 ? "#000" : "#38bdf8"
                                }}>
                                    {index === 0 ? <Star size={24} fill="currentColor" /> : <Users size={24} />}
                                </div>
                                
                                <h3 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
                                    {player.player_name}
                                </h3>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                                    <span style={{ fontSize: "32px", fontWeight: 900, color: index === 0 ? "#fbbf24" : "#38bdf8" }}>
                                        {player.total_points.toFixed(2)}
                                    </span>
                                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                                        PUNKTE
                                    </span>
                                </div>

                                <div style={{ 
                                    marginTop: "24px", 
                                    paddingTop: "16px", 
                                    borderTop: "1px solid rgba(255,255,255,0.05)",
                                    display: "flex",
                                    gap: "20px"
                                }}>
                                    <div>
                                        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>AVG</div>
                                        <div style={{ fontSize: "14px", fontWeight: 700 }}>{player.avg_total.toFixed(1)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>180s</div>
                                        <div style={{ fontSize: "14px", fontWeight: 700 }}>{player.cnt_180}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>SIEGE</div>
                                        <div style={{ fontSize: "14px", fontWeight: 700 }}>{player.siegequote_pct.toFixed(0)}%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Glow */}
                            <div style={{
                                position: "absolute",
                                bottom: "-20px",
                                right: "-20px",
                                width: "100px",
                                height: "100px",
                                background: index === 0 ? "rgba(251, 191, 36, 0.15)" : "rgba(56, 189, 248, 0.1)",
                                filter: "blur(40px)",
                                borderRadius: "50%",
                                zIndex: 1
                            }} />
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "80px", animation: "cardReveal 1s 4s forwards", opacity: 0 }}>
                    <Link href="/" style={{
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "16px 40px",
                        background: "#fff",
                        color: "#000",
                        borderRadius: "16px",
                        fontWeight: 800,
                        fontSize: "16px",
                        transition: "all 0.2s"
                    }}>
                        ZURÜCK ZUM DASHBOARD
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            {/* Floating Particles (CSS only) */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} style={{
                        position: "absolute",
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: "2px",
                        height: "2px",
                        background: "#fff",
                        borderRadius: "50%",
                        opacity: Math.random() * 0.5,
                        animation: `cardReveal ${2 + Math.random() * 4}s infinite alternate`
                    }} />
                ))}
            </div>
        </div>
    );
}
