"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpdateSnapshotButton() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState<string>("");
    const router = useRouter();

    const handleUpdate = async () => {
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/update-snapshot", { method: "POST" });
            const data = await res.json();

            if (data.success) {
                setStatus("success");
                setMessage(`${data.players_saved} Spieler geladen`);
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

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {message && (
                <span style={{
                    fontSize: "12px",
                    color: status === "success" ? "var(--green)" : "var(--red)",
                    background: status === "success" ? "var(--green-muted)" : "var(--red-muted)",
                    padding: "4px 10px", borderRadius: "6px"
                }}>
                    {message}
                </span>
            )}
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
                    transition: "all 0.2s"
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
                {status === "loading" ? "Lädt..." :
                    status === "success" ? "Aktualisiert" :
                        status === "error" ? "Fehler" :
                            "Aktualisieren"}
            </button>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
