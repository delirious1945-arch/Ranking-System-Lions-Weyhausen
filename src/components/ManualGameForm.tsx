'use client';

import { useState } from 'react';
import { Target, Trophy, Info, Save, User as UserIcon, Zap, CheckCircle2, BarChart3, Clock, Wifi, WifiOff } from 'lucide-react';

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
    const [offlineMode, setOfflineMode] = useState(false);
    const [formData, setFormData] = useState({
        player_name: ALLOWED_NAMES[0],
        begegnung: '',
        date: new Date().toISOString().split('T')[0],
        game1_avg: 40, game1_avg_9: 40, game1_avg_18: 40, game1_win: true,
        game2_avg: 40, game2_avg_9: 40, game2_avg_18: 40, game2_win: true,
        cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0, 
        legs_total: 6,
        legs_won: 3,
        legs_lost: 1,
        is_offline: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        const submitData = {
            ...formData,
            is_offline: offlineMode,
            // If offline, we don't care about averages/highscores but they are sent as 0
            // The server/scoring logic will ignore them because of is_offline: true
        };

        try {
            const res = await fetch('/api/manual-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });
            if (res.ok) {
                setSuccess(true);
                // Reset some fields
                setFormData(prev => ({ 
                    ...prev, 
                    cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0,
                    begegnung: '' 
                }));
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert('Fehler beim Speichern.');
            }
        } catch {
            alert('Netzwerkfehler');
        } finally {
            setLoading(false);
        }
    };

    const set = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

    // ── Styles (Matching Dashboard Design) ───────────────────────
    const glassStyle: React.CSSProperties = {
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '32px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.05)',
        color: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px',
    };

    const glowBase: React.CSSProperties = {
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none',
    };

    const inputGlassStyle: React.CSSProperties = {
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '16px',
        padding: '14px 20px',
        color: '#fff',
        fontSize: '15px',
        outline: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        boxSizing: 'border-box',
    };

    const cardStyle: React.CSSProperties = {
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        borderRadius: '24px',
        padding: '24px',
        position: 'relative',
        zIndex: 1,
    };

    const labelStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        fontWeight: 800,
        color: '#38bdf8',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '10px',
    };

    return (
        <div style={glassStyle}>
            {/* Background Glows */}
            <div style={{ ...glowBase, top: '-50px', right: '-50px', width: '250px', height: '250px', background: offlineMode ? 'rgba(251, 146, 60, 0.2)' : 'rgba(56, 189, 248, 0.2)' }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ 
                            background: offlineMode ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                            padding: '12px', borderRadius: '18px', 
                            boxShadow: offlineMode ? '0 0 25px rgba(249, 115, 22, 0.5)' : '0 0 25px rgba(14, 165, 233, 0.5)'
                        }}>
                            <Target size={28} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0, color: '#fff' }}>Offline-Gaming Terminal</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px' }}>
                                <Clock size={12} /> <span>Manuelle Datenerfassung</span>
                            </div>
                        </div>
                    </div>

                    {/* Offline Toggle */}
                    <div 
                        onClick={() => setOfflineMode(!offlineMode)}
                        style={{
                            marginTop: '20px', padding: '12px 20px', borderRadius: '16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: offlineMode ? 'rgba(249, 115, 22, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                            border: `1px solid ${offlineMode ? 'rgba(249, 115, 22, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ 
                            width: '40px', height: '20px', borderRadius: '10px', background: offlineMode ? '#f97316' : '#64748b',
                            position: 'relative', transition: 'all 0.3s ease'
                        }}>
                            <div style={{ 
                                width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                                position: 'absolute', top: '3px', left: offlineMode ? '23px' : '3px',
                                transition: 'all 0.3s ease'
                            }} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '12px', color: offlineMode ? '#f97316' : '#94a3b8' }}>
                            {offlineMode ? 'OFFLINE MODUS AKTIV (STATS WERDEN IGNORIERT)' : 'STANDARD MODUS (VOLLSTÄNDIGE STATS)'}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Common Identity Fields */}
                    <div style={cardStyle}>
                        <label style={labelStyle}><UserIcon size={14} /> Spieler & Details</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px' }}>
                            <select value={formData.player_name} onChange={e => set('player_name', e.target.value)} style={inputGlassStyle}>
                                {ALLOWED_NAMES.map(n => <option key={n} value={n} style={{ background: '#0f172a' }}>{n}</option>)}
                            </select>
                            <input type="date" value={formData.date} onChange={e => set('date', e.target.value)} style={inputGlassStyle} />
                            <input type="text" placeholder="Gegner" value={formData.begegnung} onChange={e => set('begegnung', e.target.value)} style={inputGlassStyle} />
                        </div>
                    </div>

                    {offlineMode ? (
                        /* OFFLINE INTERFACE */
                        <div style={{ ...cardStyle, borderTop: '4px solid #f97316', textAlign: 'center' }}>
                            <label style={{ ...labelStyle, justifyContent: 'center' }}><Trophy size={14} /> Spielstand & Ergebnis</label>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', margin: '20px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8' }}>SPIELER</span>
                                    <input 
                                        type="number" value={formData.legs_won} 
                                        onChange={e => set('legs_won', parseInt(e.target.value) || 0)} 
                                        style={{ ...inputGlassStyle, width: '80px', fontSize: '32px', textAlign: 'center', fontWeight: 900 }} 
                                    />
                                </div>
                                <span style={{ fontSize: '48px', fontWeight: 100, color: '#334155' }}>:</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8' }}>GEGNER</span>
                                    <input 
                                        type="number" value={formData.legs_lost} 
                                        onChange={e => set('legs_lost', parseInt(e.target.value) || 0)} 
                                        style={{ ...inputGlassStyle, width: '80px', fontSize: '32px', textAlign: 'center', fontWeight: 900 }} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                <button 
                                    type="button" onClick={() => set('game1_win', true)}
                                    style={{ 
                                        padding: '16px 32px', borderRadius: '16px', border: 'none', fontWeight: 900, cursor: 'pointer',
                                        background: formData.game1_win ? '#22c55e' : 'rgba(34, 197, 94, 0.1)',
                                        color: formData.game1_win ? '#fff' : '#22c55e',
                                        boxShadow: formData.game1_win ? '0 0 20px rgba(34, 197, 94, 0.4)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >✓ SIEG</button>
                                <button 
                                    type="button" onClick={() => set('game1_win', false)}
                                    style={{ 
                                        padding: '16px 32px', borderRadius: '16px', border: 'none', fontWeight: 900, cursor: 'pointer',
                                        background: !formData.game1_win ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                                        color: !formData.game1_win ? '#fff' : '#ef4444',
                                        boxShadow: !formData.game1_win ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >✗ NIEDERLAGE</button>
                            </div>
                        </div>
                    ) : (
                        /* STANDARD INTERFACE (Existing but improved) */
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ ...cardStyle, borderTop: '4px solid #fbbf24' }}>
                                    <label style={labelStyle}>Match 1 Averages</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input type="number" step="0.01" placeholder="AVG Total" value={formData.game1_avg} onChange={e => set('game1_avg', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        <input type="number" step="0.01" placeholder="AVG 9-Dart" value={formData.game1_avg_9} onChange={e => set('game1_avg_9', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        <input type="number" step="0.01" placeholder="AVG 18-Dart" value={formData.game1_avg_18} onChange={e => set('game1_avg_18', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        <button type="button" onClick={() => set('game1_win', !formData.game1_win)} style={{ padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 800, background: formData.game1_win ? '#22c55e' : '#ef4444', color: '#fff' }}>
                                            {formData.game1_win ? 'GEWONNEN' : 'VERLOREN'}
                                        </button>
                                    </div>
                                </div>
                                <div style={{ ...cardStyle, borderTop: '4px solid #38bdf8' }}>
                                    <label style={labelStyle}>Match 2 Averages</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input type="number" step="0.01" placeholder="AVG Total" value={formData.game2_avg} onChange={e => set('game2_avg', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        <input type="number" step="0.01" placeholder="AVG 9-Dart" value={formData.game2_avg_9} onChange={e => set('game2_avg_9', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        <input type="number" step="0.01" placeholder="AVG 18-Dart" value={formData.game2_avg_18} onChange={e => set('game2_avg_18', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        <button type="button" onClick={() => set('game2_win', !formData.game2_win)} style={{ padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 800, background: formData.game2_win ? '#22c55e' : '#ef4444', color: '#fff' }}>
                                            {formData.game2_win ? 'GEWONNEN' : 'VERLOREN'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div style={cardStyle}>
                                <label style={labelStyle}><BarChart3 size={14} /> High-Scores & Legs</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                    {['cnt_80', 'cnt_100', 'cnt_140', 'cnt_180', 'legs_total'].map(k => (
                                        <div key={k} style={{ textAlign: 'center' }}>
                                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#64748b' }}>{k.toUpperCase()}</span>
                                            <input type="number" value={(formData as any)[k]} onChange={e => set(k, parseInt(e.target.value) || 0)} style={{ ...inputGlassStyle, textAlign: 'center' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" disabled={loading}
                        style={{ 
                            padding: '24px', borderRadius: '24px', border: 'none', fontSize: '18px', fontWeight: 900, cursor: loading ? 'wait' : 'pointer',
                            background: success ? '#22c55e' : 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)', transition: 'all 0.3s ease'
                        }}
                    >
                        {loading ? 'SPEICHERT...' : success ? 'ERFOLGREICH!' : 'SPIEL SPEICHERN'}
                    </button>
                </form>
            </div>
        </div>
    );
}
