"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BellRinging, Trash, Plus, FloppyDisk, CheckCircle } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface PojConfig {
    channelId: string;
    roleId: string;
}

export default function PojSettingsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [pojList, setPojList] = useState<PojConfig[]>([]);
    const [channels, setChannels] = useState<{id: string, name: string}[]>([]);
    const [roles, setRoles] = useState<{id: string, name: string, color: number}[]>([]);
    const [loading, setLoading] = useState(true);
    
    // New Config Form
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!guildId) return;

        // Fetch PoJ configurations
        fetch(`${API_BASE}/api/guilds/${guildId}/poj`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setPojList(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading POJ:", err);
                setLoading(false);
            });

        // Fetch channels and roles
        fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : {})
            .then((data: any) => {
                if (data.channels) setChannels(data.channels);
                if (data.roles) setRoles(data.roles);
            })
            .catch(console.error);
    }, [guildId]);

    const handleAdd = async () => {
        if (!selectedChannel || !selectedRole) return alert("Selecciona un canal y un rol");
        
        setSaving(true);
        setStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/poj`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ channelId: selectedChannel, roleId: selectedRole })
            });
            if (!res.ok) throw new Error("Error guardando");
            const updated = await res.json();
            setPojList(updated);
            
            setStatus("✅ Configuración añadida");
            setSelectedChannel('');
            setSelectedRole('');
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setStatus("❌ Error al guardar");
        }
        setSaving(false);
    };

    const handleDelete = async (channelId: string) => {
        if (!confirm("¿Seguro que quieres borrar la configuración para este canal?")) return;
        
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/poj/${channelId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error("Error eliminando");
            const updated = await res.json();
            setPojList(updated);
        } catch (error) {
            console.error(error);
            alert("Error al eliminar la configuración");
        }
    };

    if (loading) return (
        <div className="p-10 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-10"></div>
            <div className="h-40 bg-white/5 rounded-2xl w-full"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                        <BellRinging size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Ping On Join (PoJ)</h1>
                        <p className="text-slate-400">Notifica silenciosamente a un rol (Ghost Ping) cuando alguien entra</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Volver</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LISTA CONFIGURACIONES */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Configuraciones Activas</h3>
                    {pojList.length === 0 && (
                        <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl text-center text-slate-500 flex flex-col items-center">
                            <BellRinging size={48} className="mb-2 opacity-30" />
                            <p>No hay Pings de Entrada configurados.</p>
                        </div>
                    )}
                    {pojList.map(poj => {
                        const channel = channels.find(c => c.id === poj.channelId);
                        const role = roles.find(r => r.id === poj.roleId);
                        return (
                            <div key={poj.channelId} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-amber-500/30 transition-all">
                                <div>
                                    <div className="font-bold text-white mb-1">
                                        Canal: <span className="text-amber-400">#{channel ? channel.name : poj.channelId}</span>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        Ping a: <span className="text-indigo-300">@{role ? role.name : poj.roleId}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(poj.channelId)}
                                    className="p-2 text-slate-500 hover:text-red-400 bg-black/40 rounded-lg hover:bg-red-500/20 transition-all"
                                >
                                    <Trash size={20} />
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* FORMULARIO */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6 h-fit bg-black/20">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <Plus className="text-amber-400"/> Añadir Configuración
                    </h3>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Canal de Texto</label>
                        <select 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            value={selectedChannel}
                            onChange={e => setSelectedChannel(e.target.value)}
                        >
                            <option value="" disabled>Selecciona el canal destino...</option>
                            {channels.map(c => <option key={c.id} value={c.id}># {c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Rol a Mencionar</label>
                        <select 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}
                        >
                            <option value="" disabled>Selecciona el rol...</option>
                            {roles.map(r => <option key={r.id} value={r.id}>@ {r.name}</option>)}
                        </select>
                    </div>

                    <button 
                        onClick={handleAdd}
                        disabled={saving || !selectedChannel || !selectedRole}
                        className={`w-full bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-xl transition-all flex justify-center items-center gap-2 ${(saving || !selectedChannel || !selectedRole) ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_15px_rgba(251,191,36,0.3)]'}`}
                    >
                        <FloppyDisk size={20} weight={saving ? "duotone" : "bold"} className={saving ? "animate-pulse" : ""} />
                        {saving ? 'Guardando...' : 'Añadir Ping On Join'}
                    </button>
                    
                    {status && (
                        <div className={`mt-4 p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${status.includes('✅') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                            {status}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
