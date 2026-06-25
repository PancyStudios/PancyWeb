'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft, Terminal, ShieldWarning, SignOut, Warning,
    PaperPlaneTilt, ListDashes, Gear, Skull, CheckCircle,
    XCircle, ArrowClockwise, Eye, Hash, Users, Crown,
    Star, Rocket, Lock, LockOpen, Prohibit, List, Bell
} from 'phosphor-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Channel {
    id: string;
    name: string;
    type: number;
}

interface GuildInfo {
    id: string;
    name: string;
    icon: string | null;
    ownerId: string;
    memberCount: number;
    description: string | null;
    premiumTier: number;
    channels?: Channel[];
    blacklisted?: {
        active: boolean;
        reason: string;
        addedBy: string;
        addedAt: number;
    } | null;
    protection?: any;
    dbConfig?: any;
}

interface LogEntry {
    _id: string;
    guildId: string;
    action?: string;
    type?: string;
    timestamp?: number;
    content?: string;
}

interface RaidPanic {
    raidmode?: { enable: boolean; timeToDisable?: string; activedDate?: number };
    antiraid?: { enable: boolean; amount?: number };
    antibots?: { enable: boolean };
    antijoins?: { enable: boolean };
}

const API_BASE = "https://api.pancy.miau.media";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const opts: RequestInit = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };

function GuildAvatar({ guild }: { guild: GuildInfo }) {
    if (guild.icon) return (
        <img
            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`}
            alt={guild.name}
            className="w-20 h-20 rounded-3xl object-cover shadow-2xl shadow-purple-500/30 ring-2 ring-purple-500/40"
        />
    );
    return (
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-700 to-fuchsia-900 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-purple-500/30 ring-2 ring-purple-500/40">
            {guild.name.charAt(0)}
        </div>
    );
}

function StatCard({ icon, label, value, color = 'purple' }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) {
    const colors: Record<string, string> = {
        purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
        fuchsia: 'from-fuchsia-500/10 to-fuchsia-500/5 border-fuchsia-500/20 text-fuchsia-400',
        red: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-400',
        green: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400',
        amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
    };
    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4 flex items-center gap-3`}>
            <div className="text-2xl">{icon}</div>
            <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">{label}</p>
                <p className="text-white font-bold text-lg leading-tight">{value}</p>
            </div>
        </div>
    );
}

// ─── Modal Components ────────────────────────────────────────────────────────

