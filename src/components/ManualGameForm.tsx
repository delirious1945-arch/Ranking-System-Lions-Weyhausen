'use client';

import { useState } from 'react';
import { Trophy, Target, Plus, Send, CheckCircle2 } from 'lucide-react';

const ALLOWED_NAMES = [
    'Sebastian Kirste', 'Jens Goltermann', 'Erik Schremmer', 'Timo Feuerhahn',
    'Dirk Ostermann', 'Nicholas Stedman', 'Kevin Emde', 'Maik Feuerhahn',
    'Jannik Baier', 'Michael Kranz', 'Michael Gehrt', 'André Rathje',
    'Malte Wolnik', 'Karen Schulz', 'Joachim Koch', 'Martin Wolnik',
    'Karsten Kohnert', 'Uwe Kohnert'
];

export default function ManualGameForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        player_name: ALLOWED_NAMES[0],
        game1_avg: 40,
        game1_win: true,
        game2_avg: 40,
        game2_win: true,
        cnt_80: 0,
        cnt_100: 0,
        cnt_140: 0,
        cnt_180: 0,
        legs_total: 6,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch('/api/manual-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSuccess(true);
                // Reset counts but keep player
                setFormData(prev => ({
                    ...prev,
                    cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0
                }));
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert('Fehler beim Speichern.');
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none transition-all";

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-blue-400" />
                Manuelle Spieleingabe
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Player Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Spieler auswählen</label>
                    <select
                        value={formData.player_name}
                        onChange={e => setFormData({ ...formData, player_name: e.target.value })}
                        className={inputClass}
                    >
                        {ALLOWED_NAMES.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                {/* Games Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Game 1 */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-bold text-white uppercase">Spiel 1</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Average</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.game1_avg}
                                    onChange={e => setFormData({ ...formData, game1_avg: parseFloat(e.target.value) })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Ergebnis</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, game1_win: !formData.game1_win })}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${formData.game1_win ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}
                                >
                                    {formData.game1_win ? 'SIEG' : 'NIEDERLAGE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Game 2 */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-bold text-white uppercase">Spiel 2</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Average</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.game2_avg}
                                    onChange={e => setFormData({ ...formData, game2_avg: parseFloat(e.target.value) })}
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Ergebnis</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, game2_win: !formData.game2_win })}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${formData.game2_win ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}
                                >
                                    {formData.game2_win ? 'SIEG' : 'NIEDERLAGE'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* High Scores & Legs */}
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-bold text-white uppercase">Details & High-Scores</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold">LEGS GESAMT</label>
                            <input type="number" value={formData.legs_total} onChange={e => setFormData({ ...formData, legs_total: parseInt(e.target.value) })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold">80+</label>
                            <input type="number" value={formData.cnt_80} onChange={e => setFormData({ ...formData, cnt_80: parseInt(e.target.value) })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold">100+</label>
                            <input type="number" value={formData.cnt_100} onChange={e => setFormData({ ...formData, cnt_100: parseInt(e.target.value) })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold">140+</label>
                            <input type="number" value={formData.cnt_140} onChange={e => setFormData({ ...formData, cnt_140: parseInt(e.target.value) })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold">180</label>
                            <input type="number" value={formData.cnt_180} onChange={e => setFormData({ ...formData, cnt_180: parseInt(e.target.value) })} className={inputClass} />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Speichere...' : success ? <><CheckCircle2 className="w-5 h-5" /> Gespeichert!</> : <><Send className="w-4 h-4" /> Spiel für aktuelle Woche speichern</>}
                </button>
            </form>
        </div>
    );
}
