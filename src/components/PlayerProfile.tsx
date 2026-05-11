import React from 'react';
import { Target, TrendingUp, TrendingDown, Minus, Shield } from 'lucide-react';

interface MatchStats {
  singleWins: number;
  singleTotal: number;
  doubleWins: number;
  doubleTotal: number;
}

interface PlayerProfileProps {
  playerName: string;
  hinrunde: MatchStats;
  rueckrunde: MatchStats;
  trend: boolean[];
  highFinish: number;
  total180s: number;
}

const StatCard = ({ title, stats, colorClass }: { title: string, stats: MatchStats, colorClass: string }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-lg">
    <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${colorClass}`}>{title}</h4>
    <div className="space-y-4">
      <div>
        <div className="text-xs text-slate-500 mb-1">Einzel-Siege</div>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-black text-white">{stats.singleWins}</div>
          <div className="text-sm text-slate-400 pb-1">von {stats.singleTotal}</div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${colorClass === 'text-emerald-400' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${stats.singleTotal > 0 ? (stats.singleWins / stats.singleTotal) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div>
        <div className="text-xs text-slate-500 mb-1">Doppel-Siege</div>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-black text-white">{stats.doubleWins}</div>
          <div className="text-sm text-slate-400 pb-1">von {stats.doubleTotal}</div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${colorClass === 'text-emerald-400' ? 'bg-emerald-400/60' : 'bg-indigo-400/60'}`}
            style={{ width: `${stats.doubleTotal > 0 ? (stats.doubleWins / stats.doubleTotal) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);

export default function PlayerProfile({ playerName, hinrunde, rueckrunde, trend, highFinish, total180s }: PlayerProfileProps) {
  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Saison-Leistungsbericht</h2>
          <p className="text-slate-400 text-sm">Zusammenfassung der erfassten Punktspiele für {playerName}</p>
        </div>
        
        {/* Trend Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest vertical-text hidden sm:block">Trend</div>
          <div className="flex gap-2">
            {trend.length === 0 ? (
              <div className="text-slate-500 text-xs italic">Keine Spieldaten für Trend</div>
            ) : (
              trend.map((won, i) => (
                <div 
                  key={i} 
                  title={won ? "Sieg" : "Niederlage"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-transform hover:scale-110 shadow-lg ${
                    won 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                  }`}
                >
                  {won ? 'W' : 'L'}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bestleistungen removed */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Hinrunde (Spieltag 1-9)" stats={hinrunde} colorClass="text-indigo-400" />
        <StatCard title="Rückrunde (Spieltag 10+)" stats={rueckrunde} colorClass="text-emerald-400" />
      </div>
    </div>
  );
}
