"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CurrencyCircleDollar, Terminal, CheckCircle, Package, Trash, Plus, MagnifyingGlass, Users, Bank } from 'phosphor-react';

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
}

export default function DeveloperGlobalEconomyPage() {
    const [users, setUsers] = useState<GlobalUser[]>([]);
    const [items, setItems] = useState<GlobalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // User editing
    const [editingUser, setEditingUser] = useState<GlobalUser | null>(null);
    const [editWallet, setEditWallet] = useState(0);
    const [editBank, setEditBank] = useState(0);
    
    // New item form
    const [showNewItemForm, setShowNewItemForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: 0, emoji: '📦' });
    
    // UI states
    const [activeTab, setActiveTab] = useState<'users' | 'items'>('users');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const fetchDevData = async () => {
            try {
                const [userRes, devUsersRes, devItemsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/users`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/dev/economy/users`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/dev/economy/items`, { credentials: 'include' })
                ]);
                if (userRes.ok) setUserData(await userRes.json());
                if (devUsersRes.ok) setUsers(await devUsersRes.json());
                if (devItemsRes.ok) setItems(await devItemsRes.json());
            } catch (err) {
                console.error("Error loading dev economy:", err);
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

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/api/dev/economy/items`, {
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
            console.error("Error creating global item:", error);
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
                    <div className="px-3 text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 mt-2">Economía Global</div>
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
                    {/* TAB: USERS */}
                    {activeTab === 'users' && (
                        <div className="max-w-5xl space-y-6">
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <Users size={22} className="text-purple-400" /> Usuarios de Economía Global
                            </h2>
                            <p className="text-slate-400 text-sm">Gestiona los fondos (Stars) de los usuarios a nivel global.</p>
                            
                            <div className="space-y-2">
                                {users.map(user => (
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
                                ))}
                            </div>

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
                                <button onClick={() => setShowNewItemForm(!showNewItemForm)} className="px-4 py-2 bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                                    <Plus size={16} weight="bold" /> Nuevo Objeto
                                </button>
                            </div>

                            {showNewItemForm && (
                                <form onSubmit={handleCreateItem} className="p-6 bg-[#0e0a1f]/60 border border-fuchsia-500/20 rounded-3xl space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-2">Crear Objeto Global</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-xs text-slate-400 font-bold uppercase">Nombre</label>
                                            <input required type="text" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Emoji</label>
                                            <input type="text" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.emoji} onChange={e => setNewItem({...newItem, emoji: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 font-bold uppercase">Precio (Stars)</label>
                                            <input required type="number" min="0" className="w-full bg-[#080611] border border-fuchsia-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-400 mt-1"
                                                value={newItem.price} onChange={e => setNewItem({...newItem, price: parseInt(e.target.value) || 0})} />
                                        </div>
                                        <div className="flex items-end">
                                            <button type="submit" className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-fuchsia-500/20">
                                                Añadir Objeto
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
                                                <button onClick={() => handleDeleteItem(item._id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash size={18} weight="bold" />
                                                </button>
                                            </div>
                                            <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-sm font-bold rounded-lg border border-yellow-500/20">
                                                <CurrencyCircleDollar size={16} /> {item.price} Stars
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
