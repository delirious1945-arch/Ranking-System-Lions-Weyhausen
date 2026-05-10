"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, ShieldAlert, CheckCircle, Database, Lock } from "lucide-react";
import ManualGameForm from "@/components/ManualGameForm";
import RankingConfigForm from "@/components/RankingConfigForm";

export const dynamic = "force-dynamic";

function AdminContent() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [userName, setUserName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [importStatus, setImportStatus] = useState("");
    const [vetoUsername, setVetoUsername] = useState("");
    const [vetoReason, setVetoReason] = useState("");

    useEffect(() => {
        const storedName = localStorage.getItem('lions-auth-name');
        const role = localStorage.getItem('lions-auth-role');
        
        if (role === 'admin') {
            setAuthorized(true);
            setUserName(storedName || '');
        } else {
            setAuthorized(false);
            setUserName(storedName || '');
        }
    }, []);

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setImportStatus("Importing...");

        // Simulate import
        setTimeout(() => {
            setImportStatus("Import erfolgreich. 0 Änderungen vorgenommen.");
            setFile(null);
        }, 1500);
    };

    const handleVeto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vetoUsername) return;

        try {
            const res = await fetch("/api/set-veto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_name: vetoUsername, reason: vetoReason, active: true })
            });
            if (res.ok) {
                alert("Veto erfolgreich gesetzt.");
                setVetoUsername("");
                setVetoReason("");
            } else {
                alert("Fehler beim Setzen des Vetos.");
            }
        } catch {
            alert("Netzwerkfehler.");
        }
    };

    // Loading state
    if (authorized === null) return null;

    if (!authorized) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '60vh', textAlign: 'center', padding: '40px 20px',
            }}>
                <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 24,
                    padding: '48px 40px',
                    maxWidth: 420,
                }}>
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        borderRadius: '50%',
                        width: 72, height: 72,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <Lock size={32} color="#ef4444" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', margin: '0 0 8px' }}>
                        Zugriff Verweigert
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 8px', lineHeight: 1.5 }}>
                        Der Admin-Bereich ist ausschließlich für autorisierte Administratoren zugänglich.
                    </p>
                    {userName && (
                        <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 24px' }}>
                            Angemeldet als: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{userName}</span>
                        </p>
                    )}
                    <button
                        onClick={() => router.push("/")}
                        style={{
                            padding: '12px 28px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            color: '#e2e8f0',
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        Zurück zum Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                    <Database className="w-8 h-8 text-indigo-400" />
                    System Administration
                </h1>
                <p className="text-slate-400 mt-2">Manage Backups, Excel Overrides und Vetos für das A-Team.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup & Import Module */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <Upload className="w-5 h-5 text-emerald-400" />
                        Backup Korrektur-Import
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">
                        Lade hier eine bearbeitete `parsed_data_editable.xlsx` hoch. Nur Spalten mit <code className="text-amber-400">override_</code> Prefix werden ins System übernommen.
                    </p>

                    <form onSubmit={handleImport} className="space-y-4">
                        <div className="border-2 border-dashed border-slate-700 bg-slate-800/30 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".xlsx,.csv"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                <Download className="w-8 h-8 text-slate-400" />
                                <span className="text-slate-300 font-medium">{file ? file.name : "Klicke hier oder Drag & Drop (.xlsx)"}</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!file}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-3 rounded-xl transition-colors"
                        >
                            Korrektur-Snapshot Anwenden
                        </button>

                        {importStatus && (
                            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-500/20">
                                <CheckCircle className="w-4 h-4" />
                                {importStatus}
                            </div>
                        )}
                    </form>
                </div>

                {/* Veto Module */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                        Manuelles Veto setzen
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">
                        Spieler mit aktivem Veto bleiben in der Haupttabelle sichtbar (mit Warnsymbol), werden aber bei der Top-5 (A-Team) Auswahl ignoriert.
                    </p>

                    <form onSubmit={handleVeto} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Spielername</label>
                            <input
                                type="text"
                                required
                                value={vetoUsername}
                                onChange={(e) => setVetoUsername(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-slate-500"
                                placeholder="Z.B. Sebastian Kirste"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Begründung (Audit Log)</label>
                            <input
                                type="text"
                                required
                                value={vetoReason}
                                onChange={(e) => setVetoReason(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-slate-500"
                                placeholder="Z.B. Spielt diese Woche in B-Team"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 rounded-xl transition-colors mt-2 shadow-[0_0_15px_rgba(217,119,6,0.5)]"
                        >
                            Veto Aktivieren
                        </button>
                    </form>
                </div>

                {/* Manual Game Entry Module */}
                <div className="md:col-span-2">
                    <RankingConfigForm />
                </div>

                {/* Manual Game Entry Module */}
                <div className="md:col-span-2">
                    <ManualGameForm />
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="text-center py-20 text-slate-400">Lädt...</div>}>
            <AdminContent />
        </Suspense>
    );
}
