import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Target, ShieldAlert } from "lucide-react";
import PlayerManualGames from "@/components/PlayerManualGames";

export default async function PlayerHistoryPage(
    props: { params: Promise<{ player_name: string }> }
) {
    const p = await props.params;
    const decodePlayerName = decodeURIComponent(p.player_name);

    const history = await prisma.snapshotPlayerValue.findMany({
        where: { player_name: decodePlayerName },
        include: { snapshot: true },
        orderBy: { snapshot: { timestamp: 'asc' } }
    });

    const veto = await prisma.veto.findFirst({
        where: { player_name: decodePlayerName, active: true }
    });

    if (history.length === 0) {
        return (
            <div className="text-center py-20 text-slate-400">
                <h2 className="text-2xl font-bold text-white mb-4">Spieler nicht gefunden</h2>
                <p>Keine Daten für &quot;{decodePlayerName}&quot; vorhanden.</p>
                <Link href="/" className="text-indigo-400 hover:text-indigo-300 mt-6 inline-block">
                    Zurück zum Dashboard
                </Link>
            </div>
        );
    }

    const latest = history[history.length - 1];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {decodePlayerName}
                        {veto && <span title="Veto Aktiv"><ShieldAlert className="w-6 h-6 text-amber-500" /></span>}
                    </h1>
                    <p className="text-slate-400">{latest.verein} • Letzter Rang: #{latest.rank} • {latest.total_points} Pkt.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* KPI Widget */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-400" />
                        Aktuelle Statistiken ({latest.snapshot.week_id})
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-sm text-slate-400">∅ Average</div>
                            <div className="text-2xl font-black text-white">{latest.avg_total.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                            <div className="text-sm text-slate-400">∅ 9 Darts</div>
                            <div className="text-2xl font-black text-white">{latest.avg_9.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                            <div className="text-sm text-slate-400">Siegquote</div>
                            <div className="text-2xl font-black text-white">{latest.siegequote_pct.toFixed(1)}%</div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                            <div className="text-sm text-slate-400">HighScore/Leg</div>
                            <div className="text-2xl font-black text-white">{latest.avg_high_per_leg.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* History Table Widget */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold mb-4">Wochen-Historie (Deltas)</h3>
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-slate-500 border-b border-slate-800">
                                <tr>
                                    <th className="pb-3 font-medium">Woche</th>
                                    <th className="pb-3 font-medium text-right">Rang</th>
                                    <th className="pb-3 font-medium text-right">Punkte</th>
                                    <th className="pb-3 font-medium text-right">Avg Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {history.slice().reverse().map((h: any, i: number, arr: any[]) => {
                                    const prev = arr[i + 1];
                                    const rankDelta = prev ? prev.rank - h.rank : 0;
                                    const pointsDelta = prev ? h.total_points - prev.total_points : 0;
                                    const avgDelta = prev ? h.avg_total - prev.avg_total : 0;

                                    return (
                                        <tr key={h.id} className="hover:bg-slate-800/30">
                                            <td className="py-3 text-slate-300 font-mono text-xs">{h.snapshot.week_id}</td>
                                            <td className="py-3 text-right text-white">
                                                <div className="flex items-center justify-end gap-1">
                                                    #{h.rank}
                                                    {rankDelta > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : rankDelta < 0 ? <TrendingDown className="w-3 h-3 text-rose-400" /> : null}
                                                </div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <span className="text-indigo-300 font-bold">{h.total_points}</span>
                                                {pointsDelta !== 0 && (
                                                    <span className={`ml-2 text-xs ${pointsDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {pointsDelta > 0 ? '+' : ''}{pointsDelta}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-right">
                                                <span>{h.avg_total.toFixed(2)}</span>
                                                {avgDelta !== 0 && (
                                                    <span className={`ml-2 text-xs ${avgDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(1)}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Match Statistics Widget */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    Aktuelle Match-Statistiken
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Single Spiele</div>
                        <div className="text-3xl font-black text-white">{latest.gespielte_single_spiele}</div>
                    </div>
                    <div className="bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/20">
                        <div className="text-xs text-emerald-400 uppercase tracking-wider font-bold mb-1">Gewonnen</div>
                        <div className="text-3xl font-black text-emerald-400">{latest.wins}</div>
                    </div>
                    <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Gespielte Legs</div>
                        <div className="text-3xl font-black text-white">{latest.gespielte_legs}</div>
                    </div>
                </div>
            </div>

            {/* Manual Games for this player */}
            <PlayerManualGames playerName={decodePlayerName} />

        </div>
    );
}
