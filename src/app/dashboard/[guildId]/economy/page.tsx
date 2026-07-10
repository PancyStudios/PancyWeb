"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CurrencyCircleDollar, FloppyDisk, CheckCircle, Package, Trash, Plus, TrendUp, Coin } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface EconomyConfig {
    enable: boolean;
    currencyName: string;
    currencySymbol: string;
    work: { min: number; max: number };
    crime: { min: number; max: number; failChance: number };
}

interface EconomyItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    sell_price: number;
    type: string;
    emoji: string;
    stock: number;
}

export default function LocalEconomyConfigPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [config, setConfig] = useState<EconomyConfig>({
        enable: false,
        currencyName: "Coins",
        currencySymbol: "🪙",
        work: { min: 100, max: 500 },
        crime: { min: 200, max: 1000, failChance: 40 }
    });
    
    const [items, setItems] = useState<EconomyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    
    // New item form
    const [showNewItemForm, setShowNewItemForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: 0, emoji: '📦' });

    useEffect(() => {
        if (!guildId) return;

        Promise.all([
            fetch(`${API_BASE}/api/guilds/${guildId}/economy`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
            fetch(`${API_BASE}/api/guilds/${guildId}/economy/items`, { credentials: 'include' }).then(res => res.ok ? res.json() : null)
        ]).then(([configData, itemsData]) => {
            if (configData) {
                setConfig(configData);
            }
            if (itemsData) {
                setItems(itemsData);
            }
            setLoading(false);
        }).catch(err => {
            console.error("Error loading economy config:", err);
            setLoading(false);
        });
    }, [guildId]);

    const handleSaveConfig = async () => {
        setSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/economy`, {
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

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/economy/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                const createdItem = await res.json();
                setItems([...items, createdItem]);
                setNewItem({ name: '', description: '', price: 0, emoji: '📦' });
                setShowNewItemForm(false);
            }
        } catch (error) {
            console.error("Error creating item:", error);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/economy/items/${itemId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setItems(items.filter(i => i._id !== itemId));
            }
        } catch (error) {
            console.error("Error deleting item:", error);
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
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                        <CurrencyCircleDollar size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Economía Local</h1>
                        <p className="text-slate-400">Configura la moneda y la tienda de este servidor</p>
                    </div>
                </div>
                <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group w-fit">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Volver</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                
                {/* AJUSTES BÁSICOS */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-yellow-500/10 transition-colors"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <h3 className="text-xl font-bold text-white">Configuración Básica</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-400">Estado:</span>
                            <button 
                                onClick={() => setConfig({ ...config, enable: !config.enable })}
                                className={`w-12 h-6 rounded-full flex items-center transition-all p-1 ${config.enable ? 'bg-green-500' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.enable ? 'translate-x-6' : ''}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                    <Coin size={18} className="text-yellow-400" /> Nombre Moneda
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                                    value={config.currencyName}
                                    onChange={(e) => setConfig({ ...config, currencyName: e.target.value })}
                                    placeholder="ej: Monedas"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">Símbolo / Emoji</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                                    value={config.currencySymbol}
                                    onChange={(e) => setConfig({ ...config, currencySymbol: e.target.value })}
                                    placeholder="ej: 🪙"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h4 className="font-bold text-white flex items-center gap-2">
                                <TrendUp size={18} className="text-green-400" /> Recompensas de Trabajo (/work)
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400">Mínimo</label>
                                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                                        value={config.work.min} onChange={e => setConfig({ ...config, work: { ...config.work, min: parseInt(e.target.value) || 0 } })} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400">Máximo</label>
                                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                                        value={config.work.max} onChange={e => setConfig({ ...config, work: { ...config.work, max: parseInt(e.target.value) || 0 } })} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h4 className="font-bold text-white">Recompensas de Crimen (/crime)</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400">Mínimo</label>
                                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                                        value={config.crime.min} onChange={e => setConfig({ ...config, crime: { ...config.crime, min: parseInt(e.target.value) || 0 } })} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400">Máximo</label>
                                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                                        value={config.crime.max} onChange={e => setConfig({ ...config, crime: { ...config.crime, max: parseInt(e.target.value) || 0 } })} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400">Prob. Fallo (%)</label>
                                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                                        value={config.crime.failChance} onChange={e => setConfig({ ...config, crime: { ...config.crime, failChance: parseInt(e.target.value) || 0 } })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TIENDA / OBJETOS */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-black/20 overflow-hidden relative group">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <Package size={24} className="text-amber-400" />
                            <h3 className="text-xl font-bold text-white">Objetos de Tienda</h3>
                        </div>
                        <button onClick={() => setShowNewItemForm(!showNewItemForm)} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                            <Plus size={16} weight="bold" /> Crear
                        </button>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {showNewItemForm && (
                            <form onSubmit={handleCreateItem} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 mb-4">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-400">Nombre</label>
                                        <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                                            value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400">Emoji</label>
                                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                                            value={newItem.emoji} onChange={e => setNewItem({...newItem, emoji: e.target.value})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400">Precio</label>
                                        <input required type="number" min="0" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                                            value={newItem.price} onChange={e => setNewItem({...newItem, price: parseInt(e.target.value) || 0})} />
                                    </div>
                                    <div className="flex items-end">
                                        <button type="submit" className="w-full py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                                            Añadir Objeto
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {items.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">No hay objetos en la tienda.</p>
                            ) : (
                                items.map(item => (
                                    <div key={item._id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{item.emoji}</div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{item.name}</div>
                                                <div className="text-xs text-yellow-400 font-mono flex items-center gap-1">
                                                    {item.price} {config.currencySymbol}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteItem(item._id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash size={16} weight="bold" />
                                        </button>
                                    </div>
                                ))
                            )}
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
                        className={`bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
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
