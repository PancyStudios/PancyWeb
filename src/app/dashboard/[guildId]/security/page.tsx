"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FloppyDisk, CheckCircle, Robot, Fingerprint } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface GuildInfo {
    id: string;
    name: string;
    channels: { id: string; name: string }[];
    roles: { id: string; name: string; color: number }[];
}

interface SecurityConfig {
    antibots: {
        enable: boolean;
        _type: string;
    };
    verification: {
        enable: boolean;
        _type: string;
        channel: string;
        role: string;
        minAccountAgeDays: number;
    };
}

export default function SecurityPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [config, setConfig] = useState<SecurityConfig>({
        antibots: { enable: false, _type: "all" },
        verification: { enable: false, _type: "button", channel: "", role: "", minAccountAgeDays: 0 }
    });
    
    const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!guildId) return;

        Promise.all([
            fetch(`${API_BASE}/api/guilds/${guildId}/security`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
            fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' }).then(res => res.ok ? res.json() : null)
        ]).then(([configData, infoData]) => {
            if (configData) {
                setConfig({
                    antibots: { 
                        enable: configData.antibots?.enable || false, 
                        _type: configData.antibots?._type || "all" 
                    },
                    verification: { 
                        enable: configData.verification?.enable || false, 
                        _type: configData.verification?._type || "button",
                        channel: configData.verification?.channel || "",
                        role: configData.verification?.role || "",
                        minAccountAgeDays: configData.verification?.minAccountAgeDays || 0
                    }
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
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/security`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    antibots: config.antibots,
                    verification: config.verification
                })
            });
            if (!res.ok) throw new Error("Error guardando");
            setSaveStatus("✅ ¡Seguridad guardada correctamente!");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setSaveStatus("❌ Error al guardar");
        }
        setSaving(false);
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
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                        <ShieldCheck size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Seguridad y Anti-Raid</h1>
                        <p className="text-slate-400">Protege tu servidor de cuentas falsas y bots maliciosos</p>
                    </div>
                </div>
                <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group w-fit">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Volver</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                
                {/* ANTIBOTS */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-orange-500/10 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-orange-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <Robot size={24} className="text-orange-400" />
                            <h3 className="text-xl font-bold text-white">Protección Anti-Bots</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={config.antibots.enable}
                                onChange={(e) => setConfig({ ...config, antibots: { ...config.antibots, enable: e.target.checked } })}
                            />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500 shadow-inner"></div>
                        </label>
                    </div>

                    <div className={`space-y-6 relative z-10 transition-all duration-300 ${!config.antibots.enable ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                        <p className="text-sm text-slate-400">Evita que administradores o usuarios maliciosos añadan bots de raideo al servidor.</p>
                        
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-300">Rigor del Bloqueo</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                                value={config.antibots._type}
                                onChange={(e) => setConfig({ ...config, antibots: { ...config.antibots, _type: e.target.value } })}
                            >
                                <option value="all">Bloquear TODOS los bots</option>
                                <option value="only_nv">Bloquear SOLO bots No Verificados por Discord</option>
                            </select>
                            <p className="text-xs text-slate-500">Recomendamos bloquear solo bots no verificados, para permitir que se agreguen bots legítimos.</p>
                        </div>
                    </div>
                </div>

                {/* VERIFICATION */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/10 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <Fingerprint size={24} className="text-emerald-400" />
                            <h3 className="text-xl font-bold text-white">Sistema de Verificación</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={config.verification.enable}
                                onChange={(e) => setConfig({ ...config, verification: { ...config.verification, enable: e.target.checked } })}
                            />
                            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                        </label>
                    </div>

                    <div className={`space-y-6 relative z-10 transition-all duration-300 ${!config.verification.enable ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                        <p className="text-sm text-slate-400">Los usuarios tendrán que hacer clic en un botón en un canal específico para poder acceder al resto del servidor.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-300 mb-2 block">Modo de Verificación</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, verification: { ...config.verification, _type: "button" } })}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${config.verification._type === "button" ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        <CheckCircle size={24} weight="duotone" className="mb-2" />
                                        <span className="font-bold text-sm">Botón de Discord</span>
                                        <span className="text-xs opacity-70 mt-1">Rápido y sencillo</span>
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, verification: { ...config.verification, _type: "web" } })}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${config.verification._type === "web" ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        <ShieldCheck size={24} weight="duotone" className="mb-2" />
                                        <span className="font-bold text-sm">Portal Web Seguro</span>
                                        <span className="text-xs opacity-70 mt-1">Bloquea VPNs y Alts</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-300 mb-2 block">Canal de Verificación</label>
                                    <select 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                        value={config.verification.channel}
                                        onChange={(e) => setConfig({ ...config, verification: { ...config.verification, channel: e.target.value } })}
                                    >
                                        <option value="">Selecciona un canal...</option>
                                        {guildInfo?.channels?.map(ch => (
                                            <option key={ch.id} value={ch.id}># {ch.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-300 mb-2 block">Rol de Verificado</label>
                                    <select 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                        value={config.verification.role}
                                        onChange={(e) => setConfig({ ...config, verification: { ...config.verification, role: e.target.value } })}
                                    >
                                        <option value="">Selecciona un rol...</option>
                                        {guildInfo?.roles?.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-slate-300 block mb-1">Antigüedad Mínima (Días)</label>
                                <p className="text-xs text-slate-500 mb-2">Rechazar cuentas con menos de X días de creadas. (0 para desactivar)</p>
                                <input 
                                    type="number"
                                    min="0"
                                    max="365"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={config.verification.minAccountAgeDays}
                                    onChange={(e) => setConfig({ ...config, verification: { ...config.verification, minAccountAgeDays: parseInt(e.target.value) || 0 } })}
                                />
                            </div>

                            <div className="pt-2">
                                <p className="text-xs text-slate-500 bg-white/5 p-3 rounded-xl border border-white/10">
                                    <strong>¿Cómo envío el panel?</strong><br/>
                                    Ve a tu servidor de Discord y ejecuta el comando <code className="text-emerald-400">/security verification panel</code>. El bot enviará el mensaje con el botón al canal seleccionado.
                                </p>
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
                        className={`bg-zinc-200 hover:bg-white text-black font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,212,216,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        <FloppyDisk size={20} weight={saving ? "duotone" : "bold"} className={saving ? "animate-pulse" : ""} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
