"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Wrench, Globe, Hash, Terminal, FloppyDisk } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface BotConfig {
    prefix: string;
    language: string;
    ignoreChannels: string[];
    logsChannel: string;
}

export default function ConfigPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [config, setConfig] = useState<BotConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!guildId) return;
        fetch(`${API_BASE}/api/guilds/${guildId}/config`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading config:", err);
                setLoading(false);
            });
    }, [guildId]);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await fetch(`${API_BASE}/api/guilds/${guildId}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(config)
            });
        } catch (err) {
            console.error("Error saving config:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Cargando configuración...</div>;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
                    <Wrench size={32} weight="fill" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Configuración General</h1>
                    <p className="text-slate-400">Ajustes básicos del comportamiento del bot.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* General Settings */}
                <div className="space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Terminal size={20} className="text-blue-400" />
                            Ajustes Principales
                        </h3>

                        <div className="space-y-6">
                            {/* Prefix */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Prefijo del Bot</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={config?.prefix || ''}
                                        onChange={(e) => setConfig(prev => prev ? ({ ...prev, prefix: e.target.value }) : null)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors pl-10"
                                    />
                                    <Terminal size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Símbolo para ejecutar comandos (ej: !help)</p>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Idioma</label>
                                <div className="relative">
                                    <select
                                        value={config?.language || 'es'}
                                        onChange={(e) => setConfig(prev => prev ? ({ ...prev, language: e.target.value }) : null)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors pl-10 appearance-none"
                                    >
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                    </select>
                                    <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Channels & Save */}
                <div className="space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Hash size={20} className="text-purple-400" />
                            Canales
                        </h3>

                        <div className="space-y-6">
                            {/* Logs Channel */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Canal de Logs</label>
                                <input
                                    type="text"
                                    value={config?.logsChannel || ''}
                                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, logsChannel: e.target.value }) : null)}
                                    placeholder="ID del Canal"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                />
                                <p className="text-xs text-slate-500 mt-2">Canal donde se enviarán los registros de auditoría.</p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FloppyDisk size={18} weight="bold" />
                                            Guardar Configuración
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
