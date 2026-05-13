'use client';

import { useState } from 'react';
import { Info, CheckCircle2, BarChart3, Target, Trophy, TrendingUp, Sparkles } from 'lucide-react';

export default function MatrixExplanation({ onStart }: { onStart: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    const handleStart = () => {
        setIsVisible(false);
        onStart();
    };

    const categories = [
        { icon: <BarChart3 className="text-blue-400" />, label: '∅ Average', weight: '20%', desc: 'Der Durchschnittswert aller geworfenen Darts.' },
        { icon: <Target className="text-purple-400" />, label: '∅ 9/18 Darts', weight: '20%', desc: 'Die Konstanz der ersten 9 bzw. 18 Darts (je 10%).' },
        { icon: <TrendingUp className="text-emerald-400" />, label: 'Siegquote', weight: '45%', desc: 'Das Verhältnis von gewonnenen zu gespielten Spielen.' },
        { icon: <Sparkles className="text-amber-400" />, label: 'HighScore/Leg', weight: '15%', desc: 'Die Häufigkeit von hohen Scores (100+, 140+, 180).' },
    ];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            ` }} />
            
            <div style={{
                maxWidth: '700px',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '32px',
                padding: '48px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.1)',
                animation: 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                textAlign: 'center'
            }}>
                <div style={{ 
                    display: 'inline-flex', 
                    padding: '12px', 
                    background: 'rgba(56, 189, 248, 0.1)', 
                    borderRadius: '16px',
                    color: '#38bdf8',
                    marginBottom: '24px'
                }}>
                    <Info size={32} />
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                    Die Wertungs-Matrix
                </h1>
                
                <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
                    Bevor wir die Ergebnisse enthüllen: So setzt sich das offizielle Saison-Ranking der Lions Weyhausen zusammen.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '48px', textAlign: 'left' }}>
                    {categories.map((cat, i) => (
                        <div key={i} style={{
                            padding: '24px',
                            background: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            animation: `slideUp 0.5s ease-out ${0.2 + i * 0.1}s forwards`,
                            opacity: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {cat.icon}
                                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>{cat.label}</span>
                                </div>
                                <span style={{ fontSize: '18px', fontWeight: 900, color: '#38bdf8' }}>{cat.weight}</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{cat.desc}</p>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handleStart}
                    style={{
                        width: '100%',
                        padding: '20px',
                        background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#000',
                        fontSize: '18px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Trophy size={20} />
                    ALLES KLAR - SHOW STARTEN!
                </button>
            </div>
        </div>
    );
}
