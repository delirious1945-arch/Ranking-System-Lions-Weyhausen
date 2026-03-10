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
    const [authed, setAuthed] = useState<boolean | null>(null); // null = checking
    const [name, setName] = useState('');
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
        const match = ALLOWED_NAMES.find(n => normalize(n) === normalize(name));
        if (match) {
            localStorage.setItem(STORAGE_KEY, match);
            setAuthed(true);
        } else {
            setError('Name nicht gefunden. Bitte gib deinen vollständigen Vor- und Nachnamen ein.');
        }
    };

    // Still checking localStorage
    if (authed === null) {
        return null;
    }

    // Authenticated → show app
    if (authed) {
        return <>{children}</>;
    }

    // Login screen
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#0b0d11',
        }}>
            <div style={{
                width: '100%',
                maxWidth: 400,
                textAlign: 'center',
            }}>
                {/* Logo */}
                <div style={{ marginBottom: 32 }}>
                    <img
                        src="/logo.png"
                        alt="Lions Weyhausen"
                        style={{ width: 80, height: 80, objectFit: 'contain', margin: '0 auto', display: 'block', opacity: 0.9 }}
                    />
                    <h1 style={{
                        margin: '20px 0 8px',
                        fontSize: 24,
                        fontWeight: 800,
                        color: '#f0f2f5',
                        letterSpacing: '-0.03em',
                    }}>
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
                    <label style={{
                        display: 'block',
                        textAlign: 'left',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#8b949e',
                        marginBottom: 8,
                    }}>
                        Vor- und Nachname
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); setError(''); }}
                        placeholder="z.B. Sebastian Kirste"
                        autoComplete="name"
                        autoFocus
                        style={{
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
                        }}
                    />

                    {error && (
                        <p style={{
                            color: '#f85149',
                            fontSize: 13,
                            margin: '10px 0 0',
                            textAlign: 'left',
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            marginTop: 16,
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
