import { prisma } from "@/lib/prisma";
import { Trophy, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const attendanceMap: Record<string, string> = {
    "Sebastian Kirste": "100%", "Timo Feuerhahn": "50,0%", "Jens Goltermann": "100%", "Erik Schremmer": "37,5%",
    "Nicholas Stedman": "93,8%", "Kevin Emde": "68,8%", "Maik Feuerhahn": "37,5%", "Dirk Ostermann": "87,5%",
    "Jannik Baier": "43,8%", "Michael Kranz": "81,3%", "André Rathje": "93,8%", "Michael Gehrt": "87,5%",
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
            alignItems: "center"
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
                @keyframes dropIn {
                    0% { max-height: 0; opacity: 0; transform: translateY(-20px); margin-bottom: 0; }
                    100% { max-height: 200px; opacity: 1; transform: translateY(0); margin-bottom: 16px; }
                }
                @keyframes winnerGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.2); }
                    50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.4); border-color: rgba(251, 191, 36, 0.6); }
                }
                .reveal-row {
                    max-height: 0;
                    opacity: 0;
                    overflow: hidden;
                    animation: dropIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
            ` }} />

            <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "800px" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "48px", fontWeight: 950, margin: 0, letterSpacing: "-0.02em" }}>
                        SAISON-FINALE
                    </h1>
                    <p style={{ color: "#38bdf8", fontWeight: 800, letterSpacing: "0.2em", fontSize: "14px", marginTop: 8 }}>
                        DER COUNTDOWN LÄUFT...
                    </p>
                </div>

                {/* The List: Newest on Top */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {allPlayers.map((player) => {
                        const isTop3 = player.rank <= 3;
                        // Reverse delay: Rank 19 has delay 0, Rank 1 has (18 * 5s)
                        const delay = (totalPlayers - player.rank) * 5;
                        
                        return (
                            <div 
                                key={player.id}
                                className="reveal-row"
                                style={{
                                    animationDelay: `${delay}s`,
                                    background: isTop3 ? "rgba(251, 191, 36, 0.08)" : "rgba(15, 23, 42, 0.8)",
                                    border: `1px solid ${isTop3 ? "rgba(251, 191, 36, 0.4)" : "rgba(255,255,255,0.08)"}`,
                                    borderRadius: "20px",
                                    padding: "24px 32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backdropFilter: "blur(20px)",
                                    animation: `dropIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s forwards, ${player.rank === 1 ? 'winnerGlow 3s infinite' : ''}`
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                                    <div style={{ 
                                        fontSize: isTop3 ? "36px" : "24px", 
                                        fontWeight: 950, 
                                        color: isTop3 ? "#fbbf24" : "#475569",
                                        minWidth: "60px"
                                    }}>
                                        #{player.rank}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: isTop3 ? "24px" : "18px", fontWeight: 800, color: "#fff" }}>
                                            {player.player_name}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px", color: "#94a3b8", marginTop: 4 }}>
                                            <Clock size={14} className="text-sky-500" />
                                            Anwesenheit: <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{attendanceMap[player.player_name] || "k.A."}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: isTop3 ? "32px" : "22px", fontWeight: 950, color: isTop3 ? "#fbbf24" : "#38bdf8" }}>
                                        {player.total_points.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 800 }}>PUNKTE</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ 
                    marginTop: "60px", 
                    textAlign: "center",
                    animation: `dropIn 1.5s ${totalPlayers * 5}s forwards`,
                    opacity: 0
                }}>
                    <div style={{ marginBottom: "30px" }}>
                        <Trophy size={64} color="#fbbf24" style={{ margin: "0 auto" }} />
                        <h2 style={{ fontSize: "32px", fontWeight: 900, marginTop: 20 }}>WAHNSINNS LEISTUNG!</h2>
                    </div>
                    
                    <Link href="/" style={{
                        textDecoration: "none",
                        padding: "16px 40px",
                        background: "#fff",
                        color: "#000",
                        borderRadius: "14px",
                        fontWeight: 900,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 12
                    }}>
                        <ArrowLeft size={20} />
                        DASHBOARD
                    </Link>
                </div>
            </div>
        </div>
    );
}
