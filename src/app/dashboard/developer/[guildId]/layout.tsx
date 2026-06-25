"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SocketProvider } from '@/context/SocketContext';

const API_BASE = "https://api.pancy.miau.media";

export default function DevDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const guardCheck = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/users`, { credentials: 'include' });
                if (res.status === 401) {
                    const currentUrl = window.location.href;
                    window.location.href = `${API_BASE}/api/auth/discord?redirect=${encodeURIComponent(currentUrl)}`;
                    return;
                }
                if (res.ok) {
                    const user = await res.json();
                    if (!user.isDeveloper) {
                        router.replace('/dashboard');
                        return;
                    }
                }
            } catch {
                const currentUrl = window.location.href;
                window.location.href = `${API_BASE}/api/auth/discord?redirect=${encodeURIComponent(currentUrl)}`;
                return;
            }
            setChecking(false);
        };
        guardCheck();
    }, [router]);

    if (checking) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0a0a15]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-purple-400 text-sm font-mono animate-pulse">Verificando acceso de developer...</p>
                </div>
            </div>
        );
    }

    return (
        <SocketProvider>
            {children}
        </SocketProvider>
    );
}
