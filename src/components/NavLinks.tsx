"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { href: "/", label: "Dashboard" },
];

export default function NavLinks() {
    const path = usePathname();
    return (
        <nav style={{ display: "flex", gap: 4 }}>
            {NAV_ITEMS.map(({ href, label }) => {
                const active = path === href;
                return (
                    <Link key={href} href={href} style={{
                        textDecoration: "none",
                        padding: "5px 12px",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        color: active ? "var(--text)" : "var(--text-muted)",
                        background: active ? "rgba(255,255,255,0.06)" : "transparent",
                        transition: "color 0.15s, background 0.15s",
                    }}>
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
