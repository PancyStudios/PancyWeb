"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, HandWaving, FloppyDisk, CheckCircle, ChatCircle, Hand, IdentificationCard, Trash, Plus } from 'phosphor-react';

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

interface GuildInfo {
    id: string;
    name: string;
    icon: string;
    roles: { id: string; name: string; color: number }[];
    channels: { id: string; name: string }[];
}

export default function GreetingsSettingsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [config, setConfig] = useState<GreetingsConfig>({
        welcome: { enable: false, channel: "", message: "", isDM: false },
        farewell: { enable: false, channel: "", message: "" },
        autorole: { enable: false, roles: [], delay: 0 }
    });
    
    const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>('');

    useEffect(() => {
        if (!guildId) return;

        Promise.all([
            fetch(`${API_BASE}/api/guilds/${guildId}/greetings`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
            fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' }).then(res => res.ok ? res.json() : null)
        ]).then(([configData, infoData]) => {
            if (configData) {
                // Merge with defaults in case some fields are missing
                setConfig({
                    welcome: { enable: false, channel: "", message: "", isDM: false, ...configData.welcome },
                    farewell: { enable: false, channel: "", message: "", ...configData.farewell },
                    autorole: { enable: false, roles: [], delay: 0, ...configData.autorole }
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
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/greetings`, {
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

    const handleAddRole = () => {
        if (!selectedRoleToAdd || config.autorole.roles.includes(selectedRoleToAdd)) return;
        setConfig({
            ...config,
            autorole: {
                ...config.autorole,
                roles: [...config.autorole.roles, selectedRoleToAdd]
            }
        });
        setSelectedRoleToAdd('');
    };

    const handleRemoveRole = (roleId: string) => {
        setConfig({
            ...config,
            autorole: {
                ...config.autorole,
                roles: config.autorole.roles.filter(id => id !== roleId)
            }
        });
    };

    if (loading) return (
        <div className="p-10 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-10"></div>
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/5 rounded-2xl w-full"></div>
            ))}
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <HandWaving size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Saludos y Bienvenidas</h1>
                        <p className="text-slate-400">Recibe a tus usuarios con estilo</p>
                    </div>
                </div>
                <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group w-fit">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Volver</span>
                </Link>
            </div>

            <div className="space-y-6 relative z-10">
                {/* WELCOME SECTION */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                                <ChatCircle size={24} weight="duotone" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Mensaje de Bienvenida</h3>
                                <p className="text-sm text-slate-400">Saluda a los nuevos miembros que entran al servidor.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={config.welcome.enable} onChange={(e) => setConfig({ ...config, welcome: { ...config.welcome, enable: e.target.checked } })} />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
                        </label>
                    </div>

                    <div className={`space-y-6 transition-all duration-300 relative z-10 ${config.welcome.enable ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-300">Canal de Bienvenida</label>
                                <select 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all appearance-none"
                                    value={config.welcome.channel}
                                    onChange={(e) => setConfig({ ...config, welcome: { ...config.welcome, channel: e.target.value } })}
                                    disabled={config.welcome.isDM}
                                >
                                    <option value="">Canal del Sistema por Defecto</option>
                                    {guildInfo?.channels?.map(ch => (
                                        <option key={ch.id} value={ch.id}># {ch.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center space-x-3 pt-8">
                                <input 
                                    type="checkbox" 
                                    id="isDMWelcome" 
                                    className="w-5 h-5 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900" 
                                    checked={config.welcome.isDM}
                                    onChange={(e) => setConfig({ ...config, welcome: { ...config.welcome, isDM: e.target.checked } })}
                                />
                                <label htmlFor="isDMWelcome" className="text-sm font-medium text-slate-300 cursor-pointer">Enviar mensaje por Privado (MD)</label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-300">Contenido del Mensaje</label>
                            <textarea 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none"
                                rows={3}
                                placeholder="¡Bienvenido/a {user} a nuestro servidor!"
                                value={config.welcome.message}
                                onChange={(e) => setConfig({ ...config, welcome: { ...config.welcome, message: e.target.value } })}
                            />
                            <p className="text-xs text-slate-500">Usa <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">{'{user}'}</code> para mencionar al usuario.</p>
                        </div>
                    </div>
                </div>

                {/* FAREWELL SECTION */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                                <Hand size={24} weight="duotone" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Mensaje de Despedida</h3>
                                <p className="text-sm text-slate-400">Notifica cuando alguien sale del servidor.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={config.farewell.enable} onChange={(e) => setConfig({ ...config, farewell: { ...config.farewell, enable: e.target.checked } })} />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                        </label>
                    </div>

                    <div className={`space-y-6 transition-all duration-300 relative z-10 ${config.farewell.enable ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-300">Canal de Despedida</label>
                            <select 
                                className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all appearance-none"
                                value={config.farewell.channel}
                                onChange={(e) => setConfig({ ...config, farewell: { ...config.farewell, channel: e.target.value } })}
                            >
                                <option value="">Canal del Sistema por Defecto</option>
                                {guildInfo?.channels?.map(ch => (
                                    <option key={ch.id} value={ch.id}># {ch.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-300">Contenido del Mensaje</label>
                            <textarea 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                                rows={2}
                                placeholder="👋 **{user}** ha salido del servidor."
                                value={config.farewell.message}
                                onChange={(e) => setConfig({ ...config, farewell: { ...config.farewell, message: e.target.value } })}
                            />
                            <p className="text-xs text-slate-500">Usa <code className="text-red-400 bg-red-400/10 px-1 rounded">{'{user}'}</code> para mostrar el nombre del usuario (sin mención, ya que no está).</p>
                        </div>
                    </div>
                </div>

                {/* AUTOROLE SECTION */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-green-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                                <IdentificationCard size={24} weight="duotone" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Auto-Rol</h3>
                                <p className="text-sm text-slate-400">Asigna roles automáticamente a los recién llegados.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={config.autorole.enable} onChange={(e) => setConfig({ ...config, autorole: { ...config.autorole, enable: e.target.checked } })} />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                        </label>
                    </div>

                    <div className={`space-y-6 transition-all duration-300 relative z-10 ${config.autorole.enable ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-slate-300">Retraso de Asignación (Delay)</label>
                            <div className="flex items-center gap-3 w-full md:w-1/3">
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    value={config.autorole.delay}
                                    onChange={(e) => setConfig({ ...config, autorole: { ...config.autorole, delay: parseInt(e.target.value) || 0 } })}
                                />
                                <span className="text-sm text-slate-400">segundos</span>
                            </div>
                            <p className="text-xs text-slate-500">Tiempo de espera antes de dar el rol. Útil para evadir raids rápidos.</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <label className="block text-sm font-bold text-slate-300">Roles Asignados</label>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select 
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                                    value={selectedRoleToAdd}
                                    onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                                >
                                    <option value="">Selecciona un Rol...</option>
                                    {guildInfo?.roles?.map(r => (
                                        <option key={r.id} value={r.id}>@{r.name}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleAddRole}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} weight="bold" /> Añadir
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {config.autorole.roles.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No hay roles configurados.</p>
                                ) : (
                                    config.autorole.roles.map(roleId => {
                                        const role = guildInfo?.roles?.find(r => r.id === roleId);
                                        return (
                                            <div key={roleId} className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role?.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#94a3b8' }}></div>
                                                <span className="text-sm font-medium text-slate-200">@{role?.name || "Rol desconocido"}</span>
                                                <button 
                                                    onClick={() => handleRemoveRole(roleId)}
                                                    className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
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
                        className={`bg-cyan-500 hover:bg-cyan-400 text-black font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        <FloppyDisk size={20} weight={saving ? "duotone" : "bold"} className={saving ? "animate-pulse" : ""} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

        </div>
    );
}
