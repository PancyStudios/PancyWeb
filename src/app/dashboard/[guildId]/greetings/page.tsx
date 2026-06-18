"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HandWaving, PaperPlaneRight, UserMinus, IdentificationBadge, FloppyDisk } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface WelcomeConfig {
    enable: boolean;
    channel: string;
    message: string;
    isDM: boolean;
}

interface FarewellConfig {
    enable: boolean;
    channel: string;
    message: string;
}

interface AutoroleConfig {
    enable: boolean;
    roles: string[];
    delay: number;
}

interface GreetingsConfig {
    welcome: WelcomeConfig;
    farewell: FarewellConfig;
    autorole: AutoroleConfig;
}

export default function GreetingsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [config, setConfig] = useState<GreetingsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!guildId) return;
        fetch(`${API_BASE}/api/guilds/${guildId}/greetings`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading greetings config:", err);
                setLoading(false);
            });
    }, [guildId]);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await fetch(`${API_BASE}/api/guilds/${guildId}/greetings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(config)
            });
        } catch (err) {
            console.error("Error saving greetings config:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Cargando sistema de saludos...</div>;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                        <HandWaving size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Bienvenidas y Despedidas</h1>
                        <p className="text-slate-400">Personaliza la experiencia de entrada y salida de los usuarios.</p>
                    </div>
                </div>
                <Link href={`/dashboard/${guildId}`} className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all">
                    <span className="font-bold">Volver al Panel</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Welcome & Farewell */}
                <div className="space-y-6">

                    {/* Welcome Config */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <PaperPlaneRight size={20} className="text-cyan-400" />
                                Mensaje de Bienvenida
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config?.welcome?.enable || false}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, welcome: { ...prev.welcome, enable: e.target.checked } } : null)}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
                            </label>
                        </div>

                        <div className={`space-y-4 transition-opacity ${config?.welcome?.enable ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Canal Destino</label>
                                <input
                                    type="text"
                                    value={config?.welcome?.channel || ''}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, welcome: { ...prev.welcome, channel: e.target.value } } : null)}
                                    placeholder="ID del Canal"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Mensaje</label>
                                <textarea
                                    value={config?.welcome?.message || ''}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, welcome: { ...prev.welcome, message: e.target.value } } : null)}
                                    placeholder="¡Hola {user}, bienvenido a {server}!"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors min-h-[100px]"
                                />
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <input
                                    type="checkbox"
                                    id="isDM"
                                    checked={config?.welcome?.isDM || false}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, welcome: { ...prev.welcome, isDM: e.target.checked } } : null)}
                                    className="w-4 h-4 rounded text-cyan-500 bg-black/20 border-white/10 focus:ring-cyan-500 focus:ring-offset-0"
                                />
                                <label htmlFor="isDM" className="text-sm text-slate-300 select-none cursor-pointer">Enviar mensaje por DM en lugar de canal público</label>
                            </div>
                        </div>
                    </div>

                    {/* Farewell Config */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <UserMinus size={20} className="text-red-400" />
                                Mensaje de Despedida
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config?.farewell?.enable || false}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, farewell: { ...prev.farewell, enable: e.target.checked } } : null)}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                            </label>
                        </div>

                        <div className={`space-y-4 transition-opacity ${config?.farewell?.enable ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Canal Destino</label>
                                <input
                                    type="text"
                                    value={config?.farewell?.channel || ''}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, farewell: { ...prev.farewell, channel: e.target.value } } : null)}
                                    placeholder="ID del Canal"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Mensaje</label>
                                <textarea
                                    value={config?.farewell?.message || ''}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, farewell: { ...prev.farewell, message: e.target.value } } : null)}
                                    placeholder="{user} ha abandonado el servidor."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Autorole & Save */}
                <div className="space-y-6">
                    
                    {/* Autorole Config */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <IdentificationBadge size={20} className="text-indigo-400" />
                                Roles Automáticos (Autorole)
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config?.autorole?.enable || false}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, autorole: { ...prev.autorole, enable: e.target.checked } } : null)}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 shadow-inner"></div>
                            </label>
                        </div>

                        <div className={`space-y-4 transition-opacity ${config?.autorole?.enable ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">IDs de Roles (Separados por comas)</label>
                                <input
                                    type="text"
                                    value={config?.autorole?.roles?.join(', ') || ''}
                                    onChange={(e) => {
                                        const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                                        setConfig(prev => prev ? { ...prev, autorole: { ...prev.autorole, roles: ids } } : null);
                                    }}
                                    placeholder="123456789, 987654321"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                />
                                <p className="text-xs text-slate-500 mt-2">Los roles asignados automáticamente a los usuarios cuando se unen.</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Retraso (Delay) en Milisegundos</label>
                                <input
                                    type="number"
                                    value={config?.autorole?.delay || 0}
                                    onChange={(e) => setConfig(prev => prev ? { ...prev, autorole: { ...prev.autorole, delay: parseInt(e.target.value) || 0 } } : null)}
                                    placeholder="0"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                />
                                <p className="text-xs text-slate-500 mt-2">Tiempo de espera antes de entregar el rol (1000 = 1 segundo).</p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="glass-panel p-8 rounded-3xl border border-white/5">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FloppyDisk size={18} weight="bold" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
