"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Upload, Download, ShieldAlert, CheckCircle, Database } from "lucide-react";
import ManualGameForm from "@/components/ManualGameForm";
import RankingConfigForm from "@/components/RankingConfigForm";

export const dynamic = "force-dynamic";

function AdminContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [importStatus, setImportStatus] = useState("");
    const [vetoUsername, setVetoUsername] = useState("");
    const [vetoReason, setVetoReason] = useState("");

    useEffect(() => {
        const secret = searchParams.get("secret");
        if (secret === "dev-lions-2026") {
            setAuthorized(true);
        }
    }, [searchParams]);

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

    if (!authorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-white">Zugriff Verweigert</h1>
                <p className="text-slate-400 mt-2">Dieser Bereich ist nur für Entwickler zugänglich.</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-6 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                    Zurück zum Dashboard
                </button>
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
