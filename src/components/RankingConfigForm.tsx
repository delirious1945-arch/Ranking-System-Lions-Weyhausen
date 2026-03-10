'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function RankingConfigForm() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [weights, setWeights] = useState({
        weight_k1: 20,
        weight_k2: 15,
        weight_k3: 15,
        weight_k4: 25,
        weight_k5: 25,
    });

    useEffect(() => {
        fetch('/api/ranking-config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setWeights({
                        weight_k1: data.weight_k1 * 100,
                        weight_k2: data.weight_k2 * 100,
                        weight_k3: data.weight_k3 * 100,
                        weight_k4: data.weight_k4 * 100,
                        weight_k5: data.weight_k5 * 100,
                    });
                }
            })
            .finally(() => setFetching(false));
    }, []);

    const total = Object.values(weights).reduce((a, b) => a + b, 0);

    const handleSave = async () => {
        if (total !== 100) {
            alert('Die Summe muss genau 100% ergeben!');
            return;
        }
        setLoading(true);
        setSuccess(false);
        try {
            const res = await fetch('/api/ranking-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight_k1: weights.weight_k1 / 100,
                    weight_k2: weights.weight_k2 / 100,
                    weight_k3: weights.weight_k3 / 100,
                    weight_k4: weights.weight_k4 / 100,
                    weight_k5: weights.weight_k5 / 100,
                }),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (e) {
            alert('Fehler beim Speichern');
        } finally {
            setLoading(false);
        }
    };

    // ── Styles (Matching ManualGameForm) ─────────────────────
    const glassStyle: React.CSSProperties = {
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '32px',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        color: '#f8fafc',
    };

    const inputStyle: React.CSSProperties = {
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '12px',
        padding: '12px',
        color: '#fff',
        width: '80px',
        textAlign: 'center',
        outline: 'none',
        fontSize: '16px',
        fontWeight: 700
    };

    if (fetching) return <div style={{ color: '#94a3b8', padding: '20px' }}>Lädt Konfiguration...</div>;

    return (
        <div style={glassStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '12px', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>
                    <Settings size={20} color="white" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Ranglisten-Gewichtung</h3>
            </div>

            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
                Lege fest, wie stark jede Kategorie in die Gesamtpunktezahl einfließt. Die Summe muss **100%** ergeben.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                    { id: 'k1', label: 'K1 (Gesamt-Average)', color: '#3b82f6' },
                    { id: 'k2', label: 'K2 (9-Dart Average)', color: '#fbbf24' },
                    { id: 'k3', label: 'K3 (18-Dart Average)', color: '#10b981' },
                    { id: 'k4', label: 'K4 (Siegquote)', color: '#f87171' },
                    { id: 'k5', label: 'K5 (High-Scores)', color: '#a78bfa' },
                ].map(cat => (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30, 41, 59, 0.4)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '4px', height: '20px', background: cat.color, borderRadius: '2px' }} />
                            <span style={{ fontWeight: 600 }}>{cat.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="number"
                                value={weights[`weight_${cat.id}` as keyof typeof weights]}
                                onChange={e => setWeights(prev => ({ ...prev, [`weight_${cat.id}`]: parseInt(e.target.value) || 0 }))}
                                style={inputStyle}
                            />
                            <span style={{ fontWeight: 800, color: '#38bdf8' }}>%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Indicator */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '16px',
                background: total === 100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: total === 100 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Gesamt-Gewichtung:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {total !== 100 && <AlertTriangle size={16} color="#f87171" />}
                    <span style={{ fontSize: '20px', fontWeight: 900, color: total === 100 ? '#10b981' : '#f87171' }}>{total}%</span>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={loading || total !== 100}
                style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    background: total === 100 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(30, 41, 59, 0.5)',
                    color: total === 100 ? 'white' : '#64748b',
                    fontWeight: 800,
                    cursor: total === 100 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.3s',
                    boxShadow: total === 100 ? '0 10px 25px rgba(37, 99, 235, 0.3)' : 'none'
                }}
            >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : <Save size={20} />}
                {loading ? 'Speichere...' : success ? 'Gespeichert!' : 'Einstellungen Übernehmen'}
            </button>
        </div>
    );
}
