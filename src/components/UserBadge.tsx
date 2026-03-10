'use client';

import { useState, useEffect } from 'react';
import { User, LogOut, Shield, X, Plus, Trash2 } from 'lucide-react';

export default function UserBadge() {
    const [name, setName] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allowedNames, setAllowedNames] = useState<string[]>([]);
    const [newUserName, setNewUserName] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('lions-auth-name');
        if (stored) setName(stored);

        const storedAllowed = localStorage.getItem('lions-allowed-names');
        if (storedAllowed) {
            try {
                setAllowedNames(JSON.parse(storedAllowed));
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('lions-auth-name');
        window.location.reload();
    };

    const handleAddUser = () => {
        if (!newUserName.trim()) return;
        const updated = [...allowedNames, newUserName.trim()].sort();
        setAllowedNames(updated);
        localStorage.setItem('lions-allowed-names', JSON.stringify(updated));
        setNewUserName('');
    };

    const handleRemoveUser = (userToRemove: string) => {
        if (userToRemove === 'Sebastian Kirste') return; // protect admin
        const updated = allowedNames.filter(n => n !== userToRemove);
        setAllowedNames(updated);
        localStorage.setItem('lions-allowed-names', JSON.stringify(updated));
    };

    if (!name) return null;

    const isAdmin = name === 'Sebastian Kirste';

    return (
        <>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '5px 12px',
                fontSize: 12,
            }}>
                <User size={13} style={{ color: isAdmin ? '#38bdf8' : '#64748b' }} />
                <span
                    style={{ color: '#e2e8f0', fontWeight: 600, cursor: isAdmin ? 'pointer' : 'default' }}
                    onClick={() => isAdmin && setIsModalOpen(true)}
                >
                    {name}
                </span>
                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            background: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}
                    >
                        <Shield size={10} />
                        ADMIN
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    title="Abmelden"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: 2,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                >
                    <LogOut size={13} />
                </button>
            </div>

            {/* Admin User Management Modal */}
            {isModalOpen && isAdmin && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <div style={{
                        background: '#13161e',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: 16,
                        width: '100%',
                        maxWidth: 480,
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.1)'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 18, color: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Shield size={18} color="#38bdf8" />
                                    Nutzerverwaltung
                                </h2>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#8b949e' }}>
                                    Verwalte, wer sich ins Dashboard einloggen darf.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    background: 'none', border: 'none', color: '#8b949e',
                                    cursor: 'pointer', padding: 8, borderRadius: '50%'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: 24, overflowY: 'auto' }}>
                            {/* Add User */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={e => setNewUserName(e.target.value)}
                                    placeholder="Vorname Nachname"
                                    style={{
                                        flex: 1,
                                        background: '#0b0d11',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        color: '#f0f2f5',
                                        outline: 'none',
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleAddUser();
                                    }}
                                />
                                <button
                                    onClick={handleAddUser}
                                    disabled={!newUserName.trim()}
                                    style={{
                                        background: '#38bdf8',
                                        color: '#0b0d11',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '0 16px',
                                        fontWeight: 600,
                                        cursor: newUserName.trim() ? 'pointer' : 'not-allowed',
                                        opacity: newUserName.trim() ? 1 : 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                >
                                    <Plus size={16} />
                                    Hinzufügen
                                </button>
                            </div>

                            {/* User List */}
                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.04)',
                                overflow: 'hidden'
                            }}>
                                {allowedNames.map((user, idx) => (
                                    <div key={user} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        borderBottom: idx === allowedNames.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)'
                                    }}>
                                        <span style={{ color: '#e2e8f0', fontSize: 14 }}>{user}</span>
                                        {user !== 'Sebastian Kirste' ? (
                                            <button
                                                onClick={() => handleRemoveUser(user)}
                                                style={{
                                                    background: 'none', border: 'none', color: '#ef4444',
                                                    cursor: 'pointer', padding: 6, borderRadius: 6,
                                                    display: 'flex', alignItems: 'center'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600, padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 4 }}>
                                                Haupt-Admin
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
