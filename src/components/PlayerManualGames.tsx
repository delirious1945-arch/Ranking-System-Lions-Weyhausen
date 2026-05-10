'use client';

import { useState, useEffect } from 'react';
import { PenLine, Trash2, X, Save } from 'lucide-react';

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
    is_offline?: boolean;
    legs_won?: number;
    legs_lost?: number;
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
    const [editingGame, setEditingGame] = useState<ManualGame | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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
                    // Filter to only this player's games - use trim() for safety
                    const targetName = playerName.trim().toLowerCase();
                    setGames(data.filter((g: ManualGame) => 
                        g.player_name.trim().toLowerCase() === targetName
                    ));
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

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGame) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/manual-game/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingGame)
            });
            if (res.ok) {
                const data = await res.json();
                setGames(prev => prev.map(g => g.id === data.game.id ? data.game : g));
                setEditingGame(null);
            } else {
                alert('Fehler beim Speichern');
            }
        } catch {
            alert('Netzwerkfehler');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return null;
    
    // Don't hide completely if no games, but keep it clean
    if (games.length === 0) {
        return (
            <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(56, 189, 248, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px'
            }}>
                Keine manuell erfassten Spiele für diesen Spieler gefunden.
            </div>
        );
    }

    const inputStyle = {
        background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)',
        padding: '8px 12px', borderRadius: 8, color: '#f0f2f5', width: '100%', fontSize: 13
    };
    const labelStyle = { display: 'block', fontSize: 11, color: '#8b949e', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const };
    const groupStyle = { background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 };

    return (
        <>
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
                                <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#fbbf24', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {games.some(g => g.is_offline) ? 'Ergebnis / Stats' : 'Spiel 1'}
                                </th>
                                <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#38bdf8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {games.some(g => g.is_offline) ? 'Details' : 'Spiel 2'}
                                </th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>High-Scores</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legs</th>
                                {isAdmin && (
                                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#94a3b8', fontSize: 11, width: 80 }}>Aktion</th>
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
                                            {g.is_offline ? (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                                    <span style={{
                                                        background: 'rgba(249, 115, 22, 0.1)',
                                                        color: '#f97316',
                                                        fontSize: '10px',
                                                        fontWeight: 900,
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        border: '1px solid rgba(249, 115, 22, 0.2)'
                                                    }}>OFFLINE</span>
                                                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>
                                                        {g.legs_won} : {g.legs_lost}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
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
                                                    {(g.game1_avg_9 > 0 || g.game1_avg_18 > 0) && (
                                                        <span style={{ fontSize: 10, color: '#64748b' }}>
                                                            {g.game1_avg_9 > 0 && `9: ${g.game1_avg_9.toFixed(1)} `}
                                                            {g.game1_avg_18 > 0 && `| 18: ${g.game1_avg_18.toFixed(1)}`}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                            {g.is_offline ? (
                                                <span style={{ 
                                                    color: g.legs_won! > g.legs_lost! ? '#22c55e' : '#ef4444',
                                                    fontWeight: 800, fontSize: '12px'
                                                }}>
                                                    {g.legs_won! > g.legs_lost! ? '✓ SIEG' : '✗ NIEDERLAGE'}
                                                </span>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
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
                                                    {(g.game2_avg_9 > 0 || g.game2_avg_18 > 0) && (
                                                        <span style={{ fontSize: 10, color: '#64748b' }}>
                                                            {g.game2_avg_9 > 0 && `9: ${g.game2_avg_9.toFixed(1)} `}
                                                            {g.game2_avg_18 > 0 && `| 18: ${g.game2_avg_18.toFixed(1)}`}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
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
                                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => setEditingGame({ ...g })}
                                                        style={{
                                                            background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                                                            borderRadius: 8, padding: '6px', cursor: 'pointer', color: '#38bdf8',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                        title="Eintrag bearbeiten"
                                                    >
                                                        <PenLine size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(g.id)}
                                                        disabled={deleting === g.id}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            borderRadius: 8, padding: '6px',
                                                            cursor: deleting === g.id ? 'wait' : 'pointer', color: '#ef4444',
                                                            opacity: deleting === g.id ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}
                                                        title="Eintrag löschen"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal (Portal) */}
            {editingGame && typeof document !== 'undefined' && require('react-dom').createPortal(
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div style={{
                        background: '#13161e', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 16,
                        width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.1)'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: 18, color: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <PenLine size={18} color="#38bdf8" />
                                Eintrag bearbeiten
                            </h2>
                            <button onClick={() => setEditingGame(null)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 8 }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto' }}>
                            <form id="edit-game-form" onSubmit={handleSaveEdit}>
                                {/* Meta */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div>
                                        <label style={labelStyle}>Datum</label>
                                        <input type="date" value={editingGame.date.split('T')[0]} onChange={e => setEditingGame({ ...editingGame, date: new Date(e.target.value).toISOString() })} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Begegnung</label>
                                        <input type="text" value={editingGame.begegnung} onChange={e => setEditingGame({ ...editingGame, begegnung: e.target.value })} style={inputStyle} required />
                                    </div>
                                </div>

                                {/* Game 1 */}
                                <div style={{ ...groupStyle, borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                                    <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#fbbf24', display: 'flex', justifyContent: 'space-between' }}>
                                        Spiel 1
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={editingGame.game1_win} onChange={e => setEditingGame({ ...editingGame, game1_win: e.target.checked })} />
                                            Sieg
                                        </label>
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                        <div><label style={labelStyle}>Avg</label><input type="number" step="0.01" value={editingGame.game1_avg} onChange={e => setEditingGame({ ...editingGame, game1_avg: Number(e.target.value) })} style={inputStyle} /></div>
                                        <div><label style={labelStyle}>9-Dart Avg</label><input type="number" step="0.01" value={editingGame.game1_avg_9} onChange={e => setEditingGame({ ...editingGame, game1_avg_9: Number(e.target.value) })} style={inputStyle} /></div>
                                        <div><label style={labelStyle}>18-Dart Avg</label><input type="number" step="0.01" value={editingGame.game1_avg_18} onChange={e => setEditingGame({ ...editingGame, game1_avg_18: Number(e.target.value) })} style={inputStyle} /></div>
                                    </div>
                                </div>

                                {/* Game 2 */}
                                <div style={{ ...groupStyle, borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                    <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#38bdf8', display: 'flex', justifyContent: 'space-between' }}>
                                        Spiel 2
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={editingGame.game2_win} onChange={e => setEditingGame({ ...editingGame, game2_win: e.target.checked })} />
                                            Sieg
                                        </label>
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                        <div><label style={labelStyle}>Avg</label><input type="number" step="0.01" value={editingGame.game2_avg} onChange={e => setEditingGame({ ...editingGame, game2_avg: Number(e.target.value) })} style={inputStyle} /></div>
                                        <div><label style={labelStyle}>9-Dart Avg</label><input type="number" step="0.01" value={editingGame.game2_avg_9} onChange={e => setEditingGame({ ...editingGame, game2_avg_9: Number(e.target.value) })} style={inputStyle} /></div>
                                        <div><label style={labelStyle}>18-Dart Avg</label><input type="number" step="0.01" value={editingGame.game2_avg_18} onChange={e => setEditingGame({ ...editingGame, game2_avg_18: Number(e.target.value) })} style={inputStyle} /></div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div style={groupStyle}>
                                    <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#f0f2f5' }}>High-Scores & Legs</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
                                        <div><label style={labelStyle}>80+</label><input type="number" value={editingGame.cnt_80} onChange={e => setEditingGame({ ...editingGame, cnt_80: Number(e.target.value) })} style={inputStyle} /></div>
                                        <div><label style={labelStyle}>100+</label><input type="number" value={editingGame.cnt_100} onChange={e => setEditingGame({ ...editingGame, cnt_100: Number(e.target.value) })} style={inputStyle} /></div>
                                        <div><label style={labelStyle}>140+</label><input type="number" value={editingGame.cnt_140} onChange={e => setEditingGame({ ...editingGame, cnt_140: Number(e.target.value) })} style={inputStyle} /></div>
                                        <div><label style={labelStyle}>180</label><input type="number" value={editingGame.cnt_180} onChange={e => setEditingGame({ ...editingGame, cnt_180: Number(e.target.value) })} style={inputStyle} /></div>
                                        <div><label style={labelStyle}>Legs</label><input type="number" value={editingGame.legs_total} onChange={e => setEditingGame({ ...editingGame, legs_total: Number(e.target.value) })} style={inputStyle} /></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button onClick={() => setEditingGame(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                                Abbrechen
                            </button>
                            <button form="edit-game-form" type="submit" disabled={isSaving} style={{ background: '#38bdf8', color: '#0b0d11', border: 'none', padding: '8px 24px', borderRadius: 8, cursor: isSaving ? 'wait' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, opacity: isSaving ? 0.7 : 1 }}>
                                <Save size={16} />
                                {isSaving ? 'Speichert...' : 'Speichern'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
