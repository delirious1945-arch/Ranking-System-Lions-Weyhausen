'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, Shield, X, Plus, Trash2, KeyRound, RotateCcw } from 'lucide-react';

function validatePassword(pw: string) {
    return {
        length: pw.length >= 10,
        uppercase: /[A-Z]/.test(pw),
        number: /[0-9]/.test(pw),
        special: /[^A-Za-z0-9]/.test(pw),
        get valid() { return this.length && this.uppercase && this.number && this.special; }
    };
}

export default function UserBadge() {
    const [name, setName] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPwModalOpen, setIsPwModalOpen] = useState(false);
    const [allowedNames, setAllowedNames] = useState<string[]>([]);
    const [newUserName, setNewUserName] = useState('');

    // Password change state
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [newPw2, setNewPw2] = useState('');
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    // Admin reset state
    const [resetting, setResetting] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('lions-auth-name');
        if (stored) setName(stored);

        const loadUsers = async () => {
            try {
                const res = await fetch('/api/auth/users');
                if (res.ok) {
                    const data = await res.json();
                    setAllowedNames(data);
                }
            } catch (err) {
                console.error("Failed to load users", err);
            }
        };
        loadUsers();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('lions-auth-name');
        window.location.reload();
    };

    const handleAddUser = async () => {
        if (!newUserName.trim()) return;
        const playerName = newUserName.trim();

        try {
            const res = await fetch('/api/auth/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminName: name, newPlayerName: playerName })
            });
            if (res.ok) {
                setAllowedNames(prev => [...prev, playerName].sort());
                setNewUserName('');
            } else {
                const data = await res.json();
                alert(data.error || 'Fehler beim Hinzufügen');
            }
        } catch {
            alert('Netzwerkfehler');
        }
    };

    const handleRemoveUser = async (userToRemove: string) => {
        if (userToRemove === 'Sebastian Kirste') return;
        if (!confirm(`${userToRemove} wirklich löschen?`)) return;

        try {
            const res = await fetch('/api/auth/remove-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminName: name, playerName: userToRemove })
            });
            if (res.ok) {
                setAllowedNames(prev => prev.filter(n => n !== userToRemove));
            } else {
                const data = await res.json();
                alert(data.error || 'Fehler beim Entfernen');
            }
        } catch {
            alert('Netzwerkfehler');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess('');

        if (newPw !== newPw2) { setPwError('Passwörter stimmen nicht überein'); return; }
        const val = validatePassword(newPw);
        if (!val.valid) { setPwError('Passwort erfüllt nicht alle Anforderungen'); return; }

        setPwLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, oldPassword: oldPw, newPassword: newPw })
            });
            const data = await res.json();
            if (!res.ok) { setPwError(data.error || 'Fehler'); setPwLoading(false); return; }
            setPwSuccess('Passwort erfolgreich geändert!');
            setOldPw(''); setNewPw(''); setNewPw2('');
            setTimeout(() => setIsPwModalOpen(false), 1500);
        } catch {
            setPwError('Verbindungsfehler');
        } finally {
            setPwLoading(false);
        }
    };

    const handleResetPassword = async (playerName: string) => {
        if (!confirm(`Passwort von ${playerName} auf das Initial-Passwort zurücksetzen?`)) return;
        setResetting(playerName);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminName: name, playerName })
            });
            if (res.ok) {
                alert(`Passwort von ${playerName} wurde zurückgesetzt.`);
            } else {
                const data = await res.json();
                alert(data.error || 'Fehler beim Zurücksetzen');
            }
        } catch {
            alert('Netzwerkfehler');
        } finally {
            setResetting(null);
        }
    };

    if (!name) return null;

    const isAdmin = name === 'Sebastian Kirste';
    const pwVal = validatePassword(newPw);
    const inputStyle: React.CSSProperties = {
        background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)',
        padding: '10px 14px', borderRadius: 8, color: '#f0f2f5', outline: 'none', width: '100%', fontSize: 14, boxSizing: 'border-box'
    };
    const ruleStyle = (ok: boolean): React.CSSProperties => ({
        fontSize: 11, color: ok ? '#22c55e' : '#64748b', display: 'flex', alignItems: 'center', gap: 4
    });

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '5px 12px', fontSize: 12 }}>
                <User size={13} style={{ color: isAdmin ? '#38bdf8' : '#64748b' }} />
                <span
                    style={{ color: '#e2e8f0', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => setIsPwModalOpen(true)}
                    title="Passwort ändern"
                >
                    {name}
                </span>
                {isAdmin && (
                    <button onClick={() => setIsModalOpen(true)} style={{
                        background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: 4,
                        fontSize: 9, fontWeight: 800, letterSpacing: '0.05em', border: '1px solid rgba(56, 189, 248, 0.3)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        <Shield size={10} />
                        ADMIN
                    </button>
                )}
                <button onClick={handleLogout} title="Abmelden" style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2,
                    display: 'flex', alignItems: 'center', transition: 'color 0.15s',
                }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                    <LogOut size={13} />
                </button>
            </div>

            {/* Password Change Modal */}
            {isPwModalOpen && typeof document !== 'undefined' && require('react-dom').createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#13161e', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: 18, color: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <KeyRound size={18} color="#38bdf8" /> Passwort ändern
                            </h2>
                            <button onClick={() => { setIsPwModalOpen(false); setPwError(''); setPwSuccess(''); }} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 8 }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} style={{ padding: 24 }}>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Aktuelles Passwort</label>
                                <input type="password" value={oldPw} onChange={e => { setOldPw(e.target.value); setPwError(''); }} style={inputStyle} placeholder="Aktuelles Passwort" required />
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Neues Passwort</label>
                                <input type="password" value={newPw} onChange={e => { setNewPw(e.target.value); setPwError(''); }} style={inputStyle} placeholder="Neues Passwort" required />
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', marginBottom: 6 }}>Neues Passwort bestätigen</label>
                                <input type="password" value={newPw2} onChange={e => { setNewPw2(e.target.value); setPwError(''); }} style={inputStyle} placeholder="Passwort wiederholen" required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 16 }}>
                                <span style={ruleStyle(pwVal.length)}>{pwVal.length ? '✓' : '✗'} Mind. 10 Zeichen</span>
                                <span style={ruleStyle(pwVal.uppercase)}>{pwVal.uppercase ? '✓' : '✗'} Mind. 1 Großbuchstabe</span>
                                <span style={ruleStyle(pwVal.number)}>{pwVal.number ? '✓' : '✗'} Mind. 1 Zahl</span>
                                <span style={ruleStyle(pwVal.special)}>{pwVal.special ? '✓' : '✗'} Mind. 1 Sonderzeichen</span>
                            </div>
                            {pwError && <p style={{ color: '#f85149', fontSize: 13, margin: '0 0 12px' }}>{pwError}</p>}
                            {pwSuccess && <p style={{ color: '#22c55e', fontSize: 13, margin: '0 0 12px' }}>{pwSuccess}</p>}
                            <button type="submit" disabled={pwLoading || !pwVal.valid || newPw !== newPw2} style={{
                                width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, color: '#0b0d11',
                                background: pwVal.valid && newPw === newPw2 ? '#38bdf8' : '#334155',
                                border: 'none', borderRadius: 8, cursor: pwVal.valid && newPw === newPw2 ? 'pointer' : 'not-allowed',
                                opacity: pwLoading ? 0.7 : 1
                            }}>
                                {pwLoading ? 'Wird gespeichert...' : 'Passwort ändern'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Admin User Management + Password Reset Modal */}
            {isModalOpen && isAdmin && typeof document !== 'undefined' && require('react-dom').createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#13161e', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.1)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 18, color: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Shield size={18} color="#38bdf8" /> Nutzerverwaltung
                                </h2>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8b949e' }}>Nutzer verwalten & Passwörter zurücksetzen</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 8, borderRadius: '50%' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                                <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Vorname Nachname"
                                    style={{ flex: 1, background: '#0b0d11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#f0f2f5', outline: 'none' }}
                                    onKeyDown={e => { if (e.key === 'Enter') handleAddUser(); }}
                                />
                                <button onClick={handleAddUser} disabled={!newUserName.trim()} style={{
                                    background: '#38bdf8', color: '#0b0d11', border: 'none', borderRadius: 8, padding: '0 16px',
                                    fontWeight: 600, cursor: newUserName.trim() ? 'pointer' : 'not-allowed', opacity: newUserName.trim() ? 1 : 0.5,
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                    <Plus size={16} /> Hinzufügen
                                </button>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                                {allowedNames.map((user, idx) => (
                                    <div key={user} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: idx === allowedNames.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                                        <span style={{ color: '#e2e8f0', fontSize: 14 }}>{user}</span>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            {user === 'Sebastian Kirste' ? (
                                                <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600, padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 4 }}>Haupt-Admin</span>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleResetPassword(user)} disabled={resetting === user}
                                                        title="Passwort zurücksetzen"
                                                        style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', color: '#fbbf24', borderRadius: 6, padding: 6, cursor: resetting === user ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', opacity: resetting === user ? 0.5 : 1 }}
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                    <button onClick={() => handleRemoveUser(user)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
