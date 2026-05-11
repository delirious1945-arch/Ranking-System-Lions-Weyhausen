"use client";

import { useState, useEffect } from "react";
import { PlusCircle, AlertCircle, Save, X } from "lucide-react";

interface PlayerCorrectionFormProps {
    playerName: string;
}

export default function PlayerCorrectionForm({ playerName }: PlayerCorrectionFormProps) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [spieltag, setSpieltag] = useState(0);
    const [isDouble, setIsDouble] = useState(false);
    const [won, setWon] = useState(true);
    const [cnt180, setCnt180] = useState(0);
    const [highFinish, setHighFinish] = useState(0);
    const [avgTotal, setAvgTotal] = useState(0);

    useEffect(() => {
        const role = localStorage.getItem("lions-auth-role");
        if (role === "admin") {
            setIsAdmin(true);
        }
    }, []);

    if (!isAdmin) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/match-records", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerName,
                    spieltag,
                    isDouble,
                    won,
                    count180: cnt180,
                    checkoutMax: highFinish,
                    avgTotal,
                    opponentName: "Admin Korrektur",
                    date: new Date().toISOString(),
                    // Generate a random high ID to avoid collisions with 2K imports
                    gameId: Math.floor(Math.random() * 1000000) + 9000000
                })
            });

            if (res.ok) {
                alert("Korrektur erfolgreich gespeichert! Die Seite wird nun neu geladen.");
                window.location.reload();
            } else {
                const err = await res.json();
                alert("Fehler: " + (err.error || "Unbekannter Fehler"));
            }
        } catch (err) {
            alert("Netzwerkfehler beim Speichern.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl transition-all font-bold text-sm"
            >
                <PlusCircle className="w-4 h-4" />
                Admin Korrektur-Eintrag
            </button>
        );
    }

    return (
        <div className="mt-8 bg-slate-900/50 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-indigo-400" />
                        Statistik-Korrektur für {playerName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        Diese Werte werden zu den Saison-Statistiken addiert (oder subtrahiert bei negativen Zahlen).
                    </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white p-1">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Spieltag (0 = Vorbereitung)</label>
                    <input 
                        type="number" 
                        value={spieltag} 
                        onChange={e => setSpieltag(parseInt(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Spieltyp</label>
                    <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                        <button 
                            type="button"
                            onClick={() => setIsDouble(false)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isDouble ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Einzel
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsDouble(true)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isDouble ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Doppel
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Ergebnis</label>
                    <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                        <button 
                            type="button"
                            onClick={() => setWon(true)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${won ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Sieg
                        </button>
                        <button 
                            type="button"
                            onClick={() => setWon(false)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!won ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Niederlage
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">180er Korrektur</label>
                    <input 
                        type="number" 
                        value={cnt180} 
                        onChange={e => setCnt180(parseInt(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500 transition-all"
                        placeholder="Anzahl (z.B. 1)"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">High Finish Korrektur</label>
                    <input 
                        type="number" 
                        value={highFinish} 
                        onChange={e => setHighFinish(parseInt(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-all"
                        placeholder="Check-out (z.B. 120)"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Average Korrektur</label>
                    <input 
                        type="number" 
                        step="0.1"
                        value={avgTotal} 
                        onChange={e => setAvgTotal(parseFloat(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all"
                        placeholder="Avg (z.B. 50.5)"
                    />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 pt-4">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {loading ? "Wird gespeichert..." : <><Save className="w-5 h-5" /> Korrektur anwenden</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
