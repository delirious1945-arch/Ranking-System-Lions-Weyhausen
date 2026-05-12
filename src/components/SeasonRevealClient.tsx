'use client';

import { useState } from 'react';
import { Trophy, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { RedirectTimer } from "@/components/RedirectTimer";
import MatrixExplanation from "@/components/MatrixExplanation";

interface PlayerValue {
    id: number;
    player_name: string;
    rank: number;
    total_points: number;
}

interface SeasonRevealClientProps {
    allPlayers: PlayerValue[];
    attendanceMap: Record<string, string>;
}

export default function SeasonRevealClient({ allPlayers, attendanceMap }: SeasonRevealClientProps) {
    const [started, setStarted] = useState(false);
    const totalPlayers = allPlayers.length;

    return (
        <>
            {!started && <MatrixExplanation onStart={() => setStarted(true)} />}

            {started && (
                <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "850px", animation: 'fadeIn 1s ease-out' }}>
                    {/* Client-side Timer for Redirect - Only starts when show starts */}
                    <RedirectTimer target="/nomination" delay={125000} />

                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h1 style={{ fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 950, margin: 0, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                            SAISON-FINALE
                        </h1>
                        <p style={{ color: "#38bdf8", fontWeight: 800, letterSpacing: "0.2em", fontSize: "14px", marginTop: 6 }}>
                            DER COUNTDOWN LÄUFT...
                        </p>
                    </div>

                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        {allPlayers.map((player) => {
                            const isTop3 = player.rank <= 3;
                            const isWinner = player.rank === 1;
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
                                        <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 3vw, 32px)" }}>
                                            <div style={{ 
                                                fontSize: isTop3 ? "clamp(24px, 5vw, 42px)" : "clamp(18px, 4vw, 28px)", 
                                                fontWeight: 950, 
                                                color: isTop3 ? "#fbbf24" : "#475569",
                                                minWidth: "clamp(40px, 6vw, 70px)",
                                                fontStyle: "italic"
                                            }}>
                                                #{player.rank}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: isTop3 ? "clamp(18px, 4vw, 28px)" : "clamp(16px, 3.5vw, 22px)", fontWeight: 800, color: "#fff" }}>
                                                    {player.player_name}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "#94a3b8", marginTop: 6, fontWeight: 600 }}>
                                                    <Clock size={14} className="text-sky-500" />
                                                    Anwesenheit: <span style={{ color: "#e2e8f0" }}>{attendanceMap[player.player_name] || "0%"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: isTop3 ? "clamp(24px, 5vw, 36px)" : "clamp(18px, 4vw, 26px)", fontWeight: 950, color: isTop3 ? "#fbbf24" : "#38bdf8", lineHeight: 1 }}>
                                                {player.total_points.toFixed(2)}
                                            </div>
                                            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 800, letterSpacing: "0.1em", marginTop: 6 }}>PUNKTE</div>
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
            )}
        </>
    );
}
