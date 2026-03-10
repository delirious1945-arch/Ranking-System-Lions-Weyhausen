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

const ADMIN_NAME = 'Sebastian Kirste';
const ADMIN_PASSWORD = 'Lions2026!';
const STORAGE_KEY = 'lions-auth-name';

function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function NameGate({ children }: { children: React.ReactNode }) {
    const [authed, setAuthed] = useState<boolean | null>(null);
    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');
    const [password, setPassword] = useState('');
    const [needsPassword, setNeedsPassword] = useState(false);
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

        if (!match) {
            setError('Name nicht gefunden. Bitte überprüfe deine Eingabe.');
            return;
        }

        // Admin needs password
        if (match === ADMIN_NAME) {
            if (!needsPassword) {
                setNeedsPassword(true);
                return;
            }
            if (password !== ADMIN_PASSWORD) {
                setError('Falsches Passwort.');
                return;
            }
        }

        localStorage.setItem(STORAGE_KEY, match);
        setAuthed(true);
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
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#0b0d11',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Giant background logo watermark */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60vmin',
                height: '60vmin',
                backgroundImage: 'url(/logo.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: 0.04,
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: 400, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{
                            position: 'absolute',
                            width: 120, height: 120,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            filter: 'blur(20px)',
                        }} />
                        <img
                            src="/logo.png"
                            alt="Lions Weyhausen"
                            style={{
                                width: 80, height: 80, objectFit: 'contain',
                                position: 'relative', zIndex: 1,
                                filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.25))',
                            }}
                        />
                    </div>
                    <h1 style={{ margin: '20px 0 8px', fontSize: 24, fontWeight: 800, color: '#f0f2f5', letterSpacing: '-0.03em' }}>
                        Lions Weyhausen
                    </h1>
                    <p style={{ color: '#8b949e', fontSize: 14, margin: 0 }}>
                        Dart Ranking — Saison 2025/26
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{
                    background: 'rgba(19, 22, 30, 0.8)',
                    backdropFilter: 'blur(12px)',
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
                                onChange={e => { setVorname(e.target.value); setError(''); setNeedsPassword(false); }}
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
                                onChange={e => { setNachname(e.target.value); setError(''); setNeedsPassword(false); }}
                                placeholder="Nachname"
                                autoComplete="family-name"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Password field - slides in for admin */}
                    {needsPassword && (
                        <div style={{ marginBottom: 16, animation: 'fadeIn 0.3s ease-out' }}>
                            <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>
                                🔒 Admin-Passwort
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                placeholder="Passwort eingeben"
                                autoFocus
                                style={{
                                    ...inputStyle,
                                    borderColor: 'rgba(56, 189, 248, 0.3)',
                                    boxShadow: '0 0 15px rgba(56, 189, 248, 0.08)',
                                }}
                            />
                            <p style={{ fontSize: 11, color: '#64748b', margin: '6px 0 0', textAlign: 'left' }}>
                                Admin-Zugang erfordert ein Passwort.
                            </p>
                        </div>
                    )}

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
                            background: needsPassword
                                ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                                : '#58a6ff',
                            border: 'none',
                            borderRadius: 10,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: needsPassword ? '0 0 25px rgba(56, 189, 248, 0.3)' : 'none',
                        }}
                    >
                        {needsPassword ? '🔐 Als Admin Einloggen' : 'Einloggen'}
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
