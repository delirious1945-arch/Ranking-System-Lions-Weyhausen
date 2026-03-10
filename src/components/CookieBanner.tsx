'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'lions-storage-consent';

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99990,
            background: 'rgba(13, 15, 22, 0.96)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(56, 189, 248, 0.2)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
        }}>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', maxWidth: 600, lineHeight: 1.5 }}>
                Diese Seite nutzt <strong style={{ color: '#e2e8f0' }}>localStorage</strong> zur Speicherung deines Logins. Es werden keine Tracking-Cookies eingesetzt.{' '}
                <a href="/datenschutz" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Datenschutz</a> ·{' '}
                <a href="/impressum" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Impressum</a>
            </p>
            <button
                onClick={handleAccept}
                style={{
                    background: '#38bdf8',
                    color: '#0b0d11',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                }}
            >
                Verstanden
            </button>
        </div>
    );
}
