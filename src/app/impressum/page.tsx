import Link from 'next/link';

export default function ImpressumPage() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: '#e2e8f0' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#f0f2f5' }}>Impressum</h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>DartRanking — Sparte Dart, SC Weyhausen von 1921 e.V.</p>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Angaben gemäß § 5 TMG</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Sport Club Weyhausen von 1921 e.V.<br />
                    An der Klanze 28<br />
                    38554 Weyhausen
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Vertreten durch den Vorstand</h2>
                <ul style={{ lineHeight: 2, color: '#94a3b8', paddingLeft: 24 }}>
                    <li>1. Vorsitzender: Maik Feuerhahn</li>
                    <li>2. Vorsitzender: Christian Milbrandt</li>
                    <li>3. Vorsitzender: Dirk Zehnpfund</li>
                    <li>Geschäftsführer: Karsten Kohnert</li>
                </ul>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Verantwortlich für den Inhalt dieser Seite</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Sebastian Kirste<br />
                    Spartenleiter Dart, SC Weyhausen von 1921 e.V.
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Kontakt</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Telefon: 05362 71952<br />
                    E-Mail: info@sc-weyhausen.de
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Registereintrag</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Eintragung im Vereinsregister.<br />
                    Registergericht: Amtsgericht Braunschweig<br />
                    Registernummer: VR 100116
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Umsatzsteuer-ID</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: 2319 01921811924
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Vollständiges Impressum des Vereins</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    <a href="https://sc-weyhausen.de/impressum/" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                        sc-weyhausen.de/impressum
                    </a>
                </p>
            </section>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', gap: 16 }}>
                <Link href="/" style={{ color: '#38bdf8', fontSize: 13 }}>← Zurück zum Dashboard</Link>
                <Link href="/datenschutz" style={{ color: '#64748b', fontSize: 13 }}>Datenschutz</Link>
            </div>
        </div>
    );
}
