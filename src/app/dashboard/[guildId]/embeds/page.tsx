"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Cards, FloppyDisk, CheckCircle, Trash, Plus, PaintBucket, TextAa, Image as ImageIcon, PaperPlaneRight } from 'phosphor-react';
import { v4 as uuidv4 } from 'uuid'; // Next.js should resolve this, or we can use crypto.randomUUID()

const API_BASE = "https://api.pancy.miau.media";

interface CustomEmbed {
    id: string;
    name: string;
    title: string;
    description: string;
    color: number;
    thumbnail: string;
    image: string;
    footerText: string;
    footerIcon: string;
    authorName: string;
    authorIcon: string;
}

export default function EmbedsSettingsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [embeds, setEmbeds] = useState<CustomEmbed[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Editor State
    const [activeEmbed, setActiveEmbed] = useState<CustomEmbed | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Channels for sending
    const [channels, setChannels] = useState<{id: string, name: string}[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!guildId) return;

        fetch(`${API_BASE}/api/guilds/${guildId}/embeds`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setEmbeds(data);
                if (data.length > 0) setActiveEmbed(data[0]);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading embeds:", err);
                setLoading(false);
            });

        // Load channels for the selector
        fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : { channels: [] })
            .then((data: any) => {
                if (data.channels) {
                    setChannels(data.channels);
                    if (data.channels.length > 0) setSelectedChannel(data.channels[0].id);
                }
            })
            .catch(console.error);
    }, [guildId]);

    const handleCreateNew = () => {
        const newEmbed: CustomEmbed = {
            id: crypto.randomUUID(),
            name: "Nuevo Embed",
            title: "Título de Ejemplo",
            description: "Esta es la descripción de tu nuevo embed. Puedes usar **negritas** y saltos de línea.",
            color: 3447003, // Default Discord Blue
            thumbnail: "",
            image: "",
            footerText: "",
            footerIcon: "",
            authorName: "",
            authorIcon: ""
        };
        setActiveEmbed(newEmbed);
    };

    const handleSaveConfig = async () => {
        if (!activeEmbed) return;
        setSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/embeds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(activeEmbed)
            });
            if (!res.ok) throw new Error("Error guardando");
            const updated = await res.json();
            setEmbeds(updated);
            
            setSaveStatus("✅ ¡Embed guardado!");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setSaveStatus("❌ Error al guardar");
        }
        setSaving(false);
    };

    const handleSend = async () => {
        if (!activeEmbed || !activeEmbed.id) return alert("Por favor guarda el embed primero antes de enviarlo.");
        if (!selectedChannel) return alert("Selecciona un canal válido.");
        
        setSending(true);
        setSaveStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/embeds/${activeEmbed.id}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ channelId: selectedChannel })
            });
            const data = await res.json();
            if (res.ok) {
                setSaveStatus("✅ ¡Enviado al canal!");
            } else {
                setSaveStatus("❌ Error: " + data.message);
            }
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            setSaveStatus("❌ Error de red");
        }
        setSending(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que quieres borrar este embed? Las Bienvenidas que lo usen dejarán de funcionar.")) return;
        
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/embeds/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error("Error eliminando");
            const updated = await res.json();
            setEmbeds(updated);
            if (activeEmbed?.id === id) {
                setActiveEmbed(updated.length > 0 ? updated[0] : null);
            }
        } catch (error) {
            console.error(error);
            alert("Error al eliminar el embed");
        }
    };

    const updateField = (field: keyof CustomEmbed, value: string | number) => {
        if (!activeEmbed) return;
        setActiveEmbed({ ...activeEmbed, [field]: value });
    };

    if (loading) return (
        <div className="p-10 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-10"></div>
            <div className="h-96 bg-white/5 rounded-2xl w-full"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <Cards size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Creador de Embeds</h1>
                        <p className="text-slate-400">Diseña mensajes ricos visualmente para tu servidor</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCreateNew} className="flex items-center gap-2 text-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20 px-5 py-2.5 rounded-xl transition-all font-bold">
                        <Plus size={18} weight="bold" />
                        <span>Crear Nuevo Embed</span>
                    </button>
                    <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Volver</span>
                    </Link>
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                
                {/* LISTA DE EMBEDS (Col-3) */}
                <div className="lg:col-span-3 space-y-3">
                    <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4">Tus Embeds Guardados</h3>
                    {embeds.length === 0 && (
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center text-slate-500 text-sm">
                            Aún no has creado ningún embed.
                        </div>
                    )}
                    {embeds.map(e => (
                        <div 
                            key={e.id} 
                            onClick={() => setActiveEmbed(e)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${activeEmbed?.id === e.id ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10'}`}
                        >
                            <span className="font-medium truncate pr-2">{e.name}</span>
                            <button 
                                onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }}
                                className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* EDITOR Y PREVIEW (Col-9) */}
                {activeEmbed ? (
                    <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-8">
                        
                        {/* EDITOR FORM */}
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6 bg-black/20">
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Nombre Interno (No visible en Discord)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={activeEmbed.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><PaintBucket /> Color (HEX)</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            className="h-10 w-10 rounded cursor-pointer bg-transparent border-0"
                                            value={`#${activeEmbed.color.toString(16).padStart(6, '0')}`}
                                            onChange={(e) => updateField('color', parseInt(e.target.value.replace('#', ''), 16))}
                                        />
                                        <input 
                                            type="text"
                                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono text-sm"
                                            value={`#${activeEmbed.color.toString(16).padStart(6, '0')}`}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value.replace('#', ''), 16);
                                                if (!isNaN(val)) updateField('color', val);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <h4 className="font-bold text-indigo-400 flex items-center gap-2"><TextAa/> Contenido Principal</h4>
                                
                                <input 
                                    type="text" 
                                    placeholder="Título del Embed"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={activeEmbed.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                />
                                
                                <textarea 
                                    placeholder="Descripción principal del mensaje..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-y"
                                    value={activeEmbed.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t border-white/10 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20">
                                <h4 className="font-bold text-indigo-300 text-sm">Variables Mágicas 🪄</h4>
                                <p className="text-xs text-slate-400 mb-2">Puedes usar estos textos en el Título o Descripción. El bot los reemplazará automáticamente cuando envíe el mensaje.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 text-xs text-slate-300 gap-y-2 gap-x-4">
                                    <p><code className="text-indigo-400 font-bold bg-indigo-400/10 px-1 rounded">{'{user}'}</code> Mención (@usuario)</p>
                                    <p><code className="text-indigo-400 font-bold bg-indigo-400/10 px-1 rounded">{'{user.name}'}</code> Nombre (Juan)</p>
                                    <p><code className="text-indigo-400 font-bold bg-indigo-400/10 px-1 rounded">{'{user.id}'}</code> ID (123456...)</p>
                                    <p><code className="text-indigo-400 font-bold bg-indigo-400/10 px-1 rounded">{'{user.avatar}'}</code> Link a la foto</p>
                                    <p><code className="text-indigo-400 font-bold bg-indigo-400/10 px-1 rounded">{'{server}'}</code> Nombre del server</p>
                                    <p><code className="text-indigo-400 font-bold bg-indigo-400/10 px-1 rounded">{'{server.members}'}</code> Cantidad de miembros</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <h4 className="font-bold text-indigo-400 flex items-center gap-2"><ImageIcon /> Imágenes</h4>
                                
                                <input 
                                    type="url" 
                                    placeholder="URL del Thumbnail (Ícono pequeño a la derecha)"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={activeEmbed.thumbnail}
                                    onChange={(e) => updateField('thumbnail', e.target.value)}
                                />
                                
                                <input 
                                    type="url" 
                                    placeholder="URL de la Imagen Principal (Grande al fondo)"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={activeEmbed.image}
                                    onChange={(e) => updateField('image', e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <h4 className="font-bold text-indigo-400">Autor y Footer</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" placeholder="Nombre Autor" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={activeEmbed.authorName} onChange={(e) => updateField('authorName', e.target.value)}
                                    />
                                    <input 
                                        type="url" placeholder="URL Ícono Autor" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={activeEmbed.authorIcon} onChange={(e) => updateField('authorIcon', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        type="text" placeholder="Texto Pie de Página" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={activeEmbed.footerText} onChange={(e) => updateField('footerText', e.target.value)}
                                    />
                                    <input 
                                        type="url" placeholder="URL Ícono Pie de Página" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={activeEmbed.footerIcon} onChange={(e) => updateField('footerIcon', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* DISCORD PREVIEW */}
                        <div className="sticky top-28">
                            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4 flex justify-between">
                                <span>Vista Previa en Vivo</span>
                                <span className="text-indigo-400">Discord Oscuro</span>
                            </h3>
                            
                            <div className="bg-[#313338] rounded-xl p-4 font-sans text-[#dbdee1] flex shadow-2xl">
                                {/* Simular Avatar Bot */}
                                <div className="w-10 h-10 rounded-full bg-indigo-500 shrink-0 mr-4 mt-1 flex items-center justify-center text-white font-bold text-xl">
                                    P
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-end gap-2 mb-1">
                                        <span className="font-medium text-[#f2f3f5] text-base leading-none">PancyBot</span>
                                        <span className="bg-[#5865F2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none flex items-center gap-1"><CheckCircle size={10} weight="fill"/> BOT</span>
                                        <span className="text-[#949ba4] text-xs leading-none">Hoy a las 12:00</span>
                                    </div>
                                    
                                    {/* El Embed Mismo */}
                                    <div className="mt-2 rounded bg-[#2b2d31] border-l-4 p-4 max-w-[520px]" style={{ borderColor: `#${activeEmbed.color.toString(16).padStart(6, '0')}` }}>
                                        
                                        {/* Author */}
                                        {(activeEmbed.authorName || activeEmbed.authorIcon) && (
                                            <div className="flex items-center gap-2 mb-2">
                                                {activeEmbed.authorIcon && <img src={activeEmbed.authorIcon} alt="author" className="w-6 h-6 rounded-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />}
                                                {activeEmbed.authorName && <span className="font-bold text-sm text-white">{activeEmbed.authorName}</span>}
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            <div className="flex-1 min-w-0 space-y-2">
                                                {/* Title */}
                                                {activeEmbed.title && (
                                                    <div className="font-bold text-[#00a8fc] hover:underline cursor-pointer">{activeEmbed.title}</div>
                                                )}
                                                
                                                {/* Description */}
                                                {activeEmbed.description && (
                                                    <div className="text-sm text-[#dbdee1] whitespace-pre-wrap leading-relaxed">
                                                        {activeEmbed.description}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Thumbnail */}
                                            {activeEmbed.thumbnail && (
                                                <div className="shrink-0">
                                                    <img src={activeEmbed.thumbnail} alt="thumbnail" className="w-20 h-20 object-cover rounded-lg" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Main Image */}
                                        {activeEmbed.image && (
                                            <div className="mt-4 rounded-lg overflow-hidden max-w-[400px]">
                                                <img src={activeEmbed.image} alt="main" className="w-full object-contain" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />
                                            </div>
                                        )}

                                        {/* Footer */}
                                        {(activeEmbed.footerText || activeEmbed.footerIcon) && (
                                            <div className="flex items-center gap-2 mt-4 text-[#949ba4] text-xs">
                                                {activeEmbed.footerIcon && <img src={activeEmbed.footerIcon} alt="footer" className="w-5 h-5 rounded-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />}
                                                <span>{activeEmbed.footerText}</span>
                                            </div>
                                        )}
                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="lg:col-span-9 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/10 rounded-3xl bg-black/20 text-slate-400">
                        <Cards size={64} className="mb-4 opacity-50" />
                        <h2 className="text-xl font-bold text-white mb-2">Ningún Embed Seleccionado</h2>
                        <p className="mb-6">Crea un nuevo embed o selecciona uno de la lista para editarlo.</p>
                        <button onClick={handleCreateNew} className="bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl">Crear Nuevo</button>
                    </div>
                )}
            </div>

            {/* SAVE BUTTON BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-black/60 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-center pointer-events-none">
                <div className="max-w-7xl w-full flex items-center justify-between pointer-events-auto gap-4">
                    <div className="text-sm font-medium flex-1">
                        {saveStatus && (
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 ${saveStatus.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                                {saveStatus.includes('✅') && <CheckCircle size={18} weight="fill" />}
                                {saveStatus}
                            </span>
                        )}
                    </div>
                    
                    {/* SEND TO CHANNEL */}
                    {activeEmbed && (
                        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
                            <select 
                                className="bg-transparent text-white text-sm focus:outline-none px-2 py-1 max-w-[150px] md:max-w-[200px]"
                                value={selectedChannel}
                                onChange={(e) => setSelectedChannel(e.target.value)}
                            >
                                <option value="" disabled className="text-black">Selecciona un canal</option>
                                {channels.map(c => (
                                    <option key={c.id} value={c.id} className="text-black"># {c.name}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleSend}
                                disabled={sending || saving || !activeEmbed.id}
                                className={`bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${(sending || saving || !activeEmbed.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Enviar mensaje ahora mismo al servidor"
                            >
                                <PaperPlaneRight size={18} weight={sending ? "duotone" : "bold"} className={sending ? "animate-pulse" : ""} />
                                <span className="hidden sm:inline">{sending ? 'Enviando...' : 'Enviar'}</span>
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={handleSaveConfig}
                        disabled={saving || !activeEmbed}
                        className={`bg-indigo-500 hover:bg-indigo-400 text-white font-black px-6 sm:px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] ${(saving || !activeEmbed) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        <FloppyDisk size={20} weight={saving ? "duotone" : "bold"} className={saving ? "animate-pulse" : ""} />
                        <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
