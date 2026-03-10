'use client';

import { useState, useEffect } from 'react';

const ALLOWED_NAMES = [
    'Sebastian Kirste',
    'Jens Goltermann',
    'Erik Schremmer',
    'Timo Feuerhahn',
    'Dirk Ostermann',
    'Nicholas Stedman',
    'Kevin Emde',
    'Maik Feuerhahn',
    'Jannik Baier',
    'Michael Kranz',
    'Michael Gehrt',
    'André Rathje',
    'Malte Wolnik',
    'Karen Schulz',
    'Joachim Koch',
    'Martin Wolnik',
    'Karsten Kohnert',
    'Uwe Kohnert',
];

const STORAGE_KEY = 'lions-auth-name';

function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function NameGate({ children }: { children: React.ReactNode }) {
    const [authed, setAuthed] = useState<boolean | null>(null);
    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && ALLOWED_NAMES.some(n => normalize(n) === normalize(stored))) {
            setAuthed(true);
        } else {
            setAuthed(false);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const fullName = `${vorname.trim()} ${nachname.trim()}`;
        const match = ALLOWED_NAMES.find(n => normalize(n) === normalize(fullName));
        if (match) {
            localStorage.setItem(STORAGE_KEY, match);
            setAuthed(true);
        } else {
            setError('Name nicht gefunden. Bitte überprüfe deine Eingabe.');
        }
    };

    if (authed === null) return null;
    if (authed) return <>{children}</>;

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 16px',
        fontSize: 16,
        background: '#0b0d11',
        color: '#f0f2f5',
        border: `1px solid ${error ? '#f85149' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#0b0d11',
        }}>
            <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
                {/* Logo */}
                <div style={{ marginBottom: 32 }}>
                    <img
                        src="/logo.png"
                        alt="Lions Weyhausen"
                        style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto', display: 'block', opacity: 0.9 }}
                    />
                    <h1 style={{ margin: '20px 0 8px', fontSize: 24, fontWeight: 800, color: '#f0f2f5', letterSpacing: '-0.03em' }}>
                        Lions Weyhausen
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14, margin: 0 }}>
                        Dart Ranking — Saison 2025/26
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{
                    background: '#13161e',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16,
                    padding: 28,
                }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>
                                Vorname
                            </label>
                            <input
                                type="text"
                                value={vorname}
                                onChange={e => { setVorname(e.target.value); setError(''); }}
                                placeholder="Vorname"
                                autoComplete="given-name"
                                autoFocus
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>
                                Nachname
                            </label>
                            <input
                                type="text"
                                value={nachname}
                                onChange={e => { setNachname(e.target.value); setError(''); }}
                                placeholder="Nachname"
                                autoComplete="family-name"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {error && (
                        <p style={{ color: '#f85149', fontSize: 13, margin: '0 0 12px', textAlign: 'left' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#fff',
                            background: '#58a6ff',
                            border: 'none',
                            borderRadius: 10,
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                    >
                        Einloggen
                    </button>
                </form>
            </div>
        </div>
    );
}
