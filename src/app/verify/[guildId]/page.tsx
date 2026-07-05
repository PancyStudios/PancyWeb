"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, UserFocus, Warning, CheckCircle, Robot } from 'phosphor-react';
import Link from 'next/link';

const API_BASE = "https://api.pancy.miau.media";

interface GuildInfo {
    id: string;
    name: string;
    icon: string | null;
}

export default function VerifyPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        if (!guildId) return;
        
        // Cargar info del servidor para mostrar en la interfaz
        fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data && !data.message) setGuildInfo(data);
            })
            .catch(() => {});

        // Verificar si el usuario está logueado
        fetch(`${API_BASE}/api/users`, { credentials: 'include' })
            .then(res => {
                setIsAuthenticated(res.ok);
                setLoading(false);
            })
            .catch(() => {
                setIsAuthenticated(false);
                setLoading(false);
            });
    }, [guildId]);

    const handleVerify = async () => {
        setVerifying(true);
        setResult(null);

        try {
            const res = await fetch(`${API_BASE}/api/verify/${guildId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
                setResult({ success: true, message: data.message || "¡Te has verificado correctamente!" });
            } else {
                setResult({ success: false, message: data.message || "No se pudo completar la verificación." });
            }
        } catch (error) {
            setResult({ success: false, message: "Error de conexión con el servidor." });
        }
        
        setVerifying(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-24 h-24 bg-white/10 rounded-full mb-6"></div>
                <div className="w-48 h-6 bg-white/10 rounded-lg"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-500">
                
                <div className="flex flex-col items-center text-center space-y-6">
                    {guildInfo?.icon ? (
                        <img 
                            src={`https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.webp?size=128`} 
                            alt={guildInfo.name}
                            className="w-24 h-24 rounded-full ring-4 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-800 ring-4 ring-emerald-500/30 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            {guildInfo?.name?.charAt(0) || '?'}
                        </div>
                    )}

                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Portal de Verificación</h1>
                        <p className="text-slate-400">Estás a un paso de acceder a <br/><strong className="text-white">{guildInfo?.name || 'este servidor'}</strong></p>
                    </div>

                    {!result && (
                        <div className="w-full space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 text-left">
                                <ShieldCheck size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-white">Análisis Anti-VPN</h3>
                                    <p className="text-xs text-slate-400 mt-1">Comprobaremos tu dirección IP de forma segura para evitar cuentas maliciosas.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5 text-left">
                                <UserFocus size={24} className="text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-bold text-white">Prevención de Alts</h3>
                                    <p className="text-xs text-slate-400 mt-1">Revisaremos la edad de tu cuenta de Discord para verificar tu autenticidad.</p>
                                </div>
                            </div>

                            <button 
                                onClick={isAuthenticated ? handleVerify : () => window.location.href = `${API_BASE}/api/auth/discord?redirect=${encodeURIComponent(window.location.href)}`}
                                disabled={verifying}
                                className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${verifying ? 'bg-emerald-500/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 hover:-translate-y-1 shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}
                            >
                                {verifying ? (
                                    <>
                                        <Robot size={22} className="animate-pulse" />
                                        Analizando perfil...
                                    </>
                                ) : isAuthenticated ? (
                                    <>
                                        <ShieldCheck size={22} weight="bold" />
                                        Verificar mi cuenta
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={22} weight="bold" />
                                        Iniciar sesión con Discord
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {result && (
                        <div className="w-full pt-4 border-t border-white/5 animate-in slide-in-from-bottom-4">
                            <div className={`p-6 rounded-2xl border flex flex-col items-center text-center ${result.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                {result.success ? (
                                    <CheckCircle size={48} className="text-emerald-400 mb-4" weight="fill" />
                                ) : (
                                    <Warning size={48} className="text-red-400 mb-4" weight="fill" />
                                )}
                                <h3 className={`text-xl font-bold mb-2 ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {result.success ? '¡Verificación Exitosa!' : 'Acceso Denegado'}
                                </h3>
                                <p className="text-slate-300 text-sm">
                                    {result.message}
                                </p>
                                {result.success && (
                                    <p className="text-xs text-slate-500 mt-4">
                                        Ya puedes volver a Discord y acceder a los canales.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-xs text-slate-600 font-medium">
                    Powered by <Link href="/" className="text-emerald-500/70 hover:text-emerald-400">PancyBot Security</Link>
                </p>
            </div>
        </div>
    );
}
