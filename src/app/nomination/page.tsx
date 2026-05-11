import { Trophy, Star, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Hardcoded based on user screenshot for exact accuracy
const nominatedPlayers = [
    { rank: 1, name: "Sebastian Kirste", points: 42.25, avg: 51.9, siege: 84, hs: 1.81 },
    { rank: 3, name: "Jens Goltermann", points: 31.75, avg: 47.1, siege: 47, hs: 1.69 },
    { rank: 4, name: "Erik Schremmer", points: 31.00, avg: 45.2, siege: 45, hs: 1.68 },
    { rank: 5, name: "Nicholas Stedman", points: 28.00, avg: 43.1, siege: 52, hs: 1.20 },
    { rank: 6, name: "Kevin Emde", points: 27.50, avg: 42.1, siege: 43, hs: 1.37 },
    { rank: 8, name: "Dirk Ostermann", points: 25.25, avg: 40.9, siege: 46, hs: 1.01 }
];

export default function NominationPage() {
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
            padding: "40px 20px"
        }}>
            {/* Background Image with Overlay */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url(/nomination-bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.4,
                zIndex: 0,
                transform: "scale(1.1)",
                animation: "bgMove 20s infinite alternate linear"
            }} />
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at center, transparent 0%, #020617 90%)",
                zIndex: 1
            }} />

            {/* Animation Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bgMove {
                    from { transform: scale(1) translate(0, 0); }
                    to { transform: scale(1.1) translate(-20px, -10px); }
                }
                @keyframes cardReveal {
                    0% { opacity: 0; transform: translateY(60px) scale(0.8); filter: blur(20px); }
                    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                }
                @keyframes titleGlow {
                    0%, 100% { text-shadow: 0 0 20px rgba(56, 189, 248, 0.4); opacity: 0.8; }
                    50% { text-shadow: 0 0 50px rgba(56, 189, 248, 0.8), 0 0 100px rgba(236, 72, 153, 0.5); opacity: 1; }
                }
                @keyframes pulseGold {
                    0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.3); }
                    50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.5); border-color: rgba(251, 191, 36, 0.8); }
                }
                .nominee-card {
                    opacity: 0;
                    animation: cardReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .title-main {
                    animation: titleGlow 4s infinite ease-in-out;
                }
            ` }} />

            <div style={{ position: "relative", zIndex: 10, textAlign: "center", width: "100%", maxWidth: "1400px" }}>
                <div style={{ marginBottom: "80px" }}>
                    <div style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 12, 
                        background: "rgba(56, 189, 248, 0.1)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        padding: "10px 24px",
                        borderRadius: "100px",
                        color: "#38bdf8",
                        fontSize: "14px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.3em",
                        marginBottom: "24px"
                    }}>
                        <Trophy size={18} />
                        Offizielle Nominierung
                    </div>
                    <h1 className="title-main" style={{ 
                        fontSize: "clamp(50px, 10vw, 100px)", 
                        fontWeight: 950, 
                        margin: 0,
                        lineHeight: 1,
                        background: "linear-gradient(to bottom, #fff 40%, #64748b 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-0.02em"
                    }}>
                        DAS A-TEAM
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "20px", marginTop: "20px", fontWeight: 600, letterSpacing: "0.1em" }}>
                        SAISON 2025/26 • DIE QUALIFIZIERTEN
                    </p>
                </div>

                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
                    gap: "32px",
                    padding: "0 20px"
                }}>
                    {nominatedPlayers.map((player, index) => (
                        <div 
                            key={player.name} 
                            className="nominee-card"
                            style={{ 
                                animationDelay: `${(index * 2.2) + 1.5}s`, // SLOWER: 2.2s delay between each
                                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.6) 100%)",
                                backdropFilter: "blur(30px)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "32px",
                                padding: "40px",
                                textAlign: "left",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow: "0 30px 60px -12px rgba(0,0,0,0.6)",
                                animation: `cardReveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) ${(index * 2.2) + 1.5}s forwards, ${player.rank === 1 ? 'pulseGold 4s infinite ease-in-out 3s' : ''}`,
                            }}
                        >
                            {/* Rank Badge */}
                            <div style={{
                                position: "absolute",
                                top: "10px",
                                right: "30px",
                                fontSize: "80px",
                                fontWeight: 950,
                                color: "rgba(255,255,255,0.03)",
                                lineHeight: 1,
                                fontStyle: "italic",
                                pointerEvents: "none"
                            }}>
                                #{player.rank}
                            </div>

                            <div style={{ position: "relative", zIndex: 2 }}>
                                <div style={{ 
                                    width: "56px", 
                                    height: "56px", 
                                    background: player.rank === 1 ? "#fbbf24" : "rgba(56, 189, 248, 0.15)",
                                    borderRadius: "18px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "24px",
                                    color: player.rank === 1 ? "#000" : "#38bdf8",
                                    boxShadow: player.rank === 1 ? "0 0 20px rgba(251, 191, 36, 0.4)" : "none"
                                }}>
                                    {player.rank === 1 ? <Star size={28} fill="currentColor" /> : <Users size={28} />}
                                </div>
                                
                                <h3 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 8px", color: "#fff", letterSpacing: "-0.01em" }}>
                                    {player.name}
                                </h3>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                                    <span style={{ fontSize: "38px", fontWeight: 950, color: player.rank === 1 ? "#fbbf24" : "#38bdf8" }}>
                                        {player.points.toFixed(2)}
                                    </span>
                                    <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                        PUNKTE
                                    </span>
                                </div>

                                <div style={{ 
                                    marginTop: "32px", 
                                    paddingTop: "24px", 
                                    borderTop: "1px solid rgba(255,255,255,0.05)",
                                    display: "flex",
                                    gap: "32px"
                                }}>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>Ø AVG</div>
                                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#cbd5e1" }}>{player.avg.toFixed(1)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>SIEG%</div>
                                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#cbd5e1" }}>{player.siege}%</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "4px" }}>HS/L</div>
                                        <div style={{ fontSize: "18px", fontWeight: 800, color: "#cbd5e1" }}>{player.hs.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Glow */}
                            <div style={{
                                position: "absolute",
                                bottom: "-40px",
                                right: "-40px",
                                width: "160px",
                                height: "160px",
                                background: player.rank === 1 ? "rgba(251, 191, 36, 0.1)" : "rgba(56, 189, 248, 0.08)",
                                filter: "blur(60px)",
                                borderRadius: "50%",
                                zIndex: 1
                            }} />
                        </div>
                    ))}
                </div>

                <div style={{ 
                    marginTop: "100px", 
                    animation: "cardReveal 1.5s 15s forwards", 
                    opacity: 0,
                    textAlign: "center"
                }}>
                    <Link href="/" style={{
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "20px 48px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        borderRadius: "20px",
                        fontWeight: 800,
                        fontSize: "18px",
                        transition: "all 0.3s",
                        backdropFilter: "blur(10px)"
                    }}>
                        ZURÜCK ZUM DASHBOARD
                        <ArrowRight size={22} />
                    </Link>
                </div>
            </div>

            {/* Ambient Light */}
            <div style={{
                position: "absolute",
                top: "10%",
                left: "20%",
                width: "40vw",
                height: "40vw",
                background: "rgba(56, 189, 248, 0.05)",
                filter: "blur(120px)",
                borderRadius: "50%",
                zIndex: 1,
                pointerEvents: "none"
            }} />
        </div>
    );
}
