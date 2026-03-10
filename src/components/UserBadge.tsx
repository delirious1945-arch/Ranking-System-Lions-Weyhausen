'use client';

import { useState, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';

export default function UserBadge() {
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('lions-auth-name');
        if (stored) setName(stored);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('lions-auth-name');
        window.location.reload();
    };

    if (!name) return null;

    const isAdmin = name === 'Sebastian Kirste';

    return (
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
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{name}</span>
            {isAdmin && (
                <span style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    padding: '1px 6px',
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                }}>ADMIN</span>
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
    );
}
