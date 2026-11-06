"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ShieldCheck,
    FloppyDisk,
    CheckCircle,
    Robot,
    Fingerprint,
    ShieldWarning,
    WarningOctagon,
    Archive,
    ArrowsClockwise,
    ClockCounterClockwise,
    ListChecks,
    Plus,
    Trash,
    Warning,
    LockKey,
    Play,
    Pause
} from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface GuildInfo {
    id: string;
    name: string;
    ownerId?: string;
    channels: { id: string; name: string; type?: number }[];
    roles: { id: string; name: string; color: number }[];
}

interface AntiRaidSettings {
    enable: boolean;
    action: string;
    minAccountAgeDays: number;
    joinLimit: number;
    timeWindow: number;
    nukeLimit: number;
    nukeWindow: number;
    nukeAction: string;
    nukeBotAction: string;
    backupIntervalMinutes: number;
    backupRetention: number;
    alertChannelId: string;
    trustedUserIds: string[];
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
        quarantineRole: string;
        minAccountAgeDays: number;
    };
    antiraid: AntiRaidSettings;
}

interface AntiRaidOverview {
    isOwner: boolean;
    ownerId?: string;
    configRevision: number;
    settings: AntiRaidSettings;
    state: {
        emergencyActive: boolean;
        incidentId: string;
        pinnedBackupId: string;
        pinnedAt?: string;
        lastBackupId: string;
        lastBackupAt?: string;
        nextBackupAt?: string;
        lastBackupError?: string;
        lastActionError?: string;
        updatedAt?: string;
    };
    queue: Record<string, number>;
    missingPerms: string[];
    history: {
        _id: string;
        kind: string;
        trigger: string;
        actor_ids?: string[];
        action_summary?: string[];
        pinned_backup_id?: string;
        created_at: string;
        acknowledged_at?: string;
        acknowledged_by?: string;
    }[];
    jobs: {
        _id: string;
        incident_id?: string;
        target_id: string;
        is_bot?: boolean;
        action: string;
        reason?: string;
        status: string;
        attempts: number;
        last_error?: string;
        updated_at: string;
    }[];
    backups: {
        id: string;
        length: number;
        uploadDate: string;
        metadata?: {
            guild_id?: string;
            guild_name?: string;
            created_at?: string;
            raw_size?: number;
            sha256?: string;
            kind?: string;
        };
    }[];
}

const DEFAULT_ANTIRAID: AntiRaidSettings = {
    enable: false,
    action: "kick",
    minAccountAgeDays: 0,
    joinLimit: 8,
    timeWindow: 12,
    nukeLimit: 4,
    nukeWindow: 20,
    nukeAction: "strip",
    nukeBotAction: "kick",
    backupIntervalMinutes: 360,
    backupRetention: 5,
    alertChannelId: "",
    trustedUserIds: []
};

