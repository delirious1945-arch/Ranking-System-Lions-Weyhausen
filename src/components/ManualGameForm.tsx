'use client';

import { useState } from 'react';
import { Target, Trophy, Info, Save, User as UserIcon, List, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

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
        game1_avg: 40, game1_avg_9: 40, game1_avg_18: 40, game1_win: true,
        game2_avg: 40, game2_avg_9: 40, game2_avg_18: 40, game2_win: true,
        cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0, legs_total: 6,
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
                setFormData(prev => ({ ...prev, cnt_80: 0, cnt_100: 0, cnt_140: 0, cnt_180: 0 }));
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert('Fehler beim Speichern.');
            }
        } catch { alert('Netzwerkfehler'); }
        finally { setLoading(false); }
    };

    const set = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

    // ── Styles (Glassmorphism & Glowing Blue) ───────────────────────
    const glassStyle: React.CSSProperties = {
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        color: '#e2e8f0',
    };

    const inputGlassStyle: React.CSSProperties = {
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(56, 189, 248, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        color: '#f8fafc',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        boxSizing: 'border-box'
    };

    const cardStyle: React.CSSProperties = {
        background: 'rgba(30, 41, 59, 0.3)',
        border: '1px solid rgba(56, 189, 248, 0.1)',
        borderRadius: '16px',
        padding: '20px',
        transition: 'transform 0.2s',
    };

    return (
        <div style={{ ...glassStyle, padding: '32px', maxWidth: '800px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative Glow Elements */}
            <div style={{
                position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
                zIndex: 0, pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-80px', left: '-80px', width: '250px', height: '250px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                zIndex: 0, pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', padding: '10px', borderRadius: '14px', boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}>
                        <Target size={24} color="white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #f8fafc, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Manuelle Spieleingabe
                        </h2>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Offline-Statistiken für die aktuelle Woche erfassen</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Player Name */}
                    <div style={cardStyle}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                            <UserIcon size={14} /> Spieler auswählen
                        </label>
                        <select
                            value={formData.player_name}
                            onChange={e => set('player_name', e.target.value)}
                            style={inputGlassStyle}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
                                e.currentTarget.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {ALLOWED_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>

                    {/* Games Split */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                        {/* Game 1 */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>
                                    <Trophy size={16} /> Spiel 1
                                </span>
                                <button
                                    type="button"
                                    onClick={() => set('game1_win', !formData.game1_win)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                        border: '1px solid', transition: 'all 0.3s',
                                        borderColor: formData.game1_win ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                                        background: formData.game1_win ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: formData.game1_win ? '#4ade80' : '#f87171',
                                        boxShadow: formData.game1_win ? '0 0 15px rgba(34, 197, 94, 0.1)' : '0 0 15px rgba(239, 68, 68, 0.1)'
                                    }}
                                >
                                    {formData.game1_win ? '✓ SIEG' : '✗ LOSS'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>K1: Average Total</label>
                                    <input type="number" step="0.01" value={formData.game1_avg} onChange={e => set('game1_avg', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>K2: Avg 9-Dart</label>
                                    <input type="number" step="0.01" value={formData.game1_avg_9} onChange={e => set('game1_avg_9', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>K3: Avg 18-Dart</label>
                                    <input type="number" step="0.01" value={formData.game1_avg_18} onChange={e => set('game1_avg_18', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                </div>
                            </div>
                        </div>

                        {/* Game 2 */}
                        <div style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>
                                    <Trophy size={16} /> Spiel 2
                                </span>
                                <button
                                    type="button"
                                    onClick={() => set('game2_win', !formData.game2_win)}
                                    style={{
                                        padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                        border: '1px solid', transition: 'all 0.3s',
                                        borderColor: formData.game2_win ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                                        background: formData.game2_win ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: formData.game2_win ? '#4ade80' : '#f87171',
                                        boxShadow: formData.game2_win ? '0 0 15px rgba(34, 197, 94, 0.1)' : '0 0 15px rgba(239, 68, 68, 0.1)'
                                    }}
                                >
                                    {formData.game2_win ? '✓ SIEG' : '✗ LOSS'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>K1: Average Total</label>
                                    <input type="number" step="0.01" value={formData.game2_avg} onChange={e => set('game2_avg', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>K2: Avg 9-Dart</label>
                                    <input type="number" step="0.01" value={formData.game2_avg_9} onChange={e => set('game2_avg_9', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>K3: Avg 18-Dart</label>
                                    <input type="number" step="0.01" value={formData.game2_avg_18} onChange={e => set('game2_avg_18', parseFloat(e.target.value) || 0)} style={inputGlassStyle} />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* High Scores & Legs */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: '#a78bfa', marginBottom: '20px' }}>
                            <Zap size={16} /> Details & High-Scores
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', display: 'block', fontWeight: 700 }}>Legs Ges.</label>
                                <input type="number" value={formData.legs_total} onChange={e => set('legs_total', parseInt(e.target.value) || 0)} style={{ ...inputGlassStyle, textAlign: 'center' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', display: 'block', fontWeight: 700 }}>80+</label>
                                <input type="number" value={formData.cnt_80} onChange={e => set('cnt_80', parseInt(e.target.value) || 0)} style={{ ...inputGlassStyle, textAlign: 'center' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', display: 'block', fontWeight: 700 }}>100+</label>
                                <input type="number" value={formData.cnt_100} onChange={e => set('cnt_100', parseInt(e.target.value) || 0)} style={{ ...inputGlassStyle, textAlign: 'center' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', display: 'block', fontWeight: 700 }}>140+</label>
                                <input type="number" value={formData.cnt_140} onChange={e => set('cnt_140', parseInt(e.target.value) || 0)} style={{ ...inputGlassStyle, textAlign: 'center' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', display: 'block', fontWeight: 700 }}>180</label>
                                <input type="number" value={formData.cnt_180} onChange={e => set('cnt_180', parseInt(e.target.value) || 0)} style={{ ...inputGlassStyle, textAlign: 'center' }} />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '16px',
                            borderRadius: '16px',
                            border: 'none',
                            background: success ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 800,
                            cursor: loading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: success ? '0 0 30px rgba(16, 185, 129, 0.4)' : '0 0 30px rgba(56, 189, 248, 0.3)',
                            marginTop: '8px'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                e.currentTarget.style.boxShadow = success ? '0 0 40px rgba(16, 185, 129, 0.5)' : '0 0 40px rgba(56, 189, 248, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = success ? '0 0 30px rgba(16, 185, 129, 0.4)' : '0 0 30px rgba(56, 189, 248, 0.3)';
                            }
                        }}
                    >
                        {loading ? (
                            <>Speichere...</>
                        ) : success ? (
                            <><CheckCircle2 size={20} /> Erfolgreich gespeichert!</>
                        ) : (
                            <><Save size={20} /> Spielcharakter-Stats Finalisieren</>
                        )}
                    </button>

                    {success && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', justifyContent: 'center', fontWeight: 600 }}>
                            <Info size={14} /> Die Daten werden beim nächsten Snapshot-Update berücksichtigt.
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}
