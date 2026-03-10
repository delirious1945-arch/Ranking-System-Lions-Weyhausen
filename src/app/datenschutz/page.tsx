import Link from 'next/link';

export default function DatenschutzPage() {
    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: '#e2e8f0' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#f0f2f5' }}>Datenschutzerklärung</h1>
            <p style={{ color: '#64748b', marginBottom: 32 }}>DartRanking — Sparte Dart, SC Weyhausen von 1921 e.V.</p>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Verantwortlicher</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Sport Club Weyhausen von 1921 e.V.<br />
                    An der Klanze 28<br />
                    38554 Weyhausen<br /><br />
                    Spartenleiter Dart: Sebastian Kirste<br />
                    E-Mail: info@sc-weyhausen.de<br />
                    Datenschutz: datenschutz@sc-weyhausen.de
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Welche Daten werden verarbeitet?</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Im Rahmen des DartRanking-Systems der Sparte Dart werden folgende personenbezogene Daten verarbeitet:
                </p>
                <ul style={{ lineHeight: 2, color: '#94a3b8', paddingLeft: 24 }}>
                    <li><strong style={{ color: '#e2e8f0' }}>Name</strong> — Vor- und Nachname zur Identifikation im Ranking</li>
                    <li><strong style={{ color: '#e2e8f0' }}>Spielstatistiken</strong> — Averages, Siege, Legs, High-Scores aus Ligaspielen</li>
                    <li><strong style={{ color: '#e2e8f0' }}>Passwort</strong> — Wird als kryptografischer Hash (SHA-256) gespeichert, nicht im Klartext</li>
                    <li><strong style={{ color: '#e2e8f0' }}>localStorage</strong> — Login-Status und Zustimmung zur Datenverarbeitung (nur lokal im Browser)</li>
                </ul>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Zweck der Verarbeitung</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Die Daten dienen ausschließlich der Erstellung und Anzeige des vereinsinternen Dart-Rankings.
                    Eine Weitergabe an Dritte findet nicht statt. Die Verarbeitung erfolgt auf Grundlage der
                    Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sowie des berechtigten Interesses des Vereins (Art. 6 Abs. 1 lit. f DSGVO).
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Hosting & Speicherung</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Die Anwendung wird über <strong style={{ color: '#e2e8f0' }}>Vercel Inc.</strong> (USA) gehostet.
                    Die Datenbank wird über <strong style={{ color: '#e2e8f0' }}>Supabase</strong> (EU-Region: eu-west-1, Irland) betrieben.
                    Es werden keine Tracking-Cookies oder Analyse-Tools eingesetzt.
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Rechte der Betroffenen</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung und
                    Widerspruch gegen die Verarbeitung deiner Daten. Wende dich dazu an{' '}
                    <a href="mailto:datenschutz@sc-weyhausen.de" style={{ color: '#38bdf8' }}>datenschutz@sc-weyhausen.de</a>.
                </p>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Beschwerden können beim Landesbeauftragten für Datenschutz Niedersachsen eingereicht werden.
                </p>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', marginBottom: 12 }}>Vollständige Datenschutzordnung</h2>
                <p style={{ lineHeight: 1.8, color: '#94a3b8' }}>
                    Die vollständige Datenschutzordnung des SC Weyhausen findest du unter:{' '}
                    <a href="https://sc-weyhausen.de/datenschutz/" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                        sc-weyhausen.de/datenschutz
                    </a>
                </p>
            </section>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', gap: 16 }}>
                <Link href="/" style={{ color: '#38bdf8', fontSize: 13 }}>← Zurück zum Dashboard</Link>
                <Link href="/impressum" style={{ color: '#64748b', fontSize: 13 }}>Impressum</Link>
            </div>
        </div>
    );
}