export default function SecurityPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [config, setConfig] = useState<SecurityConfig>({
        antibots: { enable: false, _type: "all" },
        verification: { enable: false, _type: "button", channel: "", role: "", quarantineRole: "", minAccountAgeDays: 0 },
        antiraid: { ...DEFAULT_ANTIRAID }
    });

    const [overview, setOverview] = useState<AntiRaidOverview | null>(null);
    const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [controlBusy, setControlBusy] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [newTrustedId, setNewTrustedId] = useState("");
    const [activeTab, setActiveTab] = useState<'incidents' | 'jobs' | 'backups'>('incidents');

    const loadAllData = useCallback(async (silent = false) => {
        if (!guildId) return;
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const [configData, infoData, antiraidData] = await Promise.all([
                fetch(`${API_BASE}/api/guilds/${guildId}/security`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
                fetch(`${API_BASE}/api/guilds/${guildId}/info`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
                fetch(`${API_BASE}/api/guilds/${guildId}/security/antiraid`, { credentials: 'include' }).then(res => res.ok ? res.json() : null)
            ]);

            if (configData) {
                const arSource = antiraidData?.settings || configData.antiraid || DEFAULT_ANTIRAID;
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
                        quarantineRole: configData.verification?.quarantineRole || "",
                        minAccountAgeDays: configData.verification?.minAccountAgeDays || 0
                    },
                    antiraid: {
                        enable: Boolean(arSource.enable),
                        action: arSource.action || "kick",
                        minAccountAgeDays: Number(arSource.minAccountAgeDays ?? 0),
                        joinLimit: Number(arSource.joinLimit || 8),
                        timeWindow: Number(arSource.timeWindow || 12),
                        nukeLimit: Number(arSource.nukeLimit || 4),
                        nukeWindow: Number(arSource.nukeWindow || 20),
                        nukeAction: arSource.nukeAction || "strip",
                        nukeBotAction: arSource.nukeBotAction || "kick",
                        backupIntervalMinutes: Number(arSource.backupIntervalMinutes || 360),
                        backupRetention: Number(arSource.backupRetention || 5),
                        alertChannelId: arSource.alertChannelId || "",
                        trustedUserIds: Array.isArray(arSource.trustedUserIds) ? arSource.trustedUserIds : []
                    }
                });
            }
            if (infoData) setGuildInfo(infoData);
            if (antiraidData) setOverview(antiraidData);
        } catch (err) {
            console.error("Error loading security data:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [guildId]);

    useEffect(() => {
        loadAllData(false);
    }, [loadAllData]);

    const handleControlAction = async (action: string, args: string[] = [], label?: string) => {
        setControlBusy(action);
        setSaveStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/security/antiraid/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action, args })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.error) {
                throw new Error(data.error || data.message || "Error al ejecutar acción de Anti-Raid");
            }
            setSaveStatus(`✅ ${label || data.message || 'Acción ejecutada correctamente'}`);
            await loadAllData(true);
            setTimeout(() => setSaveStatus(null), 4000);
        } catch (err: any) {
            console.error(err);
            setSaveStatus(`❌ ${err?.message || 'Error al ejecutar acción'}`);
        } finally {
            setControlBusy(null);
        }
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        setSaveStatus(null);
        try {
            const payload: any = {
                antibots: config.antibots,
                verification: config.verification
            };
            if (overview?.isOwner) {
                payload.antiraid = config.antiraid;
            }

            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/security`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Error guardando configuración");

            if (overview?.isOwner) {
                await fetch(`${API_BASE}/api/guilds/${guildId}/security/antiraid/control`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        action: 'settings',
                        args: [JSON.stringify(config.antiraid)]
                    })
                }).catch(() => null);
            }

            setSaveStatus("✅ ¡Configuración de seguridad guardada correctamente!");
            await loadAllData(true);
            setTimeout(() => setSaveStatus(null), 3500);
        } catch (error: any) {
            console.error(error);
            setSaveStatus(`❌ ${error?.message || 'Error al guardar'}`);
        } finally {
            setSaving(false);
        }
    };

    const addTrustedUser = () => {
        const trimmed = newTrustedId.trim();
        if (!/^\d{15,22}$/.test(trimmed)) {
            setSaveStatus("❌ Introduce un ID de usuario de Discord válido (15-22 dígitos)");
            return;
        }
        if (config.antiraid.trustedUserIds.includes(trimmed)) {
            setNewTrustedId("");
            return;
        }
        if (config.antiraid.trustedUserIds.length >= 25) {
            setSaveStatus("❌ Máximo 25 usuarios de confianza permitidos");
            return;
        }
        setConfig({
            ...config,
            antiraid: {
                ...config.antiraid,
                trustedUserIds: [...config.antiraid.trustedUserIds, trimmed]
            }
        });
        setNewTrustedId("");
    };

    const removeTrustedUser = (id: string) => {
        setConfig({
            ...config,
            antiraid: {
                ...config.antiraid,
                trustedUserIds: config.antiraid.trustedUserIds.filter(u => u !== id)
            }
        });
    };

    const formatDate = (iso?: string) => {
        if (!iso) return "N/A";
        const d = new Date(iso);
        if (isNaN(d.getTime()) || d.getFullYear() <= 1971) return "N/A";
        return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    };

    if (loading) return (
        <div className="p-10 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-20 bg-white/5 rounded-3xl w-1/3 mb-10"></div>
            {[1, 2, 3].map(i => (
                <div key={i} className="h-56 bg-white/5 rounded-2xl w-full"></div>
            ))}
        </div>
    );

    const isOwner = Boolean(overview?.isOwner);
    const emergencyActive = Boolean(overview?.state?.emergencyActive);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                        <ShieldCheck size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Seguridad, Anti-Raid y Anti-Nuke</h1>
                        <p className="text-slate-400">Defensa activa en tiempo real, contención de emergencias y verificación</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => loadAllData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
                    >
                        <ArrowsClockwise size={18} className={refreshing ? "animate-spin text-cyan-400" : ""} />
                        <span className="text-sm font-bold">Actualizar</span>
                    </button>
                    <Link
                        href={`/dashboard/${guildId}/backups`}
                        className="flex items-center gap-2 text-cyan-300 hover:text-white bg-cyan-500/15 hover:bg-cyan-500/25 px-4 py-2.5 rounded-xl border border-cyan-500/30 transition-all"
                    >
                        <Archive size={18} weight="duotone" />
                        <span className="text-sm font-bold">Backups y Restauración</span>
                    </Link>
                    <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Volver</span>
                    </Link>
                </div>
            </div>

            {/* Banner de permisos de propietario */}
            {!isOwner && (
                <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3 text-amber-200 text-sm">
                    <LockKey size={22} weight="duotone" className="text-amber-400 shrink-0" />
                    <div>
                        <strong>Modo lectura en Anti-Raid:</strong> Por seguridad de PancyBot, solo el <strong>propietario del servidor</strong> puede modificar los parámetros de Anti-Raid/Anti-Nuke o activar controles de emergencia. Puedes seguir editando Anti-Bots y Verificación.
                    </div>
                </div>
            )}

            {/* Alertas de permisos faltantes del bot o errores */}
            {overview?.missingPerms && overview.missingPerms.length > 0 && (
                <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-500/10 flex items-start gap-3 text-red-200 text-sm">
                    <Warning size={22} weight="fill" className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <strong>Permisos faltantes en el Bot:</strong> Para que Anti-Raid pueda contener ataques y capturar copias, otorga al bot los permisos:{" "}
                        <span className="font-mono text-red-300">{overview.missingPerms.join(", ")}</span>.
                    </div>
                </div>
            )}

            {/* PANEL DE ESTADO EN VIVO Y CONTROL DE EMERGENCIA ANTIRAID */}
            <div className={`glass-panel p-6 md:p-8 rounded-3xl border transition-all relative overflow-hidden ${emergencyActive ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : 'border-red-500/15 bg-black/20'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${emergencyActive ? 'bg-red-500/30 text-red-300 animate-pulse' : config.antiraid.enable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'}`}>
                            {emergencyActive ? <WarningOctagon size={30} weight="fill" /> : <ShieldWarning size={30} weight="duotone" />}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-white">Centro de Control Anti-Raid</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${config.antiraid.enable ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-300 border border-white/10'}`}>
                                    {config.antiraid.enable ? 'Vigilancia Activa' : 'Vigilancia Inactiva'}
                                </span>
                                {emergencyActive && (
                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/30 text-red-200 border border-red-400/50 animate-pulse">
                                        🚨 Emergencia Activa (Incidente {overview?.state?.incidentId})
                                    </span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono bg-white/5 text-slate-400 border border-white/10">
                                    Rev #{overview?.configRevision || 0}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                                Monitorea entradas masivas, destrucción de canales/roles/webhooks y mantiene copias automáticas seguras sin sobrescribir la última copia sana durante un ataque.
                            </p>
                        </div>
                    </div>

                    {/* Botones de Acción Rápida (Solo Owner) */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            disabled={!isOwner || controlBusy !== null}
                            onClick={() => handleControlAction(
                                config.antiraid.enable ? 'disable' : 'enable',
                                [],
                                config.antiraid.enable ? 'Vigilancia Anti-Raid desactivada' : 'Vigilancia Anti-Raid activada'
                            )}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${config.antiraid.enable ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'}`}
                        >
                            {config.antiraid.enable ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                            {config.antiraid.enable ? 'Pausar Vigilancia' : 'Activar Vigilancia'}
                        </button>

                        <button
                            type="button"
                            disabled={!isOwner || controlBusy !== null}
                            onClick={() => handleControlAction(
                                'panic',
                                [emergencyActive ? 'off' : 'on'],
                                emergencyActive ? 'Modo pánico desactivado' : 'Modo pánico activado y copia fijada'
                            )}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${emergencyActive ? 'bg-slate-500/20 hover:bg-slate-500/30 text-white border-white/20' : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40'}`}
                        >
                            <WarningOctagon size={16} weight="fill" />
                            {emergencyActive ? 'Salir de Pánico' : 'Modo Pánico'}
                        </button>

                        {emergencyActive && (
                            <button
                                type="button"
                                disabled={!isOwner || controlBusy !== null}
                                onClick={() => handleControlAction('resume', [], 'Incidente reconocido y copias automáticas reanudadas')}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <CheckCircle size={16} weight="fill" />
                                Reconocer Incidente
                            </button>
                        )}

                        <button
                            type="button"
                            disabled={!isOwner || emergencyActive || controlBusy !== null}
                            onClick={() => handleControlAction('snapshot', [], 'Copia automática sana programada')}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Archive size={16} weight="fill" />
                            Programar Copia Sana
                        </button>
                    </div>
                </div>

                {/* Indicadores de Estado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Última Copia Sana</div>
                        <div className="text-base font-mono font-bold text-white mt-1 truncate">
                            {overview?.state?.lastBackupId || "Ninguna aún"}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {formatDate(overview?.state?.lastBackupAt)}
                        </div>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Copia Fijada (Protegida)</div>
                        <div className="text-base font-mono font-bold text-cyan-300 mt-1 truncate">
                            {overview?.state?.pinnedBackupId || "Sin fijar"}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {overview?.state?.pinnedAt ? `Fijada: ${formatDate(overview.state.pinnedAt)}` : "Se fija automáticamente en un raid"}
                        </div>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Próxima Copia Automática</div>
                        <div className="text-base font-bold text-white mt-1">
                            {emergencyActive ? "En pausa por emergencia" : formatDate(overview?.state?.nextBackupAt)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            Cada {config.antiraid.backupIntervalMinutes} min · Retención: {config.antiraid.backupRetention}
                        </div>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Cola de Respuesta</div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                Pendientes: {(overview?.queue?.pending || 0) + (overview?.queue?.running || 0)}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                OK: {overview?.queue?.succeeded || 0}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                                Fallos/Rev: {(overview?.queue?.failed || 0) + (overview?.queue?.needs_review || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {(overview?.state?.lastBackupError || overview?.state?.lastActionError) && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
                        {overview.state.lastBackupError && <div><strong>Aviso de Copia:</strong> {overview.state.lastBackupError}</div>}
                        {overview.state.lastActionError && <div><strong>Aviso de Acción:</strong> {overview.state.lastActionError}</div>}
                    </div>
                )}
            </div>

            {/* FORMULARIO DE PARÁMETROS ANTI-RAID & ANTI-NUKE */}
            <div className={`glass-panel p-6 md:p-8 rounded-3xl border border-cyan-500/15 space-y-6 bg-black/20 ${!isOwner ? 'opacity-65 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div className="flex items-center gap-3">
                        <ShieldWarning size={24} className="text-cyan-400" />
                        <div>
                            <h3 className="text-xl font-bold text-white">Parámetros de Detección Anti-Raid y Anti-Nuke</h3>
                            <p className="text-xs text-slate-400">Configura umbrales de entradas, protección contra borrado masivo y copias automáticas</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.antiraid.enable}
                            onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, enable: e.target.checked } })}
                        />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Columna 1: Anti-Join Raid */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">1. Avalancha de Entradas (Join Raid)</h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">Límite Entradas (3-50)</label>
                                <input
                                    type="number"
                                    min={3}
                                    max={50}
                                    value={config.antiraid.joinLimit}
                                    onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, joinLimit: parseInt(e.target.value) || 8 } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">Ventana Seg. (5-120s)</label>
                                <input
                                    type="number"
                                    min={5}
                                    max={120}
                                    value={config.antiraid.timeWindow}
                                    onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, timeWindow: parseInt(e.target.value) || 12 } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">Edad Mínima de Cuenta (0-365 días)</label>
                            <input
                                type="number"
                                min={0}
                                max={365}
                                value={config.antiraid.minAccountAgeDays}
                                onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, minAccountAgeDays: parseInt(e.target.value) || 0 } })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">Acción ante Raid de Entradas</label>
                            <select
                                value={config.antiraid.action}
                                onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, action: e.target.value } })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                            >
                                <option value="kick">Expulsar (Kick)</option>
                                <option value="ban">Banear (Ban)</option>
                                <option value="alert">Solo Alertar y Fijar Copia</option>
                            </select>
                        </div>
                    </div>

                    {/* Columna 2: Anti-Nuke */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-sm font-bold text-orange-300 uppercase tracking-wider">2. Protección Anti-Nuke (Auditoría)</h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">Límite Acciones (2-25)</label>
                                <input
                                    type="number"
                                    min={2}
                                    max={25}
                                    value={config.antiraid.nukeLimit}
                                    onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, nukeLimit: parseInt(e.target.value) || 4 } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">Ventana Seg. (5-120s)</label>
                                <input
                                    type="number"
                                    min={5}
                                    max={120}
                                    value={config.antiraid.nukeWindow}
                                    onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, nukeWindow: parseInt(e.target.value) || 20 } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">Acción a Administradores / Humanos</label>
                            <select
                                value={config.antiraid.nukeAction}
                                onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, nukeAction: e.target.value } })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                            >
                                <option value="strip">Quitar Roles Peligrosos (Strip)</option>
                                <option value="kick">Expulsar (Kick)</option>
                                <option value="ban">Banear (Ban)</option>
                                <option value="alert">Solo Alertar</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">Acción a Bots Atacantes</label>
                            <select
                                value={config.antiraid.nukeBotAction}
                                onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, nukeBotAction: e.target.value } })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                            >
                                <option value="kick">Expulsar Bot (Kick)</option>
                                <option value="ban">Banear Bot (Ban)</option>
                                <option value="alert">Solo Alertar</option>
                            </select>
                        </div>
                    </div>

                    {/* Columna 3: Copias Automáticas y Alertas */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                        <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wider">3. Copias Automáticas y Alertas</h4>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">Intervalo (Minutos)</label>
                                <input
                                    type="number"
                                    min={15}
                                    max={10080}
                                    value={config.antiraid.backupIntervalMinutes}
                                    onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, backupIntervalMinutes: parseInt(e.target.value) || 360 } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">Retención (1-20)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={config.antiraid.backupRetention}
                                    onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, backupRetention: parseInt(e.target.value) || 5 } })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">Canal de Alertas Anti-Raid</label>
                            <select
                                value={config.antiraid.alertChannelId}
                                onChange={(e) => setConfig({ ...config, antiraid: { ...config.antiraid, alertChannelId: e.target.value } })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                            >
                                <option value="">Sin canal de alertas...</option>
                                {guildInfo?.channels?.map(ch => (
                                    <option key={ch.id} value={ch.id}># {ch.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">Usuarios de Confianza ({config.antiraid.trustedUserIds.length}/25)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="ID de usuario (ej. 123456789012345678)"
                                    value={newTrustedId}
                                    onChange={(e) => setNewTrustedId(e.target.value)}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={addTrustedUser}
                                    className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus size={14} weight="bold" /> Añadir
                                </button>
                            </div>
                            {config.antiraid.trustedUserIds.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto">
                                    {config.antiraid.trustedUserIds.map(uid => (
                                        <span key={uid} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-200">
                                            {uid}
                                            <button type="button" onClick={() => removeTrustedUser(uid)} className="text-red-400 hover:text-red-300">
                                                <Trash size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* HISTORIAL DE INCIDENTES, COLA DE ACCIONES Y COPIAS AUTOMÁTICAS */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 bg-black/20 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('incidents')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'incidents' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'text-slate-400 hover:text-white bg-white/5'}`}
                        >
                            <ClockCounterClockwise size={18} />
                            Incidentes ({overview?.history?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('jobs')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'jobs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white bg-white/5'}`}
                        >
                            <ListChecks size={18} />
                            Cola de Respuesta ({overview?.jobs?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('backups')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'backups' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white bg-white/5'}`}
                        >
                            <Archive size={18} />
                            Copias Automáticas ({overview?.backups?.length || 0})
                        </button>
                    </div>
                </div>

                {activeTab === 'incidents' && (
                    <div className="space-y-3">
                        {(!overview?.history || overview.history.length === 0) ? (
                            <p className="text-sm text-slate-400 py-6 text-center">No hay incidentes registrados en este servidor.</p>
                        ) : (
                            overview.history.map(inc => (
                                <div key={inc._id} className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-white">{inc._id}</span>
                                            <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                                {inc.kind}
                                            </span>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full ${inc.acknowledged_at ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {inc.acknowledged_at ? 'Reconocido' : 'Activo / Pendiente'}
                                            </span>
                                            <span className="text-xs text-slate-400">{formatDate(inc.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-slate-200 font-medium">{inc.trigger}</p>
                                        {inc.action_summary && inc.action_summary.length > 0 && (
                                            <p className="text-xs text-slate-400">Acciones: {inc.action_summary.join(', ')}</p>
                                        )}
                                    </div>
                                    {inc.pinned_backup_id && (
                                        <div className="text-right shrink-0">
                                            <div className="text-[11px] text-slate-400">Copia Fijada</div>
                                            <div className="text-xs font-mono text-cyan-300">{inc.pinned_backup_id}</div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="space-y-3">
                        {(!overview?.jobs || overview.jobs.length === 0) ? (
                            <p className="text-sm text-slate-400 py-6 text-center">No hay tareas de contención en la cola.</p>
                        ) : (
                            overview.jobs.map(job => (
                                <div key={job._id} className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-white">{job._id}</span>
                                            <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                                                {job.action}
                                            </span>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${job.status === 'succeeded' ? 'bg-emerald-500/20 text-emerald-300' : job.status === 'pending' || job.status === 'running' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {job.status} (Intentos: {job.attempts})
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-300">
                                            Objetivo: <span className="font-mono text-white">{job.target_id}</span> {job.reason ? `· ${job.reason}` : ''}
                                        </div>
                                        {job.last_error && (
                                            <div className="text-xs text-red-400">Error: {job.last_error}</div>
                                        )}
                                    </div>
                                    {isOwner && (job.status === 'failed' || job.status === 'needs_review') && (
                                        <button
                                            type="button"
                                            disabled={controlBusy !== null}
                                            onClick={() => handleControlAction('retry', [job._id], `Reintentando tarea ${job._id}`)}
                                            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                                        >
                                            <ArrowsClockwise size={14} weight="bold" />
                                            Reintentar
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'backups' && (
                    <div className="space-y-3">
                        {(!overview?.backups || overview.backups.length === 0) ? (
                            <p className="text-sm text-slate-400 py-6 text-center">No hay copias automáticas almacenadas todavía.</p>
                        ) : (
                            overview.backups.map(b => {
                                const isPinned = overview?.state?.pinnedBackupId === b.id;
                                const isLast = overview?.state?.lastBackupId === b.id;
                                return (
                                    <div key={b.id} className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-sm font-bold text-white">{b.id}</span>
                                                {isPinned && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/25 text-red-200 border border-red-500/40">
                                                        📌 Fijada por Emergencia
                                                    </span>
                                                )}
                                                {isLast && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                        ✅ Última Copia Sana
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Creada: {formatDate(b.metadata?.created_at || b.uploadDate)} · Tamaño comprimido: {Math.max(1, Math.round(b.length / 1024))} KiB
                                            </div>
                                        </div>
                                        <Link
                                            href={`/dashboard/${guildId}/backups`}
                                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 transition-all shrink-0"
                                        >
                                            Gestionar en Backups →
                                        </Link>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* ANTIBOTS Y VERIFICACIÓN */}
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
                        <p className="text-sm text-slate-400">Los usuarios tendrán que verificarse en un canal específico para poder acceder al resto del servidor.</p>

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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                                <div>
                                    <label className="text-sm font-bold text-slate-300 mb-2 block">Rol de Cuarentena (Opcional)</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                        value={config.verification.quarantineRole}
                                        onChange={(e) => setConfig({ ...config, verification: { ...config.verification, quarantineRole: e.target.value } })}
                                    >
                                        <option value="">Sin rol (Expulsar si no cumple)</option>
                                        {guildInfo?.roles?.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-300 block mb-1">Antigüedad Mínima (Días)</label>
                                <p className="text-xs text-slate-500 mb-2">Si una cuenta es más nueva que estos días, se le asignará el rol de cuarentena o será expulsada. (0 para desactivar)</p>
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
                                    <strong>¿Cómo envío el panel?</strong><br />
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
                        className={`bg-zinc-200 hover:bg-white text-black font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,212,216,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] cursor-pointer ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                    >
                        <FloppyDisk size={20} weight={saving ? "duotone" : "bold"} className={saving ? "animate-pulse" : ""} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
