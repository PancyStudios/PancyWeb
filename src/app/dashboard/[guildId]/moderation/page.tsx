"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Warning, UserMinus, HandPalm, Fire, CheckCircle, XCircle } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface Warn {
    reason: string;
    moderator: string;
    id: string;
    timestamp: number;
}

interface UserWarns {
    guildId: string;
    userId: string;
    warns: Warn[];
}

interface ProtectionConfig {
    antiraid: { enable: boolean; amount: number };
    antibots: { enable: boolean };
    antijoins: { enable: boolean };
    intelligentAntiflood: boolean;
}

export default function ModerationPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [warns, setWarns] = useState<UserWarns[]>([]);
    const [config, setConfig] = useState<ProtectionConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!guildId) return;

        const fetchData = async () => {
            try {
                const [warnsRes, configRes] = await Promise.all([
                    fetch(`${API_BASE}/api/guilds/${guildId}/moderation/warns`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/guilds/${guildId}/moderation/config`, { credentials: 'include' })
                ]);

                if (warnsRes.ok) setWarns(await warnsRes.json());
                if (configRes.ok) setConfig(await configRes.json());
            } catch (err) {
                console.error("Error loading moderation data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [guildId]);

    if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Cargando sistema de seguridad...</div>;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 shadow-lg shadow-green-500/10">
                    <ShieldCheck size={32} weight="fill" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Moderación y Seguridad</h1>
                    <p className="text-slate-400">Gestiona sanciones y el sistema de protección automática.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Protection Status */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border border-white/5">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Fire size={20} className="text-red-400" />
                            Estado de Protección
                        </h3>

                        <div className="space-y-4">
                            {/* Anti-Raid */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${config?.antiraid?.enable ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500'}`}></div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Anti-Raid</div>
                                        <div className="text-xs text-slate-400">Límite: {config?.antiraid?.amount || 'N/A'} usuarios</div>
                                    </div>
                                </div>
                                {config?.antiraid?.enable ? <CheckCircle size={20} className="text-green-500" weight="fill" /> : <XCircle size={20} className="text-red-500" weight="fill" />}
                            </div>

                            {/* Anti-Bots */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${config?.antibots?.enable ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500'}`}></div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Anti-Bots</div>
                                        <div className="text-xs text-slate-400">Bloqueo de bots no verificados</div>
                                    </div>
                                </div>
                                {config?.antibots?.enable ? <CheckCircle size={20} className="text-green-500" weight="fill" /> : <XCircle size={20} className="text-red-500" weight="fill" />}
                            </div>

                            {/* Anti-Flood */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${config?.intelligentAntiflood ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500'}`}></div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Anti-Flood IA</div>
                                        <div className="text-xs text-slate-400">Detección inteligente de spam</div>
                                    </div>
                                </div>
                                {config?.intelligentAntiflood ? <CheckCircle size={20} className="text-green-500" weight="fill" /> : <XCircle size={20} className="text-red-500" weight="fill" />}
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                            <span className="font-bold block mb-1 text-blue-400">ℹ Nota</span>
                            Para modificar estos ajustes avanzados, utiliza los comandos del bot en Discord (`/setup security`).
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Warns */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Warning size={20} className="text-amber-400" />
                                Advertencias Recientes
                            </h3>
                            <span className="text-xs font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                                Total: {warns.reduce((acc, curr) => acc + curr.warns.length, 0)}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {warns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                    <HandPalm size={48} className="mb-4 opacity-20" />
                                    <p>No hay advertencias registradas.</p>
                                </div>
                            ) : (
                                warns.flatMap(u => u.warns.map(w => ({ ...w, userId: u.userId }))).sort((a, b) => b.timestamp - a.timestamp).map((warn, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-bold">
                                                    !
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white mb-1">
                                                        Usuario ID: <span className="font-mono text-slate-400">{warn.userId}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 leading-relaxed">{warn.reason}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <ShieldCheck size={12} /> Mod: {warn.moderator}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{new Date(warn.timestamp).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100">
                                                <UserMinus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
