"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FloppyDisk, CheckCircle, Warning, TextAa, LinkBreak, Trash, Plus } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface DataModerationEvents {
    capitalLetters: boolean;
    linkDetect: boolean;
}

interface DataModerationConfig {
    badwords: string[];
    events: DataModerationEvents;
}

interface ModerationConfig {
    dataModeration: DataModerationConfig;
}

export default function ModerationSettingsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [config, setConfig] = useState<ModerationConfig>({
        dataModeration: {
            badwords: [],
            events: { capitalLetters: false, linkDetect: false }
        }
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [newBadword, setNewBadword] = useState<string>('');

    useEffect(() => {
        if (!guildId) return;

        fetch(`${API_BASE}/api/guilds/${guildId}/moderation/config`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.dataModeration) {
                    setConfig({
                        dataModeration: {
                            badwords: data.dataModeration.badwords || [],
                            events: {
                                capitalLetters: data.dataModeration.events?.capitalLetters || false,
                                linkDetect: data.dataModeration.events?.linkDetect || false
                            }
                        }
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading config:", err);
                setLoading(false);
            });
    }, [guildId]);

    const handleSaveConfig = async () => {
        setSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/moderation/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    dataModeration: config.dataModeration
                })
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

    const handleAddBadword = () => {
        const word = newBadword.trim().toLowerCase();
        if (!word || config.dataModeration.badwords.includes(word)) return;
        
        setConfig({
            ...config,
            dataModeration: {
                ...config.dataModeration,
                badwords: [...config.dataModeration.badwords, word]
            }
        });
        setNewBadword('');
    };

    const handleRemoveBadword = (word: string) => {
        setConfig({
            ...config,
            dataModeration: {
                ...config.dataModeration,
                badwords: config.dataModeration.badwords.filter(w => w !== word)
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddBadword();
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
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                        <ShieldCheck size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Automoderación</h1>
                        <p className="text-slate-400">Protege tu servidor 24/7 automáticamente</p>
                    </div>
                </div>
                <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group w-fit">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Volver</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                
                {/* BADWORDS PANEL */}
                <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>
                    
                    <div className="flex items-center gap-4 border-b border-white/10 pb-6 relative z-10">
                        <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                            <Warning size={24} weight="duotone" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Filtro de Malas Palabras</h3>
                            <p className="text-sm text-slate-400">PancyBot borrará automáticamente los mensajes que contengan estas palabras.</p>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="text" 
                                placeholder="Escribe una palabra y presiona Enter..." 
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                value={newBadword}
                                onChange={(e) => setNewBadword(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button 
                                onClick={handleAddBadword}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} weight="bold" /> Añadir
                            </button>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 min-h-[200px] flex flex-wrap gap-2 content-start">
                            {config.dataModeration.badwords.length === 0 ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 py-10">
                                    <Warning size={48} weight="thin" className="mb-3 opacity-50" />
                                    <p>Tu lista está vacía. Añade palabras arriba.</p>
                                </div>
                            ) : (
                                config.dataModeration.badwords.map(word => (
                                    <div key={word} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5 group hover:bg-red-500/20 transition-all">
                                        <span className="text-sm font-medium text-red-200">{word}</span>
                                        <button 
                                            onClick={() => handleRemoveBadword(word)}
                                            className="ml-1 text-red-400/50 hover:text-red-400 transition-colors"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ADVANCED FILTERS PANEL */}
                <div className="lg:col-span-1 glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group h-fit">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-orange-500/10 transition-colors"></div>
                    
                    <div className="border-b border-white/10 pb-6 relative z-10">
                        <h3 className="text-xl font-bold text-white mb-1">Filtros Avanzados</h3>
                        <p className="text-sm text-slate-400">Reglas estrictas para el chat.</p>
                    </div>

                    <div className="space-y-6 relative z-10">
                        
                        {/* Anti-Links */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                                    <LinkBreak size={20} weight="duotone" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Anti-Links</h4>
                                    <p className="text-xs text-slate-400">Bloquea cualquier enlace.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={config.dataModeration.events.linkDetect} onChange={(e) => setConfig({ ...config, dataModeration: { ...config.dataModeration, events: { ...config.dataModeration.events, linkDetect: e.target.checked } } })} />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 shadow-inner"></div>
                            </label>
                        </div>

                        {/* Anti-Caps */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                                    <TextAa size={20} weight="duotone" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Anti-Mayúsculas</h4>
                                    <p className="text-xs text-slate-400">Bloquea texto gritando.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={config.dataModeration.events.capitalLetters} onChange={(e) => setConfig({ ...config, dataModeration: { ...config.dataModeration, events: { ...config.dataModeration.events, capitalLetters: e.target.checked } } })} />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 shadow-inner"></div>
                            </label>
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
                        className={`bg-orange-500 hover:bg-orange-400 text-black font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        <FloppyDisk size={20} weight={saving ? "duotone" : "bold"} className={saving ? "animate-pulse" : ""} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

        </div>
    );
}