function ConfirmModal({
    title, description, confirmLabel, danger = false, onConfirm, onClose, children
}: {
    title: string; description?: string; confirmLabel: string; danger?: boolean;
    onConfirm: () => void; onClose: () => void; children?: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-[#100d1f] border border-purple-500/20 rounded-3xl p-6 shadow-2xl shadow-purple-500/20">
                <h3 className="text-xl font-black text-white mb-2">{title}</h3>
                {description && <p className="text-slate-400 text-sm mb-4">{description}</p>}
                {children}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 ${
                            danger
                                ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-500/30'
                                : 'bg-gradient-to-r from-purple-600 to-fuchsia-700 text-white shadow-lg shadow-purple-500/30'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DevGuildPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    // Data states
    const [guild, setGuild]           = useState<GuildInfo | null>(null);
    const [logs, setLogs]             = useState<LogEntry[]>([]);
    const [logsTotal, setLogsTotal]   = useState(0);
    const [logsPage, setLogsPage]     = useState(1);
    const [raidPanic, setRaidPanic]   = useState<RaidPanic | null>(null);
    const [userData, setUserData]     = useState<any>(null);

    // UI states
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'logs' | 'message' | 'config'>('info');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Action states
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionResult, setActionResult]   = useState<{ ok: boolean; msg: string } | null>(null);

    // Modals
    const [showLeaveModal, setShowLeaveModal]         = useState(false);
    const [showBlacklistModal, setShowBlacklistModal] = useState(false);
    const [showUnblacklistModal, setShowUnblacklistModal] = useState(false);

    // Form states
    const [blacklistReason, setBlacklistReason] = useState('');
    const [msgChannelId, setMsgChannelId]       = useState('');
    const [msgContent, setMsgContent]           = useState('');
    const [configKey, setConfigKey]             = useState('prefix');
    const [configValue, setConfigValue]         = useState('');

    // ── Fetch data ───────────────────────────────────────────────────────────

    const fetchGuild = useCallback(async () => {
        if (!guildId) return;
        try {
            const [guildRes, userRes, raidRes] = await Promise.all([
                fetch(`${API_BASE}/api/dev/guilds/${guildId}/info`, opts),
                fetch(`${API_BASE}/api/users`, opts),
                fetch(`${API_BASE}/api/dev/guilds/${guildId}/raidpanic`, opts),
            ]);
            if (guildRes.ok)  setGuild(await guildRes.json());
            else setError('No se pudo cargar la información del servidor.');
            if (userRes.ok)   setUserData(await userRes.json());
            if (raidRes.ok)   setRaidPanic(await raidRes.json());
        } catch {
            setError('Error de comunicación con el servidor.');
        } finally {
            setLoading(false);
        }
    }, [guildId]);

    const fetchLogs = useCallback(async (page = 1) => {
        if (!guildId) return;
        try {
            const res = await fetch(`${API_BASE}/api/dev/guilds/${guildId}/logs?page=${page}&limit=20`, opts);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs ?? []);
                setLogsTotal(data.total ?? 0);
                setLogsPage(page);
            }
        } catch {}
    }, [guildId]);

    useEffect(() => { fetchGuild(); }, [fetchGuild]);
    useEffect(() => { if (activeTab === 'logs') fetchLogs(1); }, [activeTab, fetchLogs]);

    // ── Action helpers ────────────────────────────────────────────────────────

    const doAction = async (key: string, fn: () => Promise<Response>) => {
        setActionLoading(key);
        setActionResult(null);
        try {
            const res = await fn();
            const data = await res.json();
            setActionResult({ ok: res.ok, msg: data.message ?? (res.ok ? 'Acción completada.' : 'Error desconocido.') });
            if (res.ok) fetchGuild();
        } catch {
            setActionResult({ ok: false, msg: 'Error de red.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeave = () => doAction('leave', () =>
        fetch(`${API_BASE}/api/dev/guilds/${guildId}/leave`, { ...opts, method: 'POST' })
    ).then(() => setShowLeaveModal(false));

    const handleBlacklist = () => doAction('blacklist', () =>
        fetch(`${API_BASE}/api/dev/guilds/${guildId}/blacklist`, {
            ...opts, method: 'POST',
            body: JSON.stringify({ reason: blacklistReason, guildName: guild?.name })
        })
    ).then(() => { setShowBlacklistModal(false); setBlacklistReason(''); });

    const handleUnblacklist = () => doAction('unblacklist', () =>
        fetch(`${API_BASE}/api/dev/guilds/${guildId}/blacklist`, { ...opts, method: 'DELETE' })
    ).then(() => setShowUnblacklistModal(false));

    const handleSendMessage = async () => {
        await doAction('message', () =>
            fetch(`${API_BASE}/api/dev/guilds/${guildId}/message`, {
                ...opts, method: 'POST',
                body: JSON.stringify({ channelId: msgChannelId, content: msgContent })
            })
        );
        setMsgContent('');
    };

    const handleForceConfig = async () => {
        await doAction('config', () =>
            fetch(`${API_BASE}/api/dev/guilds/${guildId}/config`, {
                ...opts, method: 'POST',
                body: JSON.stringify({ [configKey]: configValue })
            })
        );
    };

    const isBlacklisted = guild?.blacklisted?.active;

    // ─── Loading / Error states ───────────────────────────────────────────────

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#0a0a15]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-purple-400 font-mono animate-pulse">Cargando panel de developer...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex h-screen items-center justify-center bg-[#0a0a15] p-8">
            <div className="text-center space-y-4 max-w-md">
                <XCircle size={56} className="text-red-400 mx-auto" />
                <h2 className="text-2xl font-black text-white">{error}</h2>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all">
                    <ArrowLeft size={18} /> Volver al Dashboard
                </Link>
            </div>
        </div>
    );

    // ─── Tabs ─────────────────────────────────────────────────────────────────

    const tabs = [
        { id: 'info',    label: 'Info & Acciones', icon: <Eye size={16} /> },
        { id: 'logs',    label: 'Logs',            icon: <ListDashes size={16} /> },
        { id: 'message', label: 'Enviar Mensaje',  icon: <PaperPlaneTilt size={16} /> },
        { id: 'config',  label: 'Forzar Config',   icon: <Gear size={16} /> },
    ] as const;

    const textChannels = (guild?.channels ?? []).filter(c => c.type === 0);

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen font-sans overflow-hidden relative bg-[#080611]">
            {/* Fondo dev — tonos púrpura/fucsia */}
            <div className="fixed inset-0 z-[-1] overflow-hidden">
                <div className="absolute inset-0 stars-bg opacity-30" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-fuchsia-900/15 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-800/10 rounded-full blur-[80px]" />
            </div>

            {/* ── Sidebar ────────────────────────────────────────────────────── */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                bg-[#0e0a1f]/90 backdrop-blur-xl border-r border-purple-500/10
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
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

                {/* Guild info chip */}
                {guild && (
                    <div className="px-4 pt-4">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                            {guild.icon
                                ? <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`} className="w-9 h-9 rounded-xl object-cover" alt="" />
                                : <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center text-white font-black">{guild.name.charAt(0)}</div>
                            }
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{guild.name}</p>
                                <p className="text-[10px] font-mono text-purple-400">{guildId}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
                    <div className="px-3 text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 mt-2">Dev Tools</div>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm font-bold ${
                                activeTab === tab.id
                                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20 shadow-lg shadow-purple-500/10'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}

                    <div className="px-3 text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2 mt-6">Acciones Rápidas</div>
                    <button
                        onClick={() => setShowLeaveModal(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <SignOut size={16} /> Salir del Servidor
                    </button>
                    {isBlacklisted ? (
                        <button
                            onClick={() => setShowUnblacklistModal(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-green-500/80 hover:text-green-400 hover:bg-green-500/10 transition-all"
                        >
                            <LockOpen size={16} /> Quitar de Blacklist
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowBlacklistModal(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        >
                            <Prohibit size={16} /> Añadir a Blacklist
                        </button>
                    )}
                </nav>

                {/* Back link */}
                <div className="p-4 border-t border-purple-500/10 bg-black/20">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors w-full px-4 py-3 rounded-lg hover:bg-white/5">
                        <ArrowLeft size={18} /> Volver al Dashboard
                    </Link>
                </div>
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Main Content ────────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col relative z-10 overflow-hidden">

                {/* Header */}
                <header className="h-20 flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30 bg-[#080611]/80 backdrop-blur-xl border-b border-purple-500/10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <List size={24} />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                            <span className="text-purple-400 font-bold">Dev Panel</span>
                            <span>/</span>
                            <span className="text-fuchsia-400 font-bold">{guild?.name ?? guildId}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* DEV MODE badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                            <Terminal size={14} className="text-purple-400" />
                            <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 tracking-widest uppercase">
                                DEV MODE
                            </span>
                        </div>

                        {/* Blacklist indicator */}
                        {isBlacklisted && (
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30">
                                <Skull size={14} className="text-red-400" />
                                <span className="text-[11px] font-black text-red-400 tracking-wide uppercase">Blacklisted</span>
                            </div>
                        )}

                        {/* User */}
                        <div className="flex items-center gap-3 pl-4 border-l border-purple-500/20 h-8">
                            <div className="text-right hidden sm:block leading-tight">
                                <div className="text-sm font-bold text-white">{userData?.username}</div>
                                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 font-black tracking-wide">
                                    👨‍💻 DEVELOPER
                                </div>
                            </div>
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

                {/* Action Result Toast */}
                {actionResult && (
                    <div className={`mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold transition-all animate-pulse ${
                        actionResult.ok
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        {actionResult.ok ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        {actionResult.msg}
                        <button onClick={() => setActionResult(null)} className="ml-auto text-slate-500 hover:text-white">✕</button>
                    </div>
                )}

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">

                    {/* ── TAB: INFO ──────────────────────────────────────────── */}
                    {activeTab === 'info' && guild && (
                        <div className="space-y-8 max-w-5xl">

                            {/* Guild header card */}
                            <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-[#0e0a1f] to-fuchsia-900/10 p-6 md:p-8">
                                <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,#7c3aed_0px,#7c3aed_1px,transparent_0px,transparent_50%)] bg-[length:20px_20px]" />
                                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    <GuildAvatar guild={guild} />
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-black text-white">{guild.name}</h1>
                                            {isBlacklisted && (
                                                <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-black uppercase tracking-wide flex items-center gap-1">
                                                    <Skull size={12} /> Blacklisted
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-purple-400/80 font-mono text-sm mb-3">ID: {guild.id}</p>
                                        {guild.description && <p className="text-slate-400 text-sm">{guild.description}</p>}
                                    </div>
                                    <button
                                        onClick={() => { setLoading(true); fetchGuild(); }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all text-sm font-bold"
                                    >
                                        <ArrowClockwise size={16} /> Refrescar
                                    </button>
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard icon={<Users size={24} className="text-purple-400" />} label="Miembros" value={guild.memberCount?.toLocaleString() ?? '—'} color="purple" />
                                <StatCard icon={<Star size={24} className="text-fuchsia-400" />} label="Boost Tier" value={`Tier ${guild.premiumTier ?? 0}`} color="fuchsia" />
                                <StatCard icon={<Hash size={24} className="text-purple-400" />} label="Canales" value={guild.channels?.length ?? '—'} color="purple" />
                                <StatCard icon={<Crown size={24} className="text-amber-400" />} label="Owner ID" value={guild.ownerId ? `...${guild.ownerId.slice(-4)}` : '—'} color="amber" />
                            </div>

                            {/* Raid Panic status */}
                            {raidPanic && (
                                <div className="rounded-3xl border border-purple-500/20 bg-[#0e0a1f]/80 p-6">
                                    <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                                        <ShieldWarning size={22} className="text-purple-400" /> Raid Panic / Protección
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { key: 'raidmode',  label: 'Raid Mode',   enabled: raidPanic?.raidmode?.enable },
                                            { key: 'antiraid',  label: 'Anti-Raid',   enabled: raidPanic?.antiraid?.enable },
                                            { key: 'antibots',  label: 'Anti-Bots',   enabled: raidPanic?.antibots?.enable },
                                            { key: 'antijoins', label: 'Anti-Joins',  enabled: raidPanic?.antijoins?.enable },
                                        ].map(item => (
                                            <div key={item.key} className={`flex items-center gap-3 p-3 rounded-2xl border ${
                                                item.enabled
                                                    ? 'bg-green-500/10 border-green-500/20'
                                                    : 'bg-slate-800/40 border-white/5'
                                            }`}>
                                                {item.enabled
                                                    ? <CheckCircle size={20} className="text-green-400 shrink-0" />
                                                    : <XCircle size={20} className="text-slate-600 shrink-0" />
                                                }
                                                <span className={`text-sm font-bold ${item.enabled ? 'text-green-300' : 'text-slate-600'}`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {raidPanic?.raidmode?.enable && raidPanic.raidmode.activedDate && (
                                        <p className="mt-3 text-xs text-amber-400 font-mono">
                                            ⚡ Raid mode activado el: {new Date(raidPanic.raidmode.activedDate).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Blacklist info */}
                            {isBlacklisted && guild.blacklisted && (
                                <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-6">
                                    <h2 className="text-lg font-black text-red-400 flex items-center gap-2 mb-3">
                                        <Skull size={22} /> En Blacklist
                                    </h2>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-slate-500 font-bold">Razón:</span> <span className="text-white">{guild.blacklisted.reason}</span></p>
                                        <p><span className="text-slate-500 font-bold">Por:</span> <span className="text-white font-mono">{guild.blacklisted.addedBy}</span></p>
                                        <p><span className="text-slate-500 font-bold">Fecha:</span> <span className="text-white">{new Date(guild.blacklisted.addedAt).toLocaleString()}</span></p>
                                    </div>
                                    <button
                                        onClick={() => setShowUnblacklistModal(true)}
                                        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-all text-sm font-bold"
                                    >
                                        <LockOpen size={16} /> Quitar de Blacklist
                                    </button>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setShowLeaveModal(true)}
                                    className="group flex flex-col items-start gap-3 p-5 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all cursor-pointer"
                                >
                                    <SignOut size={28} className="text-red-400 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="font-black text-red-400 text-base">Salir del Servidor</p>
                                        <p className="text-xs text-slate-500 mt-0.5">El bot abandonará este servidor</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => isBlacklisted ? setShowUnblacklistModal(true) : setShowBlacklistModal(true)}
                                    className={`group flex flex-col items-start gap-3 p-5 rounded-2xl border transition-all cursor-pointer ${
                                        isBlacklisted
                                            ? 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40'
                                            : 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40'
                                    }`}
                                >
                                    {isBlacklisted
                                        ? <LockOpen size={28} className="text-green-400 group-hover:scale-110 transition-transform" />
                                        : <Prohibit size={28} className="text-amber-400 group-hover:scale-110 transition-transform" />
                                    }
                                    <div>
                                        <p className={`font-black text-base ${isBlacklisted ? 'text-green-400' : 'text-amber-400'}`}>
                                            {isBlacklisted ? 'Quitar de Blacklist' : 'Añadir a Blacklist'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {isBlacklisted ? 'Restaurar acceso al servidor' : 'Bloquear este servidor'}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('message')}
                                    className="group flex flex-col items-start gap-3 p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all cursor-pointer"
                                >
                                    <PaperPlaneTilt size={28} className="text-purple-400 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="font-black text-purple-400 text-base">Enviar Mensaje</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Mandar un mensaje a un canal</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── TAB: LOGS ──────────────────────────────────────────── */}
                    {activeTab === 'logs' && (
                        <div className="max-w-5xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    <ListDashes size={22} className="text-purple-400" /> Logs del Servidor
                                    <span className="ml-2 text-sm text-slate-500 font-normal">({logsTotal} total)</span>
                                </h2>
                                <button onClick={() => fetchLogs(logsPage)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-sm font-bold transition-all">
                                    <ArrowClockwise size={16} /> Refrescar
                                </button>
                            </div>

                            {logs.length === 0 ? (
                                <div className="text-center py-16 text-slate-600">
                                    <ListDashes size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="font-bold">No hay logs disponibles</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map(log => (
                                        <div key={log._id} className="flex items-start gap-4 p-4 rounded-2xl bg-[#0e0a1f]/60 border border-purple-500/10 hover:border-purple-500/20 transition-all">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-2" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {log.action && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">{log.action}</span>}
                                                    {log.type && <span className="text-xs bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full font-bold">{log.type}</span>}
                                                    {log.timestamp && <span className="text-xs text-slate-600 font-mono ml-auto">{new Date(log.timestamp).toLocaleString()}</span>}
                                                </div>
                                                {log.content && <p className="text-sm text-slate-300 mt-1 truncate">{log.content}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {logsTotal > 20 && (
                                <div className="flex items-center justify-center gap-3 pt-4">
                                    <button onClick={() => fetchLogs(logsPage - 1)} disabled={logsPage === 1}
                                        className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 disabled:opacity-30 hover:bg-purple-500/20 transition-all text-sm font-bold">
                                        ← Anterior
                                    </button>
                                    <span className="text-slate-500 text-sm font-mono">Pág. {logsPage} / {Math.ceil(logsTotal / 20)}</span>
                                    <button onClick={() => fetchLogs(logsPage + 1)} disabled={logsPage >= Math.ceil(logsTotal / 20)}
                                        className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 disabled:opacity-30 hover:bg-purple-500/20 transition-all text-sm font-bold">
                                        Siguiente →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: MESSAGE ─────────────────────────────────────────── */}
                    {activeTab === 'message' && (
                        <div className="max-w-2xl space-y-6">
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <PaperPlaneTilt size={22} className="text-purple-400" /> Enviar Mensaje como Bot
                            </h2>
                            <div className="bg-[#0e0a1f]/80 border border-purple-500/20 rounded-3xl p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-black text-slate-400 mb-2 uppercase tracking-wide">Canal</label>
                                    {textChannels.length > 0 ? (
                                        <select
                                            value={msgChannelId}
                                            onChange={e => setMsgChannelId(e.target.value)}
                                            className="w-full bg-[#080611] border border-purple-500/20 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-purple-400 transition-colors"
                                        >
                                            <option value="">Selecciona un canal...</option>
                                            {textChannels.map(ch => (
                                                <option key={ch.id} value={ch.id}>#{ch.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={msgChannelId}
                                            onChange={e => setMsgChannelId(e.target.value)}
                                            placeholder="ID del canal..."
                                            className="w-full bg-[#080611] border border-purple-500/20 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-purple-400 transition-colors placeholder-slate-600"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-400 mb-2 uppercase tracking-wide">Mensaje</label>
                                    <textarea
                                        value={msgContent}
                                        onChange={e => setMsgContent(e.target.value)}
                                        rows={5}
                                        placeholder="Escribe el mensaje..."
                                        className="w-full bg-[#080611] border border-purple-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-400 transition-colors placeholder-slate-600 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!msgChannelId || !msgContent || actionLoading === 'message'}
                                    className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-purple-600 to-fuchsia-700 hover:from-purple-500 hover:to-fuchsia-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01] active:scale-95"
                                >
                                    {actionLoading === 'message' ? 'Enviando...' : '⚡ Enviar Mensaje'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── TAB: CONFIG ─────────────────────────────────────────── */}
                    {activeTab === 'config' && (
                        <div className="max-w-2xl space-y-6">
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <Gear size={22} className="text-purple-400" /> Forzar Configuración
                            </h2>
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                                <Warning size={20} className="text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-400/80">Estos cambios sobrescriben la configuración del servidor directamente en la base de datos.</p>
                            </div>
                            <div className="bg-[#0e0a1f]/80 border border-purple-500/20 rounded-3xl p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-black text-slate-400 mb-2 uppercase tracking-wide">Campo de Configuración</label>
                                    <select
                                        value={configKey}
                                        onChange={e => setConfigKey(e.target.value)}
                                        className="w-full bg-[#080611] border border-purple-500/20 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-purple-400 transition-colors"
                                    >
                                        <option value="prefix">prefix</option>
                                        <option value="language">language</option>
                                        <option value="logsChannel">logsChannel</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-slate-400 mb-2 uppercase tracking-wide">Nuevo Valor</label>
                                    <input
                                        type="text"
                                        value={configValue}
                                        onChange={e => setConfigValue(e.target.value)}
                                        placeholder="Valor..."
                                        className="w-full bg-[#080611] border border-purple-500/20 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-purple-400 transition-colors placeholder-slate-600"
                                    />
                                </div>
                                <button
                                    onClick={handleForceConfig}
                                    disabled={!configKey || !configValue || actionLoading === 'config'}
                                    className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-95"
                                >
                                    {actionLoading === 'config' ? 'Aplicando...' : '⚡ Forzar Cambio'}
                                </button>

                                {/* Raw config display */}
                                {guild?.dbConfig && (
                                    <div>
                                        <p className="text-xs font-black text-slate-600 uppercase tracking-wide mb-2">Configuración Actual (raw)</p>
                                        <pre className="bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-slate-400 overflow-auto max-h-48 font-mono">
                                            {JSON.stringify(guild.dbConfig, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── Modals ─────────────────────────────────────────────────────── */}

            {showLeaveModal && (
                <ConfirmModal
                    title="⚠️ Salir del Servidor"
                    description={`El bot abandonará "${guild?.name}". Esta acción no se puede deshacer fácilmente.`}
                    confirmLabel={actionLoading === 'leave' ? 'Saliendo...' : 'Sí, salir'}
                    danger
                    onConfirm={handleLeave}
                    onClose={() => setShowLeaveModal(false)}
                />
            )}

            {showBlacklistModal && (
                <ConfirmModal
                    title="🚫 Añadir a Blacklist"
                    description={`"${guild?.name}" será bloqueado y el bot saldrá automáticamente.`}
                    confirmLabel={actionLoading === 'blacklist' ? 'Añadiendo...' : 'Blacklistear'}
                    danger
                    onConfirm={handleBlacklist}
                    onClose={() => { setShowBlacklistModal(false); setBlacklistReason(''); }}
                >
                    <div className="mt-2">
                        <label className="block text-sm font-black text-slate-400 mb-2">Razón (opcional)</label>
                        <textarea
                            value={blacklistReason}
                            onChange={e => setBlacklistReason(e.target.value)}
                            rows={3}
                            placeholder="Describe por qué se blacklistea este servidor..."
                            className="w-full bg-[#080611] border border-purple-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-400 transition-colors placeholder-slate-600 resize-none"
                        />
                    </div>
                </ConfirmModal>
            )}

            {showUnblacklistModal && (
                <ConfirmModal
                    title="✅ Quitar de Blacklist"
                    description={`"${guild?.name}" recuperará el acceso normal al bot.`}
                    confirmLabel={actionLoading === 'unblacklist' ? 'Removiendo...' : 'Sí, quitar'}
                    onConfirm={handleUnblacklist}
                    onClose={() => setShowUnblacklistModal(false)}
                />
            )}
        </div>
    );
}
