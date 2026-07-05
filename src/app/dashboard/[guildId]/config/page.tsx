"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wrench, FloppyDisk, CheckCircle, ChatCircleSlash, Translate, TerminalWindow, MonitorPlay } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface GuildConfiguration {
    prefix: string;
    language: string;
    logsChannel: string;
    ignoreChannels: string[];
}

interface GuildInfo {
    id: string;
    name: string;
    icon: string;
    channels: { id: string; name: string }[];
}

export default function GeneralConfigPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [config, setConfig] = useState<GuildConfiguration>({
        prefix: "pan!",
        language: "es",
        logsChannel: "",
        ignoreChannels: []
    });
    
    const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!guildId) return;

        Promise.all([
            fetch(`${API_BASE}/api/guilds/${guildId}/config`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
            fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' }).then(res => res.ok ? res.json() : null)
        ]).then(([configData, infoData]) => {
            if (configData) {
                setConfig({
                    prefix: configData.prefix || "pan!",
                    language: configData.language || "es",
                    logsChannel: configData.logsChannel || "",
                    ignoreChannels: configData.ignoreChannels || []
                });
            }
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
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/config`, {
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

    const toggleIgnoreChannel = (channelId: string) => {
        if (config.ignoreChannels.includes(channelId)) {
            setConfig({ ...config, ignoreChannels: config.ignoreChannels.filter(id => id !== channelId) });
        } else {
            setConfig({ ...config, ignoreChannels: [...config.ignoreChannels, channelId] });
        }
    };

    if (loading) return (
        <div className="p-10 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-10"></div>
            {[1, 2].map(i => (
                <div key={i} className="h-48 bg-white/5 rounded-2xl w-full"></div>
            ))}
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-500/20 flex items-center justify-center text-zinc-300 shadow-[0_0_20px_rgba(212,212,216,0.1)]">
                        <Wrench size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Configuración General</h1>
                        <p className="text-slate-400">Ajustes básicos y canales de registro del bot</p>
                    </div>
                </div>
                <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group w-fit">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Volver</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                
                {/* AJUSTES BASICOS */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-zinc-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <h3 className="text-xl font-bold text-white">Ajustes Básicos</h3>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <TerminalWindow size={18} className="text-zinc-400" /> Prefijo del Servidor
                            </label>
                            <input 
                                type="text" 
                                className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all"
                                value={config.prefix}
                                onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                                maxLength={5}
                            />
                            <p className="text-xs text-slate-500">Aunque PancyBot utiliza principalmente Comandos Slash (/), el prefijo se usa para comandos de texto retro-compatibles.</p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <Translate size={18} className="text-zinc-400" /> Idioma
                            </label>
                            <select 
                                className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all appearance-none"
                                value={config.language}
                                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                            >
                                <option value="es">Español (ES)</option>
                                <option value="en">English (EN)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* CANAL DE REGISTROS (LOGS) */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-zinc-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <h3 className="text-xl font-bold text-white">Registros (Logs)</h3>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                <MonitorPlay size={18} className="text-zinc-400" /> Canal de Logs
                            </label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all appearance-none"
                                value={config.logsChannel}
                                onChange={(e) => setConfig({ ...config, logsChannel: e.target.value })}
                            >
                                <option value="">Ninguno (Desactivado)</option>
                                {guildInfo?.channels?.map(ch => (
                                    <option key={ch.id} value={ch.id}># {ch.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500">Aquí se enviarán alertas de Automoderación, ataques Anti-Raid y reportes de seguridad importantes.</p>
                        </div>
                    </div>
                </div>

                {/* CANALES IGNORADOS */}
                <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-zinc-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <ChatCircleSlash size={24} className="text-zinc-400" />
                            <h3 className="text-xl font-bold text-white">Canales Ignorados</h3>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <p className="text-sm text-slate-400">Selecciona los canales donde el bot <strong>no funcionará</strong> (no leerá mensajes, no dará niveles, ni aplicará moderación).</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {guildInfo?.channels?.map(ch => {
                                const isIgnored = config.ignoreChannels.includes(ch.id);
                                return (
                                    <div 
                                        key={ch.id}
                                        onClick={() => toggleIgnoreChannel(ch.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isIgnored ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isIgnored ? 'bg-red-500 border-red-500 text-white' : 'border-slate-500'}`}>
                                            {isIgnored && <CheckCircle size={12} weight="bold" />}
                                        </div>
                                        <span className="font-medium truncate text-sm"># {ch.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* SAVE BUTTON BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-black/60 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-center pointer-events-none">
                <div className="max-w-7xl w-full flex items-center justify-between pointer-events-auto">
                    <div className="text-sm font-medium">
                        {saveStatus && (
                            <span className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 ${saveStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                                {saveStatus.includes('✅') && <CheckCircle size={18} weight="fill" />}
                                {saveStatus}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={handleSaveConfig}
                        disabled={saving}
                        className={`bg-zinc-200 hover:bg-white text-black font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,212,216,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        <FloppyDisk size={20} weight={saving ? "duotone" : "bold"} className={saving ? "animate-pulse" : ""} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}} />
        </div>
    );
}
