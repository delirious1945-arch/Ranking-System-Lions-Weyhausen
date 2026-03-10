'use client';

import { useState, useEffect } from 'react';
import { PenLine } from 'lucide-react';

interface ManualGame {
    id: number;
    player_name: string;
    begegnung: string;
    date: string;
    game1_avg: number;
    game1_win: boolean;
    game2_avg: number;
    game2_win: boolean;
    cnt_80: number;
    cnt_100: number;
    cnt_140: number;
    cnt_180: number;
    legs_total: number;
    week_id: string;
}

export default function ManualGamesSection() {
    const [games, setGames] = useState<ManualGame[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/manual-games')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setGames(data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null;
    if (games.length === 0) return null;

    return (
        <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <PenLine size={14} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8' }}>
                    Manuell Erfasste Spiele
                </span>
                <div style={{ height: 1, flex: 1, background: 'rgba(56, 189, 248, 0.2)' }} />
                <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{games.length} Einträge</span>
            </div>
            <div style={{
                borderRadius: 12,
                border: '1px solid rgba(56, 189, 248, 0.15)',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.05)'
            }}>
                <table className="dart-table">
                    <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Spieler</th>
                            <th className="hide-mobile">Begegnung</th>
                            <th style={{ textAlign: 'center' }}>Spiel 1</th>
                            <th style={{ textAlign: 'center' }}>Spiel 2</th>
                            <th className="hide-mobile" style={{ textAlign: 'right' }}>High-Scores</th>
                            <th style={{ textAlign: 'right' }}>Legs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map(g => {
                            const dateStr = new Date(g.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
                            return (
                                <tr key={g.id}>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{dateStr}</td>
                                    <td style={{ fontSize: 13, fontWeight: 600 }}>{g.player_name}</td>
                                    <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{g.begegnung || '—'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            fontSize: 12, fontWeight: 700,
                                            color: g.game1_win ? '#22c55e' : '#ef4444'
                                        }}>
                                            {g.game1_avg.toFixed(1)} {g.game1_win ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            fontSize: 12, fontWeight: 700,
                                            color: g.game2_win ? '#22c55e' : '#ef4444'
                                        }}>
                                            {g.game2_avg.toFixed(1)} {g.game2_win ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td className="hide-mobile" style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-dim)' }}>
                                        {g.cnt_80 > 0 && <span style={{ marginRight: 4 }}>80+:{g.cnt_80}</span>}
                                        {g.cnt_100 > 0 && <span style={{ marginRight: 4 }}>100+:{g.cnt_100}</span>}
                                        {g.cnt_140 > 0 && <span style={{ marginRight: 4 }}>140+:{g.cnt_140}</span>}
                                        {g.cnt_180 > 0 && <span>180:{g.cnt_180}</span>}
                                        {(g.cnt_80 + g.cnt_100 + g.cnt_140 + g.cnt_180) === 0 && '—'}
                                    </td>
                                    <td style={{ textAlign: 'right', fontSize: 12, fontWeight: 600 }}>{g.legs_total}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
