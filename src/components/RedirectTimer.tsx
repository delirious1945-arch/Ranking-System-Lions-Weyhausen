"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RedirectTimerProps {
    target: string;
    delay: number;
}

export function RedirectTimer({ target, delay }: RedirectTimerProps) {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(target);
        }, delay);

        return () => clearTimeout(timer);
    }, [target, delay, router]);

    return null; // This component doesn't render anything
}
