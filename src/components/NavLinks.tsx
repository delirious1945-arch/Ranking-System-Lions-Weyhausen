"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { href: "/", label: "Dashboard" }
];

export default function NavLinks() {
    const path = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('lions-auth-role');
        const name = localStorage.getItem('lions-auth-name');
        
        if (role === 'admin' && name === 'Sebastian Kirste') {
            setIsAdmin(true);
        }
    }, [path]); // Re-eval on path changes to catch login events if they happened to navigate

    const items = [...NAV_ITEMS];
    if (isAdmin) {
        items.push({ href: "/admin", label: "Admin" });
    }

    return (
        <nav style={{ display: "flex", gap: 4 }}>
            {items.map(({ href, label }) => {
                const active = path === href || (href.startsWith("/admin") && path === "/admin");
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
