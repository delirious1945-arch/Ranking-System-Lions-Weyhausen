import { prisma } from "@/lib/prisma";
import SeasonRevealClient from "@/components/SeasonRevealClient";

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
    return (snapshot?.values || []).map(v => ({
        id: v.id,
        player_name: v.player_name,
        rank: v.rank,
        total_points: v.total_points
    }));
}

export default async function SeasonRevealPage() {
    const allPlayers = await getPlayers();

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
            overflow: "hidden"
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
                    animation: activeCardGlow 5s ease-out forwards;
                }
                .winner-final {
                    animation: winnerFinalGlow 3s infinite !important;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            ` }} />

            <SeasonRevealClient allPlayers={allPlayers} attendanceMap={attendanceMap} />
        </div>
    );
}
