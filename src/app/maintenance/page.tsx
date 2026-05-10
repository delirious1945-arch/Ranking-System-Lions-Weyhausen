import React from 'react';

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b0d11',
      color: '#f0f2f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(56, 189, 248, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
        <div style={{
          marginBottom: '32px',
          display: 'inline-block',
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          <img 
            src="/logo.png" 
            alt="Lions Logo" 
            style={{ 
              width: '120px', 
              height: '120px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.4))'
            }} 
          />
        </div>

        <h1 style={{
          fontSize: '42px',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          marginBottom: '16px',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Wartungsmodus
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          lineHeight: '1.6',
          marginBottom: '40px'
        }}>
          Wir führen aktuell wichtige Systemwartungen und Daten-Updates durch, um das saisonale Ranking zu optimieren. 
          Wir sind in Kürze wieder für euch da.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#0ea5e9',
            borderRadius: '50%',
            animation: 'blink 1.5s infinite'
          }} />
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#0ea5e9',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            System-Update läuft
          </span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      ` }} />

      <footer style={{
        position: 'absolute',
        bottom: '32px',
        fontSize: '12px',
        color: '#475569'
      }}>
        © {new Date().getFullYear()} Lions Weyhausen — Powered by Antigravity
      </footer>
    </div>
  );
}
