"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Activity, Trophy, Star, Users } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface LeaderboardEntry {
    userId: string;
    username: string;
    avatarUrl: string;
    level: number;
    xp: number;
    totalMessages: number;
}

export default function PublicLeaderboardPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [guildName, setGuildName] = useState<string>("el servidor");

    useEffect(() => {
        if (!guildId) return;

        // Fetch leaderboard and basic info
        Promise.all([
            fetch(`${API_BASE}/api/public/leaderboard/${guildId}`).then(res => res.ok ? res.json() : []),
            // Optional: Fetch guild info if there is a public route, otherwise fallback to "el servidor"
        ]).then(([lbData]) => {
            if (Array.isArray(lbData)) setLeaderboard(lbData);
            setLoading(false);
        }).catch(err => {
            console.error("Error loading public leaderboard:", err);
            setLoading(false);
        });
    }, [guildId]);

    const getMedalColor = (index: number) => {
        if (index === 0) return "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]";
        if (index === 1) return "text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]";
        if (index === 2) return "text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]";
        return "text-slate-500";
    };

    const getRankBg = (index: number) => {
        if (index === 0) return "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500";
        if (index === 1) return "bg-gradient-to-r from-slate-400/10 to-transparent border-l-2 border-slate-400";
        if (index === 2) return "bg-gradient-to-r from-amber-600/10 to-transparent border-l-2 border-amber-600";
        return "bg-white/5 border border-white/5";
    };

    if (loading) return (
        <div className="p-10 max-w-7xl mx-auto space-y-6 animate-pulse min-h-screen">
            <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-10"></div>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl w-full"></div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-yellow-500/30 font-sans">
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                            <Activity size={32} weight="fill" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-wide">Clasificación de Niveles</h1>
                            <p className="text-slate-400 flex items-center gap-2">
                                <Star size={16} className="text-yellow-400" />
                                Top de experiencia de {guildName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* LEADERBOARD */}
                <div className="glass-panel p-2 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden bg-white/[0.02]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8 px-4">
                        <h3 className="font-bold text-white flex items-center gap-2 text-xl">
                            <Trophy size={24} className="text-yellow-400" weight="duotone" />
                            Tabla de Clasificación
                        </h3>
                        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                            <Users size={18} className="text-slate-400" />
                            <span className="text-slate-300 font-bold">{leaderboard.length} Usuarios</span>
                        </div>
                    </div>

                    {leaderboard.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-500">
                                <Activity size={48} weight="duotone" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Sin actividad</h3>
                            <p className="text-slate-400 max-w-sm mx-auto">Aún no hay usuarios con experiencia en este servidor.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 relative z-10">
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-1 text-center">Rank</div>
                                <div className="col-span-5">Usuario</div>
                                <div className="col-span-2 text-center">Nivel</div>
                                <div className="col-span-2 text-center">XP Total</div>
                                <div className="col-span-2 text-center">Mensajes</div>
                            </div>

                            {leaderboard.map((user, index) => (
                                <div key={user.userId} className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 rounded-2xl transition-all hover:bg-white/10 group ${getRankBg(index)}`}>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <span className={`text-xl font-black ${getMedalColor(index)}`}>#{index + 1}</span>
                                    </div>
                                    <div className="col-span-5 flex items-center gap-4">
                                        <img src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/${parseInt(user.userId) % 5}.png`} alt={user.username} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-yellow-400/50 transition-all" />
                                        <div>
                                            <div className="font-bold text-white text-lg">{user.username}</div>
                                            <div className="text-xs text-slate-500 font-mono">{user.userId}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex items-center md:justify-center gap-2">
                                        <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Nivel:</span>
                                        <div className="bg-yellow-500/20 text-yellow-300 font-bold px-3 py-1 rounded-lg border border-yellow-500/30">LVL {user.level}</div>
                                    </div>
                                    <div className="col-span-2 flex items-center md:justify-center gap-2">
                                        <span className="md:hidden text-xs font-bold text-slate-500 uppercase">XP:</span>
                                        <span className="text-slate-300 font-mono font-medium">{user.xp.toLocaleString()}</span>
                                    </div>
                                    <div className="col-span-2 flex items-center md:justify-center gap-2">
                                        <span className="md:hidden text-xs font-bold text-slate-500 uppercase">Mensajes:</span>
                                        <span className="text-slate-400">{user.totalMessages.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
