"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Activity, Trophy, ArrowLeft, Star, Users, Gear, FloppyDisk, Plus, Trash, CheckCircle } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface LeaderboardEntry {
    userId: string;
    username: string;
    avatarUrl: string;
    level: number;
    xp: number;
    totalMessages: number;
}

interface LevelReward {
    level: number;
    roleId: string;
}

interface LevelsConfig {
    enable: boolean;
    levelUpChannel: string;
    levelUpMessage: string;
    rewards: LevelReward[];
}

interface GuildInfo {
    id: string;
    name: string;
    icon: string;
    roles: { id: string; name: string; color: number }[];
    channels: { id: string; name: string }[];
}

export default function LevelsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [activeTab, setActiveTab] = useState<'leaderboard' | 'settings'>('leaderboard');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [config, setConfig] = useState<LevelsConfig>({ enable: false, levelUpChannel: "", levelUpMessage: "", rewards: [] });
    const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Form states for new reward
    const [newRewardLevel, setNewRewardLevel] = useState<string>('');
    const [newRewardRole, setNewRewardRole] = useState<string>('');

    useEffect(() => {
        if (!guildId) return;

        // Fetch leaderboard, config, and guild info simultaneously
        Promise.all([
            fetch(`${API_BASE}/api/guilds/${guildId}/levels`, { credentials: 'include' }).then(res => res.ok ? res.json() : []),
            fetch(`${API_BASE}/api/guilds/${guildId}/levels/config`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
            fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' }).then(res => res.ok ? res.json() : null)
        ]).then(([lbData, configData, infoData]) => {
            if (Array.isArray(lbData)) setLeaderboard(lbData);
            if (configData) setConfig(configData);
            if (infoData) setGuildInfo(infoData);
            setLoading(false);
        }).catch(err => {
            console.error("Error loading data:", err);
            setLoading(false);
        });
    }, [guildId]);

    const handleSaveConfig = async () => {
        setSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/levels/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(config)
            });
            if (!res.ok) throw new Error("Error guardando");
            setSaveStatus("✅ ¡Configuración guardada correctamente!");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setSaveStatus("❌ Error al guardar la configuración");
        }
        setSaving(false);
    };

    const handleAddReward = () => {
        const level = parseInt(newRewardLevel);
        if (isNaN(level) || level <= 0 || !newRewardRole) return;
        
        // Remove if existing at same level, then add
        const filtered = config.rewards.filter(r => r.level !== level);
        setConfig({
            ...config,
            rewards: [...filtered, { level, roleId: newRewardRole }].sort((a, b) => a.level - b.level)
        });
        setNewRewardLevel('');
        setNewRewardRole('');
    };

    const handleRemoveReward = (levelToRemove: number) => {
        setConfig({
            ...config,
            rewards: config.rewards.filter(r => r.level !== levelToRemove)
        });
    };

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
        <div className="p-10 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-10"></div>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl w-full"></div>
            ))}
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                        <Activity size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Sistema de Niveles</h1>
                        <p className="text-slate-400 flex items-center gap-2">
                            <Star size={16} className="text-yellow-400" />
                            Clasificación y Configuración de XP
                        </p>
                    </div>
                </div>
                <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group w-fit">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Volver al Panel</span>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit border border-white/5">
                <button 
                    onClick={() => setActiveTab('leaderboard')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Trophy size={20} weight={activeTab === 'leaderboard' ? 'fill' : 'regular'} />
                    Clasificación
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Gear size={20} weight={activeTab === 'settings' ? 'fill' : 'regular'} />
                    Configuración
                </button>
            </div>

            {/* LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
                <div className="glass-panel p-2 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
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
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between relative z-10 bg-white/5 p-6 rounded-2xl border border-white/5">
                        <div>
                            <h3 className="text-xl font-bold text-white">Activar Sistema de Niveles</h3>
                            <p className="text-slate-400 text-sm mt-1">Los usuarios ganarán experiencia por cada mensaje que envíen.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={config.enable} onChange={(e) => setConfig({ ...config, enable: e.target.checked })} />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 shadow-inner"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {/* Channel Config */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-300">Canal de Level Up</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all appearance-none"
                                value={config.levelUpChannel}
                                onChange={(e) => setConfig({ ...config, levelUpChannel: e.target.value })}
                            >
                                <option value="">Mismo canal del mensaje</option>
                                {guildInfo?.channels?.map(ch => (
                                    <option key={ch.id} value={ch.id}># {ch.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500">¿Dónde quieres que el bot anuncie las subidas de nivel?</p>
                        </div>

                        {/* Message Config */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-300">Mensaje de Level Up</label>
                            <textarea 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all resize-none"
                                rows={2}
                                placeholder="¡Felicidades {user}, has subido al Nivel {level}!"
                                value={config.levelUpMessage}
                                onChange={(e) => setConfig({ ...config, levelUpMessage: e.target.value })}
                            />
                            <p className="text-xs text-slate-500">Variables soportadas: <code className="text-yellow-400 bg-yellow-400/10 px-1 rounded">{'{user}'}</code>, <code className="text-yellow-400 bg-yellow-400/10 px-1 rounded">{'{level}'}</code></p>
                        </div>
                    </div>

                    {/* Rewards Config */}
                    <div className="relative z-10 bg-black/20 p-6 rounded-2xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Trophy size={20} weight="fill" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Recompensas por Nivel</h3>
                                <p className="text-sm text-slate-400">Asigna roles a los usuarios automáticamente cuando alcancen un nivel específico.</p>
                            </div>
                        </div>

                        {/* Add Reward Form */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="number" 
                                placeholder="Nivel (Ej: 5)" 
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 sm:w-32"
                                value={newRewardLevel}
                                onChange={(e) => setNewRewardLevel(e.target.value)}
                            />
                            <select 
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                                value={newRewardRole}
                                onChange={(e) => setNewRewardRole(e.target.value)}
                            >
                                <option value="">Selecciona un Rol a entregar...</option>
                                {guildInfo?.roles?.map(r => (
                                    <option key={r.id} value={r.id}>@{r.name}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleAddReward}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} weight="bold" /> Añadir
                            </button>
                        </div>

                        {/* Rewards List */}
                        <div className="space-y-2 mt-6">
                            {config.rewards.length === 0 ? (
                                <p className="text-center text-slate-500 py-4 italic">No hay ninguna recompensa configurada aún.</p>
                            ) : (
                                config.rewards.map(reward => {
                                    const role = guildInfo?.roles?.find(r => r.id === reward.roleId);
                                    return (
                                        <div key={reward.level} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white/10 font-bold text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                    <Star size={14} className="text-yellow-400" weight="fill" />
                                                    Nivel {reward.level}
                                                </div>
                                                <div className="text-slate-300 font-medium flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role?.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#94a3b8' }}></div>
                                                    @{role?.name || "Rol desconocido"}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveReward(reward.level)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-all"
                                                title="Eliminar recompensa"
                                            >
                                                <Trash size={20} weight="duotone" />
                                            </button>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-sm font-medium">
                            {saveStatus && (
                                <span className={saveStatus.includes('✅') ? 'text-green-400 flex items-center gap-2' : 'text-red-400 flex items-center gap-2'}>
                                    {saveStatus.includes('✅') && <CheckCircle size={18} weight="fill" />}
                                    {saveStatus}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={handleSaveConfig}
                            disabled={saving}
                            className={`bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                        >
                            <FloppyDisk size={20} weight={saving ? "duotone" : "fill"} className={saving ? "animate-pulse" : ""} />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}
