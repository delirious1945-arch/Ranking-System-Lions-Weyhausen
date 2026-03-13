'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Snapshot {
    snapshot_id: number;
    week_id: string;
    timestamp: Date | string;
}

interface SnapshotSelectorProps {
    allSnapshots: Snapshot[];
    currentId?: string;
}

export default function SnapshotSelector({ allSnapshots, currentId }: SnapshotSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('id', val);
        params.delete('week'); // Clean up week param if id is set
        router.push(`/?${params.toString()}`);
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase" }}>Historie:</label>
            <select
                value={currentId || ""}
                onChange={(e) => handleChange(e.target.value)}
                style={{
                    background: "var(--bg-card)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 13,
                    cursor: "pointer",
                    outline: "none"
                }}
            >
                {allSnapshots.map(s => (
                    <option key={s.snapshot_id} value={s.snapshot_id}>
                        {s.week_id}
                    </option>
                ))}
            </select>
        </div>
    );
}
