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
        cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0, legs_total: 6,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        // In offline mode, send zeros for all stats
        const submitData = offlineMode ? {
            ...formData,
            game1_avg: 0, game1_avg_9: 0, game1_avg_18: 0,
            game2_avg: 0, game2_avg_9: 0, game2_avg_18: 0,
            cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0,
            legs_total: 0,
        } : formData;

        try {
            const res = await fetch('/api/manual-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });
            if (res.ok) {
                setSuccess(true);
                setFormData(prev => ({ ...prev, cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0 }));
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

    // ── Styles ───────────────────────
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
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
    };

    const cardStyle: React.CSSProperties = {
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        borderRadius: '24px',
        padding: '24px',
        position: 'relative',
        zIndex: 1,
        transition: 'all 0.3s ease',
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
        opacity: 0.9
    };

    return (
        <div style={glassStyle}>
            {/* Dynamic Background Glows */}
            <div style={{ ...glowBase, top: '-50px', right: '-50px', width: '250px', height: '250px', background: offlineMode ? 'rgba(251, 146, 60, 0.2)' : 'rgba(56, 189, 248, 0.2)' }} />
            <div style={{ ...glowBase, bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: offlineMode ? 'rgba(234, 88, 12, 0.15)' : 'rgba(139, 92, 246, 0.15)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{
                            background: offlineMode
                                ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                            padding: '12px',
                            borderRadius: '18px',
                            boxShadow: offlineMode
                                ? '0 0 25px rgba(249, 115, 22, 0.5)'
                                : '0 0 25px rgba(14, 165, 233, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.4s ease',
                        }}>
                            <Target size={28} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Offline-Gaming Terminal
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
                                <Clock size={12} /> <span>Wöchentliche manuelle Datenerfassung</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Offline-Mode Toggle ── */}
                    <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        background: offlineMode
                            ? 'rgba(249, 115, 22, 0.1)'
                            : 'rgba(56, 189, 248, 0.06)',
                        border: `1px solid ${offlineMode ? 'rgba(249, 115, 22, 0.3)' : 'rgba(56, 189, 248, 0.15)'}`,
                        borderRadius: '16px',
                        padding: '14px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                    onClick={() => setOfflineMode(!offlineMode)}
                    >
                        {/* Toggle Switch */}
                        <div style={{
                            width: '52px',
                            height: '28px',
                            borderRadius: '14px',
                            background: offlineMode
                                ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                : 'rgba(100, 116, 139, 0.4)',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            flexShrink: 0,
                            boxShadow: offlineMode ? '0 0 15px rgba(249, 115, 22, 0.4)' : 'none',
                        }}>
                            <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: '#fff',
                                position: 'absolute',
                                top: '3px',
                                left: offlineMode ? '27px' : '3px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {offlineMode ? <WifiOff size={16} color="#f97316" /> : <Wifi size={16} color="#64748b" />}
                            <span style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: offlineMode ? '#fb923c' : '#94a3b8',
                                transition: 'color 0.3s ease',
                            }}>
                                {offlineMode ? 'Offline-Modus — Nur Ergebnis (Sieg/Niederlage)' : 'Standard-Modus — Alle Statistiken eingeben'}
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Player Identity Section */}
                    <div style={cardStyle}>
                        <label style={labelStyle}><UserIcon size={14} /> Spieler-Identität</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={formData.player_name}
                                onChange={e => set('player_name', e.target.value)}
                                style={inputGlassStyle}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)'}
                            >
                                {ALLOWED_NAMES.map(name => <option key={name} value={name} style={{ background: '#0f172a' }}>{name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                            <div>
                                <label style={{ ...labelStyle, marginBottom: '6px' }}>📅 Datum</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => set('date', e.target.value)}
                                    style={inputGlassStyle}
                                />
                            </div>
                            <div>
                                <label style={{ ...labelStyle, marginBottom: '6px' }}>⚔️ Begegnung</label>
                                <input
                                    type="text"
                                    value={formData.begegnung}
                                    onChange={e => set('begegnung', e.target.value)}
                                    placeholder="z.B. vs. DC Wettmershagen A"
                                    style={inputGlassStyle}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══ OFFLINE MODE: Simplified result-only cards ═══ */}
                    {offlineMode ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            {/* Game 1 - Result Only */}
                            <div style={{
                                ...cardStyle,
                                borderTop: '4px solid #fbbf24',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '20px',
                                paddingTop: '28px',
                                paddingBottom: '28px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '6px', borderRadius: '8px' }}>
                                        <Trophy size={18} color="#fbbf24" strokeWidth={2.5} />
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24' }}>Primär-Match</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => set('game1_win', !formData.game1_win)}
                                    style={{
                                        padding: '20px 40px', borderRadius: '20px', fontSize: '18px', fontWeight: 900, cursor: 'pointer',
                                        border: '2px solid', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        borderColor: formData.game1_win ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                                        background: formData.game1_win ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: formData.game1_win ? '#4ade80' : '#f87171',
                                        boxShadow: formData.game1_win ? '0 0 30px rgba(34, 197, 94, 0.3)' : '0 0 30px rgba(239, 68, 68, 0.3)',
                                        letterSpacing: '0.1em',
                                        width: '100%',
                                        maxWidth: '220px',
                                    }}
                                >
                                    {formData.game1_win ? '✓ SIEG' : '✗ NIEDERLAGE'}
                                </button>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>Klicken zum Umschalten</span>
                            </div>

                            {/* Game 2 - Result Only */}
                            <div style={{
                                ...cardStyle,
                                borderTop: '4px solid #38bdf8',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '20px',
                                paddingTop: '28px',
                                paddingBottom: '28px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '6px', borderRadius: '8px' }}>
                                        <Trophy size={18} color="#38bdf8" strokeWidth={2.5} />
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>Sekundär-Match</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => set('game2_win', !formData.game2_win)}
                                    style={{
                                        padding: '20px 40px', borderRadius: '20px', fontSize: '18px', fontWeight: 900, cursor: 'pointer',
                                        border: '2px solid', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        borderColor: formData.game2_win ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                                        background: formData.game2_win ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: formData.game2_win ? '#4ade80' : '#f87171',
                                        boxShadow: formData.game2_win ? '0 0 30px rgba(34, 197, 94, 0.3)' : '0 0 30px rgba(239, 68, 68, 0.3)',
                                        letterSpacing: '0.1em',
                                        width: '100%',
                                        maxWidth: '220px',
                                    }}
                                >
                                    {formData.game2_win ? '✓ SIEG' : '✗ NIEDERLAGE'}
                                </button>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>Klicken zum Umschalten</span>
                            </div>
                        </div>
                    ) : (
                        /* ═══ STANDARD MODE: Full statistics entry ═══ */
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                                {/* Game 1 Module */}
                                <div style={{ ...cardStyle, borderTop: '4px solid #fbbf24' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '6px', borderRadius: '8px' }}>
                                                <Trophy size={18} color="#fbbf24" strokeWidth={2.5} />
                                            </div>
                                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#fbbf24' }}>Primär-Match</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => set('game1_win', !formData.game1_win)}
                                            style={{
                                                padding: '8px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
                                                border: '1px solid', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                borderColor: formData.game1_win ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                                                background: formData.game1_win ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: formData.game1_win ? '#4ade80' : '#f87171',
                                                boxShadow: formData.game1_win ? '0 0 20px rgba(34, 197, 94, 0.2)' : '0 0 20px rgba(239, 68, 68, 0.2)',
                                            }}
                                        >
                                            {formData.game1_win ? 'WINNER' : 'DEFEAT'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>∅ AVERAGE TOTAL</label>
                                                <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 800 }}>Darts ges.</span>
                                            </div>
                                            <input type="number" step="0.01" value={formData.game1_avg} onChange={e => set('game1_avg', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', display: 'block' }}>K2 — AVG 9-DART</label>
                                            <input type="number" step="0.01" value={formData.game1_avg_9} onChange={e => set('game1_avg_9', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', display: 'block' }}>K3 — AVG 18-DART</label>
                                            <input type="number" step="0.01" value={formData.game1_avg_18} onChange={e => set('game1_avg_18', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        </div>
                                    </div>
                                </div>

                                {/* Game 2 Module */}
                                <div style={{ ...cardStyle, borderTop: '4px solid #38bdf8' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '6px', borderRadius: '8px' }}>
                                                <Trophy size={18} color="#38bdf8" strokeWidth={2.5} />
                                            </div>
                                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>Sekundär-Match</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => set('game2_win', !formData.game2_win)}
                                            style={{
                                                padding: '8px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 900, cursor: 'pointer',
                                                border: '1px solid', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                borderColor: formData.game2_win ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                                                background: formData.game2_win ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: formData.game2_win ? '#4ade80' : '#f87171',
                                                boxShadow: formData.game2_win ? '0 0 20px rgba(34, 197, 94, 0.2)' : '0 0 20px rgba(239, 68, 68, 0.2)',
                                            }}
                                        >
                                            {formData.game2_win ? 'WINNER' : 'DEFEAT'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>∅ AVERAGE TOTAL</label>
                                                <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 800 }}>Darts ges.</span>
                                            </div>
                                            <input type="number" step="0.01" value={formData.game2_avg} onChange={e => set('game2_avg', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', display: 'block' }}>K2 — AVG 9-DART</label>
                                            <input type="number" step="0.01" value={formData.game2_avg_9} onChange={e => set('game2_avg_9', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, marginBottom: '6px', display: 'block' }}>K3 — AVG 18-DART</label>
                                            <input type="number" step="0.01" value={formData.game2_avg_18} onChange={e => set('game2_avg_18', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Aggregation Module */}
                            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(30, 41, 59, 0.4))' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                    <div style={{ background: 'rgba(167, 139, 250, 0.15)', padding: '8px', borderRadius: '10px' }}>
                                        <BarChart3 size={18} color="#a78bfa" />
                                    </div>
                                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#a78bfa' }}>High-Score Aggregation (K5)</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', display: 'block', fontWeight: 800, textAlign: 'center' }}>LEGS TOTAL</label>
                                        <input type="number" value={formData.legs_total} onChange={e => set('legs_total', parseInt(e.target.value) || 0)} style={{ ...inputGlassStyle, textAlign: 'center', color: '#a78bfa', fontWeight: 700 }} />
                                    </div>
                                    {['80+', '100+', '140+', '180'].map((label, i) => {
                                        const keys = ['cnt_80', 'cnt_100', 'cnt_140', 'cnt_180'] as const;
                                        const key = keys[i];
                                        return (
                                            <div key={label}>
                                                <label style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px', display: 'block', fontWeight: 800, textAlign: 'center' }}>{label}</label>
                                                <input
                                                    type="number"
                                                    value={formData[key]}
                                                    onChange={e => set(key, parseInt(e.target.value) || 0)}
                                                    style={{ ...inputGlassStyle, textAlign: 'center', borderStyle: 'dashed' }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Info Banner for Offline Mode */}
                    {offlineMode && (
                        <div style={{
                            background: 'rgba(249, 115, 22, 0.08)',
                            border: '1px solid rgba(249, 115, 22, 0.2)',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: '#fb923c',
                            fontSize: '13px',
                        }}>
                            <Info size={18} style={{ flexShrink: 0 }} />
                            <span>
                                <strong>Offline-Modus aktiv:</strong> Averages, High-Scores und Legs werden mit 0 gespeichert.
                                Nur Sieg/Niederlage fließt in die Kategorie K4 (Siegquote) ein.
                            </span>
                        </div>
                    )}

                    {/* Submit Action Block */}
                    <div style={{ marginTop: '12px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '20px',
                                borderRadius: '20px',
                                border: 'none',
                                background: success
                                    ? 'linear-gradient(135deg, #059669, #10b981)'
                                    : offlineMode
                                        ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                        : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                                color: 'white',
                                fontSize: '17px',
                                fontWeight: 900,
                                cursor: loading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                boxShadow: success
                                    ? '0 10px 40px rgba(16, 185, 129, 0.4)'
                                    : offlineMode
                                        ? '0 15px 40px rgba(249, 115, 22, 0.3)'
                                        : '0 15px 40px rgba(14, 165, 233, 0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                }
                            }}
                        >
                            {loading ? (
                                <>⏳ ÜBERMITTELN...</>
                            ) : success ? (
                                <><CheckCircle2 size={22} /> DATEN ERFOLGREICH GESPEICHERT</>
                            ) : (
                                <><Save size={22} /> {offlineMode ? 'OFFLINE-ERGEBNIS EINSPEISEN' : 'STATS IN RANKING EINSPEISEN'}</>
                            )}
                        </button>

                        {success && (
                            <div style={{
                                marginTop: '16px',
                                textAlign: 'center',
                                color: '#10b981',
                                fontSize: '14px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                animation: 'pulse 2s infinite'
                            }}>
                                <Info size={16} /> <span>Änderungen werden beim nächsten automatischen Update aktiv.</span>
                            </div>
                        )}
                    </div>

                </form>
            </div>

            {/* Footer Info */}
            <div style={{
                marginTop: '40px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(56, 189, 248, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: 0.6,
                fontSize: '11px',
                fontWeight: 600,
                color: '#94a3b8'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={12} color="#38bdf8" /> © copyright by Sebastian Kirste
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>v2.1 OFFLINE MODE</span>
                    <span>ADMIN TERMINAL</span>
                </div>
            </div>
        </div>
    );
}
