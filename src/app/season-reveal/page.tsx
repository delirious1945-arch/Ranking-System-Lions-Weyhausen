import { prisma } from "@/lib/prisma";
import { Trophy, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const attendanceMap: Record<string, string> = {
    "Sebastian Kirste": "100%", "Timo Feuerhahn": "50,0%", "Jens Goltermann": "100%", "Erik Schremmer": "60,0%",
    "Nicholas Stedman": "93,8%", "Kevin Emde": "68,8%", "Maik Feuerhahn": "37,5%", "Dirk Ostermann": "87,5%",
    "Jannik Baier": "63,6%", "Michael Kranz": "81,3%", "André Rathje": "93,8%", "Michael Gehrt": "87,5%",
    "Karen Schulz": "50,0%", "Jochen Michael": "100%", "Joachim Koch": "31,3%", "Martin Wolnik": "31,3%",
    "Malte Wolnik": "18,8%", "Karsten Kohnert": "31,3%", "Uwe Kohnert": "0%"
};

async function getPlayers() {
    const snapshot = await prisma.snapshot.findFirst({
        orderBy: { timestamp: "desc" },
        include: { values: { orderBy: { rank: "asc" } } }
    });
    return snapshot?.values || [];
}

export default async function SeasonRevealPage() {
    const allPlayers = await getPlayers();
    const totalPlayers = allPlayers.length;

    return (
        <div style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#fff",
            fontFamily: "var(--font-inter), sans-serif",
            position: "relative",
            padding: "40px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden" // Prevent overall page scroll to keep focus
        }}>
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
                @keyframes pushDownReveal {
                    0% { max-height: 0; opacity: 0; transform: translateY(-40px) scale(0.95); margin-bottom: 0; }
                    100% { max-height: 250px; opacity: 1; transform: translateY(0) scale(1); margin-bottom: 16px; }
                }
                @keyframes activeCardGlow {
                    0% { border-color: #38bdf8; box-shadow: 0 0 30px rgba(56, 189, 248, 0.4); }
                    100% { border-color: rgba(255,255,255,0.08); box-shadow: none; }
                }
                @keyframes winnerFinalGlow {
                    0%, 100% { border-color: #fbbf24; box-shadow: 0 0 40px rgba(251, 191, 36, 0.3); }
                    50% { border-color: #f59e0b; box-shadow: 0 0 60px rgba(251, 191, 36, 0.6); }
                }
                .reveal-row {
                    max-height: 0;
                    opacity: 0;
                    overflow: hidden;
                    animation: pushDownReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    width: 100%;
                }
                .glow-effect {
                    /* Only glow for the 5 seconds until the next one arrives */
                    animation: activeCardGlow 5s ease-out forwards;
                }
                .winner-final {
                    animation: winnerFinalGlow 3s infinite !important;
                }
            ` }} />

            <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "850px" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "52px", fontWeight: 950, margin: 0, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                        SAISON-FINALE
                    </h1>
                    <p style={{ color: "#38bdf8", fontWeight: 800, letterSpacing: "0.2em", fontSize: "14px", marginTop: 6 }}>
                        DER COUNTDOWN LÄUFT...
                    </p>
                </div>

                {/* Fixed container - the list grows from the top down */}
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    {allPlayers.map((player) => {
                        const isTop3 = player.rank <= 3;
                        const isWinner = player.rank === 1;
                        // Delay: Rank 19 has 0s, Rank 18 has 5s, etc.
                        const delay = (totalPlayers - player.rank) * 5;
                        
                        return (
                            <div 
                                key={player.id}
                                className="reveal-row"
                                style={{
                                    animationDelay: `${delay}s`,
                                }}
                            >
                                <div 
                                    className={`glow-effect ${isWinner ? 'winner-final' : ''}`}
                                    style={{
                                        animationDelay: `${delay}s`,
                                        background: isTop3 ? "rgba(251, 191, 36, 0.08)" : "rgba(15, 23, 42, 0.85)",
                                        border: `1px solid rgba(255,255,255,0.08)`,
                                        borderRadius: "24px",
                                        padding: "28px 40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        backdropFilter: "blur(20px)",
                                        marginBottom: "4px"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                                        <div style={{ 
                                            fontSize: isTop3 ? "42px" : "28px", 
                                            fontWeight: 950, 
                                            color: isTop3 ? "#fbbf24" : "#475569",
                                            minWidth: "70px",
                                            fontStyle: "italic"
                                        }}>
                                            #{player.rank}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: isTop3 ? "28px" : "22px", fontWeight: 800, color: "#fff" }}>
                                                {player.player_name}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "14px", color: "#94a3b8", marginTop: 6, fontWeight: 600 }}>
                                                <Clock size={16} className="text-sky-500" />
                                                Anwesenheit: <span style={{ color: "#e2e8f0" }}>{attendanceMap[player.player_name] || "0%"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: isTop3 ? "36px" : "26px", fontWeight: 950, color: isTop3 ? "#fbbf24" : "#38bdf8", lineHeight: 1 }}>
                                            {player.total_points.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, letterSpacing: "0.1em", marginTop: 6 }}>PUNKTE</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ 
                    marginTop: "80px", 
                    textAlign: "center",
                    animation: `pushDownReveal 1.5s ${totalPlayers * 5}s forwards`,
                    opacity: 0,
                    paddingBottom: "100px"
                }}>
                    <Trophy size={80} color="#fbbf24" style={{ margin: "0 auto 24px" }} />
                    <h2 style={{ fontSize: "36px", fontWeight: 950 }}>SAISON ABGESCHLOSSEN!</h2>
                    <Link href="/" style={{
                        marginTop: 40,
                        textDecoration: "none",
                        padding: "20px 50px",
                        background: "#fff",
                        color: "#000",
                        borderRadius: "18px",
                        fontWeight: 900,
                        fontSize: "18px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 15,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
                    }}>
                        <ArrowLeft size={22} />
                        ZURÜCK ZUM DASHBOARD
                    </Link>
                </div>
            </div>
            
            {/* Automatic Redirect to Nomination after animation + 60s buffer */}
            <script dangerouslySetInnerHTML={{ __html: `
                // Total animation time: (19 players * 5s) = 95s
                // Plus 60s buffer as requested = 155s total from start
                setTimeout(() => {
                    window.location.href = '/nomination';
                }, 155000);
            ` }} />
        </div>
    );
}
