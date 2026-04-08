"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function getCurrentSpieltag() {
    const now = new Date();
    const shifted = new Date(now);
    shifted.setDate(shifted.getDate() + 3);

    const d = new Date(Date.UTC(shifted.getFullYear(), shifted.getMonth(), shifted.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo + 3;
}

export default function UpdateSnapshotButton() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedSpieltag, setSelectedSpieltag] = useState<number>(15); // Fallback
    const [availableSpieltage, setAvailableSpieltage] = useState<number[]>([]);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('lions-auth-role');
        if (role === 'admin') {
            setIsAdmin(true);
        }
        const current = getCurrentSpieltag();
        setSelectedSpieltag(current);
        
        // Generate Spieltag 13 up to max 18 (season has 18 Spieltage)
        const list = [];
        const maxSpieltag = Math.min(Math.max(current, 18), 18);
        for (let i = 13; i <= maxSpieltag; i++) {
            list.push(i);
        }
        setAvailableSpieltage(list);
    }, []);

    const handleUpdate = async () => {
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/update-snapshot", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetWeekId: `Spieltag ${selectedSpieltag}` })
            });
            const data = await res.json();

            if (data.success) {
                setStatus("success");
                setMessage(`Speichern in Spieltag ${selectedSpieltag} OK`);
                setTimeout(() => {
                    router.refresh();
                    setStatus("idle");
                    setMessage("");
                }, 3000);
            } else {
                setStatus("error");
                setMessage("Fehler beim Laden");
                setTimeout(() => { setStatus("idle"); setMessage(""); }, 5000);
            }
        } catch {
            setStatus("error");
            setMessage("Verbindungsfehler");
            setTimeout(() => { setStatus("idle"); setMessage(""); }, 5000);
        }
    };

    if (!isAdmin || typeof window !== 'undefined' && localStorage.getItem('lions-auth-name') !== 'Sebastian Kirste') return null;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {message && (
                <span style={{
                    fontSize: "12px",
                    color: status === "success" ? "var(--green)" : "var(--red)",
                    background: status === "success" ? "var(--green-muted)" : "var(--red-muted)",
                    padding: "4px 10px", borderRadius: "6px", whiteSpace: "nowrap"
                }}>
                    {message}
                </span>
            )}
            
            <select 
                value={selectedSpieltag} 
                onChange={(e) => setSelectedSpieltag(Number(e.target.value))}
                disabled={status === "loading"}
                style={{
                    padding: "7px 10px",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer"
                }}
            >
                {availableSpieltage.map(s => (
                    <option key={s} value={s} style={{ background: "#13161e" }}>
                        Spieltag {s}
                    </option>
                ))}
            </select>

            <button
                onClick={handleUpdate}
                disabled={status === "loading"}
                style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    padding: "8px 16px",
                    background: status === "success" ? "var(--green-muted)" :
                        status === "error" ? "var(--red-muted)" :
                            "var(--accent-muted)",
                    border: `1px solid ${status === "success" ? "var(--green)" :
                        status === "error" ? "var(--red)" :
                            "var(--accent)"}`,
                    color: status === "success" ? "var(--green)" :
                        status === "error" ? "var(--red)" : "var(--accent)",
                    borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    opacity: status === "loading" ? 0.6 : 1,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                }}
            >
                {status === "loading" ? (
                    <svg style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 4v6h6M23 20v-6h-6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                )}
                <span className="hide-mobile">
                    {status === "loading" ? " Lädt..." :
                        status === "success" ? " Aktualisiert" :
                            status === "error" ? " Fehler" :
                                " Aktualisieren"}
                </span>
            </button>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
