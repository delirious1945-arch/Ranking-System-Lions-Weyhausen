'use client';

import { useState, useEffect } from 'react';
import { PenLine, Trash2 } from 'lucide-react';

interface ManualGame {
    id: number;
    player_name: string;
    begegnung: string;
    date: string;
    game1_avg: number;
    game1_avg_9: number;
    game1_avg_18: number;
    game1_win: boolean;
    game2_avg: number;
    game2_avg_9: number;
    game2_avg_18: number;
    game2_win: boolean;
    cnt_80: number;
    cnt_100: number;
    cnt_140: number;
    cnt_180: number;
    legs_total: number;
    week_id: string;
}

interface Props {
    playerName: string;
}

export default function PlayerManualGames({ playerName }: Props) {
    const [games, setGames] = useState<ManualGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        // Check admin status - key must match NameGate's STORAGE_KEY
        const authName = localStorage.getItem('lions-auth-name');
        if (authName === 'Sebastian Kirste') {
            setIsAdmin(true);
        }

        fetch('/api/manual-games')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter to only this player's games
                    setGames(data.filter((g: ManualGame) => g.player_name === playerName));
                }
            })
            .finally(() => setLoading(false));
    }, [playerName]);

    const handleDelete = async (id: number) => {
        if (!confirm('Diesen manuellen Eintrag wirklich löschen?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/manual-game/delete?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setGames(prev => prev.filter(g => g.id !== id));
            } else {
                alert('Fehler beim Löschen.');
            }
        } catch {
            alert('Netzwerkfehler.');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return null;
    if (games.length === 0) return null;

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 0 30px rgba(56, 189, 248, 0.05)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '6px',
                    borderRadius: '8px'
                }}>
                    <PenLine size={16} color="#38bdf8" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    Manuell Erfasste Spiele
                </h3>
                <span style={{
                    fontSize: 11,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontWeight: 700,
                }}>
                    {games.length} {games.length === 1 ? 'Eintrag' : 'Einträge'}
                </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Datum</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Begegnung</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#fbbf24', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spiel 1</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#38bdf8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spiel 2</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>High-Scores</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legs</th>
                            {isAdmin && (
                                <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#94a3b8', fontSize: 11, width: 48 }}></th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {games.map(g => {
                            const dateStr = new Date(g.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
                            const highTotal = g.cnt_80 + g.cnt_100 + g.cnt_140 + g.cnt_180;
                            return (
                                <tr key={g.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.07)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.03)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '10px 12px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{dateStr}</td>
                                    <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>{g.begegnung || '—'}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: g.game1_win ? '#22c55e' : '#ef4444',
                                            background: g.game1_win ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            padding: '3px 10px',
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}>
                                            {g.game1_avg.toFixed(1)} {g.game1_win ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: g.game2_win ? '#22c55e' : '#ef4444',
                                            background: g.game2_win ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            padding: '3px 10px',
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}>
                                            {g.game2_avg.toFixed(1)} {g.game2_win ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b', fontSize: 11 }}>
                                        {highTotal > 0 ? (
                                            <span>
                                                {g.cnt_80 > 0 && <span style={{ marginRight: 4 }}>80+:{g.cnt_80}</span>}
                                                {g.cnt_100 > 0 && <span style={{ marginRight: 4 }}>100+:{g.cnt_100}</span>}
                                                {g.cnt_140 > 0 && <span style={{ marginRight: 4 }}>140+:{g.cnt_140}</span>}
                                                {g.cnt_180 > 0 && <span>180:{g.cnt_180}</span>}
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#e2e8f0' }}>{g.legs_total}</td>
                                    {isAdmin && (
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleDelete(g.id)}
                                                disabled={deleting === g.id}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    borderRadius: 8,
                                                    padding: '6px',
                                                    cursor: deleting === g.id ? 'wait' : 'pointer',
                                                    color: '#ef4444',
                                                    transition: 'all 0.2s',
                                                    opacity: deleting === g.id ? 0.5 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                                title="Eintrag löschen"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
