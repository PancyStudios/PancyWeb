"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CurrencyCircleDollar, Terminal, CheckCircle, Package, Trash, Plus, MagnifyingGlass, Users, Bank, Shield, ChartBar, Desktop, Globe, XCircle } from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface GlobalUser {
    _id: string;
    stars_wallet: number;
    stars_bank: number;
}

interface GlobalItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    sell_price: number;
    type: string;
    emoji: string;
    stock: number;
    role_id?: string;
    effect?: string;
    effect_value?: number;
}

interface BotGuild {
    id: string;
    name: string;
    icon: string;
    memberCount: number;
}

interface BlacklistEntry {
    guildId: string;
    guildName: string;
    reason: string;
    addedBy: string;
    addedAt: number;
    active: boolean;
}

export default function DeveloperGlobalEconomyPage() {
    const [users, setUsers] = useState<GlobalUser[]>([]);
    const [items, setItems] = useState<GlobalItem[]>([]);
    const [guilds, setGuilds] = useState<BotGuild[]>([]);
    const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // User editing
    const [editingUser, setEditingUser] = useState<GlobalUser | null>(null);
    const [editWallet, setEditWallet] = useState(0);
    const [editBank, setEditBank] = useState(0);
    
    // New item form
    const [showNewItemForm, setShowNewItemForm] = useState(false);
    const [newItem, setNewItem] = useState({ 
        id: '',
        name: '', 
        description: '', 
        price: 0, 
        sell_price: 0,
        emoji: '📦',
        type: 'item',
        stock: -1,
        role_id: '',
        effect: 'NONE',
        effect_value: 0
    });
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    
    // UI states
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'items' | 'guilds' | 'blacklist'>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    
    // Pagination and search
    const [guildSearch, setGuildSearch] = useState('');
    const [guildPage, setGuildPage] = useState(1);
    const GUILDS_PER_PAGE = 30;

    const [userSearch, setUserSearch] = useState('');
    const [userPage, setUserPage] = useState(1);
    const USERS_PER_PAGE = 20;
    
    // Blacklist Form
    const [newBlacklist, setNewBlacklist] = useState({ guildId: '', reason: '' });

    useEffect(() => {
        const fetchDevData = async () => {
            try {
                const [userRes, devUsersRes, devItemsRes, guildsRes, blacklistRes] = await Promise.all([
                    fetch(`${API_BASE}/api/users`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/dev/economy/users`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/dev/economy/items`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/dev/guilds`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/dev/blacklist`, { credentials: 'include' })
                ]);
                if (userRes.ok) setUserData(await userRes.json());
                if (devUsersRes.ok) setUsers(await devUsersRes.json());
                if (devItemsRes.ok) setItems(await devItemsRes.json());
                if (guildsRes.ok) setGuilds(await guildsRes.json());
                if (blacklistRes.ok) setBlacklist(await blacklistRes.json());
            } catch (err) {
                console.error("Error loading dev data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDevData();
    }, []);

    const handleSaveUser = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/dev/economy/users/${editingUser._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ wallet: editWallet, bank: editBank })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(users.map(u => u._id === editingUser._id ? updatedUser.user : u));
                setEditingUser(null);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
        setSaving(false);
    };

    const handleAddBlacklist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBlacklist.guildId) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/dev/guilds/${newBlacklist.guildId}/blacklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason: newBlacklist.reason, guildName: 'Desconocido' })
            });
            if (res.ok) {
                const data = await res.json();
                setBlacklist([data.entry, ...blacklist.filter(b => b.guildId !== newBlacklist.guildId)]);
                setNewBlacklist({ guildId: '', reason: '' });
            }
        } catch (err) {
            console.error("Error adding to blacklist:", err);
        }
        setSaving(false);
    };

    const handleRemoveBlacklist = async (guildId: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/dev/guilds/${guildId}/blacklist`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setBlacklist(blacklist.filter(b => b.guildId !== guildId));
            }
        } catch (err) {
            console.error("Error removing from blacklist:", err);
        }
    };

    const stats = useMemo(() => {
        return {
            totalStars: users.reduce((acc, u) => acc + (u.stars_wallet || 0) + (u.stars_bank || 0), 0),
            totalUsers: users.length,
            totalItems: items.length,
            totalGuilds: guilds.length,
            totalMembers: guilds.reduce((acc, g) => acc + (g.memberCount || 0), 0)
        };
    }, [users, items, guilds]);

    const filteredGuilds = useMemo(() => {
        if (!guildSearch) return guilds;
        return guilds.filter(g => g.name.toLowerCase().includes(guildSearch.toLowerCase()) || g.id.includes(guildSearch));
    }, [guilds, guildSearch]);

    const paginatedGuilds = useMemo(() => {
        const start = (guildPage - 1) * GUILDS_PER_PAGE;
        return filteredGuilds.slice(start, start + GUILDS_PER_PAGE);
    }, [filteredGuilds, guildPage]);
    const totalGuildPages = Math.ceil(filteredGuilds.length / GUILDS_PER_PAGE);

    const filteredUsers = useMemo(() => {
        if (!userSearch) return users;
        return users.filter(u => u._id.includes(userSearch));
    }, [users, userSearch]);

    const paginatedUsers = useMemo(() => {
        const start = (userPage - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(start, start + USERS_PER_PAGE);
    }, [filteredUsers, userPage]);
    const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isEdit = editingItemId !== null;
            const url = isEdit ? `${API_BASE}/api/dev/economy/items/${editingItemId}` : `${API_BASE}/api/dev/economy/items`;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newItem)
            });
            if (res.ok) {
                const savedItem = await res.json();
                if (isEdit) {
                    setItems(items.map(i => i._id === editingItemId ? savedItem : i));
                } else {
                    setItems([...items, savedItem]);
                }
                setNewItem({ id: '', name: '', description: '', price: 0, sell_price: 0, emoji: '📦', type: 'item', stock: -1, role_id: '', effect: 'NONE', effect_value: 0 });
                setShowNewItemForm(false);
                setEditingItemId(null);
            }
        } catch (error) {
            console.error("Error saving global item:", error);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/dev/economy/items/${itemId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setItems(items.filter(i => i._id !== itemId));
            }
        } catch (error) {
            console.error("Error deleting global item:", error);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#0a0a15]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-purple-400 font-mono animate-pulse">Cargando panel de developer...</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen font-sans overflow-hidden relative bg-[#080611]">
            {/* Fondo dev */}
            <div className="fixed inset-0 z-[-1] overflow-hidden">
                <div className="absolute inset-0 stars-bg opacity-30" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-fuchsia-900/15 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                bg-[#0e0a1f]/90 backdrop-blur-xl border-r border-purple-500/10
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-20 flex items-center px-6 border-b border-purple-500/10 gap-3">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 bg-purple-500 rounded-full blur opacity-60" />
                        <img src="/logo.png" alt="PancyBot" className="relative w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    <div>
                        <span className="font-black text-white text-lg tracking-wide">PancyBot</span>
                        <div className="text-[9px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 tracking-widest uppercase">
                            Dev Panel
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
                    <div className="px-3 text-[10px] font-black text-fuchsia-600 uppercase tracking-widest mb-2 mt-2">Métricas</div>
                    <button
                        onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-bold ${
                            activeTab === 'overview'
                                ? 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/10'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        <ChartBar size={16} /> Resumen General
                    </button>

                    <div className="px-3 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 mt-6">Administración Global</div>
                    <button
                        onClick={() => { setActiveTab('guilds'); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-bold ${
                            activeTab === 'guilds'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        <Desktop size={16} /> Servidores (Guilds)
                    </button>
                    <button
                        onClick={() => { setActiveTab('blacklist'); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-bold ${
                            activeTab === 'blacklist'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-lg shadow-blue-500/10'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        <Shield size={16} /> Blacklist Global
                    </button>

                    <div className="px-3 text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 mt-6">Economía Global</div>
                    <button
                        onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-bold ${
                            activeTab === 'users'
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20 shadow-lg shadow-purple-500/10'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        <Users size={16} /> Usuarios
                    </button>
                    <button
                        onClick={() => { setActiveTab('items'); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-bold ${
                            activeTab === 'items'
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20 shadow-lg shadow-purple-500/10'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        <Package size={16} /> Objetos de Tienda
                    </button>
                </nav>

                <div className="p-4 border-t border-purple-500/10 bg-black/20">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors w-full px-4 py-3 rounded-lg hover:bg-white/5">
                        <ArrowLeft size={18} /> Volver al Dashboard
                    </Link>
                </div>
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
                <header className="h-20 flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30 bg-[#080611]/80 backdrop-blur-xl border-b border-purple-500/10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Terminal size={24} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                            <span className="text-purple-400 font-bold">Dev Panel</span>
                            <span>/</span>
                            <span className="text-fuchsia-400 font-bold">Economía Global</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                            <Terminal size={14} className="text-purple-400" />
                            <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 tracking-widest uppercase">
                                DEV MODE
                            </span>
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-purple-500/20 h-8">
                            <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-purple-500 to-fuchsia-600 overflow-hidden shadow-lg shadow-purple-500/30">
                                <img
                                    src={`${API_BASE}/api/users/avatar`}
                                    className="w-full h-full rounded-full object-cover bg-black"
                                    alt="Avatar"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="max-w-6xl space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                    <ChartBar size={28} className="text-fuchsia-400" /> Resumen Global
                                </h2>
                                <p className="text-slate-400 mt-1">Visión general del estado actual del bot y la economía intergaláctica.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-[#0e0a1f] border border-purple-500/20 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-purple-400 mb-2">
                                        <CurrencyCircleDollar size={24} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Total Stars</span>
                                    </div>
                                    <div className="text-4xl font-black text-white">{stats.totalStars.toLocaleString()}</div>
                                </div>
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-fuchsia-500/10 to-[#0e0a1f] border border-fuchsia-500/20 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-fuchsia-400 mb-2">
                                        <Users size={24} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Cuentas Eco</span>
                                    </div>
                                    <div className="text-4xl font-black text-white">{stats.totalUsers.toLocaleString()}</div>
                                </div>
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-[#0e0a1f] border border-blue-500/20 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-blue-400 mb-2">
                                        <Desktop size={24} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Servidores</span>
                                    </div>
                                    <div className="text-4xl font-black text-white">{stats.totalGuilds.toLocaleString()}</div>
                                </div>
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-[#0e0a1f] border border-emerald-500/20 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-emerald-400 mb-2">
                                        <Globe size={24} />
                                        <span className="font-bold text-sm uppercase tracking-wider">Miembros</span>
                                    </div>
                                    <div className="text-4xl font-black text-white">{stats.totalMembers.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: GUILDS */}
                    {activeTab === 'guilds' && (
                        <div className="max-w-6xl space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <Desktop size={22} className="text-blue-400" /> Servidores del Bot
                                    </h2>
                                    <p className="text-slate-400 text-sm">Lista de todos los servidores donde se encuentra el bot. Haz clic para administrar.</p>
                                </div>
                                <div className="relative">
                                    <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por ID o Nombre..." 
                                        value={guildSearch}
                                        onChange={(e) => { setGuildSearch(e.target.value); setGuildPage(1); }}
                                        className="pl-10 pr-4 py-2 bg-[#0e0a1f] border border-blue-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400 w-full md:w-64"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedGuilds.length === 0 ? (
                                    <div className="col-span-full p-8 text-center text-slate-500 border border-white/5 rounded-3xl">No hay servidores que coincidan con la búsqueda.</div>
                                ) : (
                                    paginatedGuilds.map(guild => (
                                        <Link href={`/dashboard/developer/${guild.id}`} key={guild.id} className="p-4 rounded-2xl bg-[#0e0a1f]/60 border border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-black shrink-0 border border-blue-500/20 group-hover:border-blue-400">
                                                {guild.icon ? (
                                                    <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} className="w-full h-full object-cover" alt="Icon" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white font-bold bg-blue-900">{guild.name.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-white text-sm truncate">{guild.name}</h4>
                                                <div className="text-xs text-slate-400 font-mono mt-0.5">{guild.id}</div>
                                                <div className="text-xs text-blue-400 mt-1 font-bold flex items-center gap-1"><Users size={12}/> {guild.memberCount} miembros</div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {totalGuildPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <button onClick={() => setGuildPage(p => Math.max(1, p - 1))} disabled={guildPage === 1} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <ArrowLeft size={16} />
                                    </button>
                                    <span className="text-sm text-slate-400 font-mono">
                                        Página {guildPage} de {totalGuildPages}
                                    </span>
                                    <button onClick={() => setGuildPage(p => Math.min(totalGuildPages, p + 1))} disabled={guildPage === totalGuildPages} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <ArrowLeft size={16} className="rotate-180" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: BLACKLIST */}
                    {activeTab === 'blacklist' && (
                        <div className="max-w-5xl space-y-8">
                            <div>
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    <Shield size={22} className="text-red-400" /> Blacklist Global
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Servidores que tienen prohibido el uso del bot.</p>
                            </div>

                            <form onSubmit={handleAddBlacklist} className="p-6 bg-red-900/10 border border-red-500/20 rounded-3xl space-y-4">
                                <h3 className="text-lg font-bold text-white">Añadir Servidor a Blacklist</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 font-bold uppercase">ID del Servidor</label>
                                        <input required type="text" className="w-full bg-[#080611] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 mt-1"
                                            value={newBlacklist.guildId} onChange={e => setNewBlacklist({...newBlacklist, guildId: e.target.value})} placeholder="Ej. 123456789012345678" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 font-bold uppercase">Razón (Opcional)</label>
                                        <input type="text" className="w-full bg-[#080611] border border-red-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 mt-1"
                                            value={newBlacklist.reason} onChange={e => setNewBlacklist({...newBlacklist, reason: e.target.value})} placeholder="Razón del bloqueo" />
                                    </div>
                                </div>
                                <button type="submit" disabled={saving} className="px-6 py-3 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-xl font-bold transition-colors flex items-center gap-2">
                                    <Shield size={18} weight="bold" /> Bloquear Servidor
                                </button>
                            </form>

                            <div className="space-y-3">
                                {blacklist.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 border border-white/5 rounded-3xl">No hay servidores en la blacklist.</div>
                                ) : (
                                    blacklist.map(entry => (
                                        <div key={entry.guildId} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0e0a1f]/60 border border-red-500/20">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-white">{entry.guildName || 'Desconocido'}</h4>
                                                    <span className="text-xs font-mono text-slate-400 bg-black/30 px-2 py-0.5 rounded-lg border border-white/10">{entry.guildId}</span>
                                                </div>
                                                <p className="text-sm text-red-400 mt-1">Razón: <span className="text-slate-300">{entry.reason}</span></p>
                                                <div className="text-xs text-slate-500 mt-2">
                                                    Añadido el {new Date(entry.addedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveBlacklist(entry.guildId)} className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shrink-0">
                                                <XCircle size={16} /> Quitar de Blacklist
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: USERS */}
                    {activeTab === 'users' && (
                        <div className="max-w-5xl space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <Users size={22} className="text-purple-400" /> Usuarios de Economía Global
                                    </h2>
                                    <p className="text-slate-400 text-sm">Gestiona los fondos (Stars) de los usuarios a nivel global.</p>
                                </div>
                                <div className="relative">
                                    <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por ID..." 
                                        value={userSearch}
                                        onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                                        className="pl-10 pr-4 py-2 bg-[#0e0a1f] border border-purple-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-purple-400 w-full md:w-64"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {paginatedUsers.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 border border-white/5 rounded-3xl">No se encontraron usuarios.</div>
                                ) : (
                                    paginatedUsers.map(user => (
                                        <div key={user._id} className="flex items-center justify-between p-4 rounded-2xl bg-[#0e0a1f]/60 border border-purple-500/10 hover:border-purple-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                                <Users size={20} weight="fill" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white font-mono text-sm">{user._id}</div>
                                                <div className="flex items-center gap-3 mt-1 text-xs">
                                                    <span className="flex items-center gap-1 text-yellow-400"><CurrencyCircleDollar size={14}/> Billetera: {user.stars_wallet || 0}</span>
                                                    <span className="flex items-center gap-1 text-blue-400"><Bank size={14}/> Banco: {user.stars_bank || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setEditingUser(user);
                                                setEditWallet(user.stars_wallet || 0);
                                                setEditBank(user.stars_bank || 0);
                                            }} 
                                            className="px-3 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Editar Fondos
                                        </button>
                                    </div>
                                    ))
                                )}
                            </div>

                            {totalUserPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <ArrowLeft size={16} />
                                    </button>
                                    <span className="text-sm text-slate-400 font-mono">
                                        Página {userPage} de {totalUserPages}
                                    </span>
                                    <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <ArrowLeft size={16} className="rotate-180" />
                                    </button>
                                </div>
                            )}

                            {/* Editar Fondos Modal */}
                            {editingUser && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
                                    <div className="relative z-10 w-full max-w-sm bg-[#100d1f] border border-purple-500/20 rounded-3xl p-6 shadow-2xl shadow-purple-500/20">
                                        <h3 className="text-lg font-black text-white mb-4">Editar Fondos (Stars)</h3>
                                        <p className="text-xs text-slate-400 mb-4 font-mono">ID: {editingUser._id}</p>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-300">Billetera (Wallet)</label>
                                                <input type="number" className="w-full bg-[#080611] border border-purple-500/20 rounded-xl px-4 py-2 mt-1 text-white focus:outline-none focus:border-purple-400"
                                                    value={editWallet} onChange={e => setEditWallet(parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-300">Banco (Bank)</label>
                                                <input type="number" className="w-full bg-[#080611] border border-purple-500/20 rounded-xl px-4 py-2 mt-1 text-white focus:outline-none focus:border-purple-400"
                                                    value={editBank} onChange={e => setEditBank(parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <button onClick={() => setEditingUser(null)} className="flex-1 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white">Cancelar</button>
                                                <button onClick={handleSaveUser} disabled={saving} className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors">Guardar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: ITEMS */}
                    {activeTab === 'items' && (
                        <div className="max-w-5xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <Package size={22} className="text-fuchsia-400" /> Objetos Globales
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">Crea y administra objetos de la tienda intergaláctica.</p>
                                </div>
                                <button onClick={() => {
                                    setEditingItemId(null);
                                    setNewItem({ id: '', name: '', description: '', price: 0, sell_price: 0, emoji: '📦', type: 'item', stock: -1, role_id: '', effect: 'NONE', effect_value: 0 });
                                    setShowNewItemForm(!showNewItemForm);
                                }} className="px-4 py-2 bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                                    <Plus size={16} weight="bold" /> Nuevo Objeto
                                </button>
                            </div>

                            {showNewItemForm && (
                                <form onSubmit={handleCreateItem} className="p-6 bg-[#0e0a1f]/60 border border-fuchsia-500/20 rounded-3xl space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-2">{editingItemId ? 'Editar Objeto Global' : 'Crear Objeto Global'}</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">ID Personalizado (Opcional)</label>
                                            <input type="text" disabled={editingItemId !== null} className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1 disabled:opacity-50"
                                                value={newItem.id} onChange={e => setNewItem({...newItem, id: e.target.value})} placeholder="Ej. mid-espada" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Nombre</label>
                                            <input required type="text" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Descripción</label>
                                            <input type="text" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Emoji</label>
                                            <input type="text" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.emoji} onChange={e => setNewItem({...newItem, emoji: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Stock (-1 = Ilimitado)</label>
                                            <input required type="number" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Tipo (Legacy)</label>
                                            <select className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                                                <option value="item">Objeto Normal</option>
                                                <option value="role">Rol</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Precio (Stars)</label>
                                            <input required type="number" min="0" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.price} onChange={e => setNewItem({...newItem, price: parseInt(e.target.value) || 0})} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Precio de Venta</label>
                                            <input type="number" min="0" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.sell_price} onChange={e => setNewItem({...newItem, sell_price: parseInt(e.target.value) || 0})} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Efecto Especial</label>
                                            <select className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.effect} onChange={e => setNewItem({...newItem, effect: e.target.value})}>
                                                <option value="NONE">Ninguno</option>
                                                <option value="EXPAND_BANK">Expandir Banco</option>
                                                <option value="GIVE_ROLE">Otorgar Rol</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Valor del Efecto / ID del Rol</label>
                                            {newItem.effect === 'GIVE_ROLE' ? (
                                                <input type="text" placeholder="ID del Rol" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                    value={newItem.role_id} onChange={e => setNewItem({...newItem, role_id: e.target.value})} />
                                            ) : (
                                                <input type="number" placeholder="Ej. 1000" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                    value={newItem.effect_value} onChange={e => setNewItem({...newItem, effect_value: parseInt(e.target.value) || 0})} />
                                            )}
                                        </div>
                                        <div className="flex items-end mt-2 md:mt-0 col-span-1">
                                            <button type="submit" className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-fuchsia-500/20">
                                                {editingItemId ? 'Guardar Cambios' : 'Añadir Objeto'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.length === 0 ? (
                                    <div className="col-span-full p-8 text-center text-slate-500 border border-white/5 rounded-3xl">No hay objetos globales.</div>
                                ) : (
                                    items.map(item => (
                                        <div key={item._id} className="relative p-5 rounded-3xl bg-[#0e0a1f]/60 border border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                                                    {item.emoji}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => {
                                                        setEditingItemId(item._id);
                                                        setNewItem({
                                                            id: item._id,
                                                            name: item.name,
                                                            description: item.description,
                                                            price: item.price,
                                                            sell_price: item.sell_price,
                                                            emoji: item.emoji,
                                                            type: item.type,
                                                            stock: item.stock,
                                                            role_id: item.role_id || '',
                                                            effect: item.effect || 'NONE',
                                                            effect_value: item.effect_value || 0
                                                        });
                                                        setShowNewItemForm(true);
                                                    }} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">
                                                        <span className="text-xs font-bold">Editar</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteItem(item._id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                                        <Trash size={18} weight="bold" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                                {item.type === 'role' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">ROL</span>}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-sm font-bold rounded-lg border border-yellow-500/20">
                                                    <CurrencyCircleDollar size={16} /> {item.price} Stars
                                                </div>
                                                {item.stock !== -1 && (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 text-sm font-bold rounded-lg border border-fuchsia-500/20">
                                                        Stock: {item.stock}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
