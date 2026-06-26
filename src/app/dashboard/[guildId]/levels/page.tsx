"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Gear, FloppyDisk, Plus, Trash, CheckCircle, Trophy, ArrowSquareOut } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

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

export default function LevelsSettingsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

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

        Promise.all([
            fetch(`${API_BASE}/api/guilds/${guildId}/levels/config`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
            fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' }).then(res => res.ok ? res.json() : null)
        ]).then(([configData, infoData]) => {
            if (configData) setConfig(configData);
            if (infoData) setGuildInfo(infoData);
            setLoading(false);
        }).catch(err => {
            console.error("Error loading config:", err);
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

    if (loading) return (
        <div className="p-10 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-10"></div>
            {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-white/5 rounded-2xl w-full"></div>
            ))}
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Gear size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Ajustes de Niveles</h1>
                        <p className="text-slate-400 flex items-center gap-2">
                            <Star size={16} className="text-blue-400" />
                            Configura las recompensas y experiencia
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/leaderboard/${guildId}`} target="_blank" className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 px-5 py-2.5 rounded-xl transition-all font-bold">
                        <Trophy size={18} weight="duotone" />
                        <span>Ver Leaderboard Público</span>
                        <ArrowSquareOut size={16} />
                    </Link>
                    <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Volver</span>
                    </Link>
                </div>
            </div>

            {/* SETTINGS UI */}
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
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {/* Channel Config */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-300">Canal de Level Up</label>
                        <select 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
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
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            rows={2}
                            placeholder="¡Felicidades {user}, has subido al Nivel {level}!"
                            value={config.levelUpMessage}
                            onChange={(e) => setConfig({ ...config, levelUpMessage: e.target.value })}
                        />
                        <p className="text-xs text-slate-500">Variables soportadas: <code className="text-blue-400 bg-blue-400/10 px-1 rounded">{'{user}'}</code>, <code className="text-blue-400 bg-blue-400/10 px-1 rounded">{'{level}'}</code></p>
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
                        className={`bg-blue-500 hover:bg-blue-400 text-white font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        <FloppyDisk size={20} weight={saving ? "duotone" : "fill"} className={saving ? "animate-pulse" : ""} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
