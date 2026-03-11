'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lions-auth-name';

function normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function validatePassword(pw: string) {
    return {
        length: pw.length >= 10,
        uppercase: /[A-Z]/.test(pw),
        number: /[0-9]/.test(pw),
        special: /[^A-Za-z0-9]/.test(pw),
        get valid() { return this.length && this.uppercase && this.number && this.special; }
    };
}

export default function NameGate({ children }: { children: React.ReactNode }) {
    const [authed, setAuthed] = useState<boolean | null>(null);
    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password change state
    const [mustChange, setMustChange] = useState(false);
    const [newPw, setNewPw] = useState('');
    const [newPw2, setNewPw2] = useState('');
    const [changeName, setChangeName] = useState('');

    const [allowedNames, setAllowedNames] = useState<string[]>([]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await fetch('/api/auth/users');
                if (res.ok) {
                    const names = await res.json();
                    setAllowedNames(names);

                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored && names.some((n: string) => normalize(n) === normalize(stored))) {
                        setAuthed(true);
                    } else {
                        if (stored) localStorage.removeItem(STORAGE_KEY);
                        setAuthed(false);
                    }
                }
            } catch (err) {
                console.error("Failed to load allowed names", err);
                setAuthed(false);
            }
        };
        loadUsers();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const fullName = `${vorname.trim()} ${nachname.trim()}`;
        const match = allowedNames.find(n => normalize(n) === normalize(fullName));

        if (!match) {
            setError('Name nicht gefunden. Bitte überprüfe deine Eingabe.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: match, password })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Login fehlgeschlagen');
                setLoading(false);
                return;
            }
            if (data.mustChange) {
                setMustChange(true);
                setChangeName(match);
                setLoading(false);
                return;
            }
            localStorage.setItem(STORAGE_KEY, match);
            setAuthed(true);
        } catch {
            setError('Verbindungsfehler');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPw !== newPw2) {
            setError('Passwörter stimmen nicht überein');
            return;
        }

        const val = validatePassword(newPw);
        if (!val.valid) {
            setError('Passwort erfüllt nicht alle Anforderungen');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: changeName, oldPassword: password, newPassword: newPw })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Fehler beim Ändern');
                setLoading(false);
                return;
            }
            // Success — log the user in
            localStorage.setItem(STORAGE_KEY, changeName);
            setAuthed(true);
        } catch {
            setError('Verbindungsfehler');
        } finally {
            setLoading(false);
        }
    };

    if (authed === null) return null;
    if (authed) return <>{children}</>;

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '14px 16px', fontSize: 16,
        background: '#0b0d11', color: '#f0f2f5',
        border: `1px solid ${error ? '#f85149' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10, outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const pwValidation = validatePassword(newPw);
    const ruleStyle = (ok: boolean): React.CSSProperties => ({
        fontSize: 12, color: ok ? '#22c55e' : '#64748b', display: 'flex', alignItems: 'center', gap: 6
    });

    // Password change screen
    if (mustChange) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0b0d11', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vmin', height: '60vmin', backgroundImage: 'url(/logo.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.04, pointerEvents: 'none' }} />

                <div style={{ width: '100%', maxWidth: 420, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
                        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#f0f2f5' }}>
                            Passwort ändern
                        </h1>
                        <p style={{ color: '#8b949e', fontSize: 14, margin: 0 }}>
                            Willkommen, <strong style={{ color: '#38bdf8' }}>{changeName}</strong>! Du musst dein Initial-Passwort ändern, bevor du fortfahren kannst.
                        </p>
                    </div>

                    <form onSubmit={handleChangePassword} style={{
                        background: 'rgba(19, 22, 30, 0.8)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 16, padding: 28,
                    }}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Neues Passwort</label>
                            <input type="password" value={newPw} onChange={e => { setNewPw(e.target.value); setError(''); }} placeholder="Neues Passwort" style={inputStyle} autoFocus />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Passwort bestätigen</label>
                            <input type="password" value={newPw2} onChange={e => { setNewPw2(e.target.value); setError(''); }} placeholder="Passwort wiederholen" style={inputStyle} />
                        </div>

                        {/* Validation rules */}
                        <div style={{ textAlign: 'left', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={ruleStyle(pwValidation.length)}>{pwValidation.length ? '✓' : '✗'} Mindestens 10 Zeichen</span>
                            <span style={ruleStyle(pwValidation.uppercase)}>{pwValidation.uppercase ? '✓' : '✗'} Mindestens ein Großbuchstabe</span>
                            <span style={ruleStyle(pwValidation.number)}>{pwValidation.number ? '✓' : '✗'} Mindestens eine Zahl</span>
                            <span style={ruleStyle(pwValidation.special)}>{pwValidation.special ? '✓' : '✗'} Mindestens ein Sonderzeichen</span>
                            {newPw2.length > 0 && <span style={ruleStyle(newPw === newPw2)}>{newPw === newPw2 ? '✓' : '✗'} Passwörter stimmen überein</span>}
                        </div>

                        {error && <p style={{ color: '#f85149', fontSize: 13, margin: '0 0 12px', textAlign: 'left' }}>{error}</p>}

                        <button type="submit" disabled={loading || !pwValidation.valid || newPw !== newPw2} style={{
                            width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff',
                            background: pwValidation.valid && newPw === newPw2 ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : '#334155',
                            border: 'none', borderRadius: 10, cursor: pwValidation.valid && newPw === newPw2 ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
                        }}>
                            {loading ? 'Wird gespeichert...' : '🔒 Neues Passwort setzen'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Login screen
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0b0d11', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vmin', height: '60vmin', backgroundImage: 'url(/logo.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.04, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 400, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: 32 }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'blur(20px)' }} />
                        <img src="/logo.png" alt="Lions Weyhausen" style={{ width: 80, height: 80, objectFit: 'contain', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.25))' }} />
                    </div>
                    <h1 style={{ margin: '20px 0 8px', fontSize: 24, fontWeight: 800, color: '#f0f2f5', letterSpacing: '-0.03em' }}>Lions Weyhausen</h1>
                    <p style={{ color: '#8b949e', fontSize: 14, margin: 0 }}>Dart Ranking — Saison 2025/26</p>
                </div>

                <form onSubmit={handleLogin} style={{
                    background: 'rgba(19, 22, 30, 0.8)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28,
                }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Vorname</label>
                            <input type="text" value={vorname} onChange={e => { setVorname(e.target.value); setError(''); }} placeholder="Vorname" autoComplete="given-name" autoFocus style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Nachname</label>
                            <input type="text" value={nachname} onChange={e => { setNachname(e.target.value); setError(''); }} placeholder="Nachname" autoComplete="family-name" style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>🔒 Passwort</label>
                        <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Passwort" autoComplete="current-password" style={inputStyle} />
                    </div>

                    {error && <p style={{ color: '#f85149', fontSize: 13, margin: '0 0 12px', textAlign: 'left' }}>{error}</p>}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, color: '#fff',
                        background: '#58a6ff', border: 'none', borderRadius: 10,
                        cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? 'Wird geprüft...' : 'Einloggen'}
                    </button>
                </form>

                <p style={{ marginTop: 16, fontSize: 11, color: '#64748b' }}>
                    Initial-Passwort: Das dir zugeteilte Passwort muss beim ersten Login geändert werden.
                </p>
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
