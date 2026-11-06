"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Archive,
    Plus,
    Trash,
    DownloadSimple,
    Eye,
    ArrowsClockwise,
    ClockCounterClockwise,
    CheckCircle,
    Warning,
    ShieldCheck,
    MagnifyingGlass,
    Play,
    Info,
    X,
    LockKey,
    Wrench
} from 'phosphor-react';

const API_BASE = "https://api.pancy.miau.media";

interface BackupFile {
    id: string;
    length: number;
    uploadDate: string;
    metadata: {
        version?: number;
        owner_id: string;
        guild_id: string;
        guild_name: string;
        created_at: string;
        raw_size: number;
        sha256: string;
        kind?: string;
    };
}

interface RestoreJob {
    _id: string;
    owner_id: string;
    guild_id: string;
    backup_id: string;
    checksum: string;
    status: string;
    created_at: string;
    updated_at: string;
    error?: string;
}

interface RestoreStep {
    _id: string;
    job_id: string;
    key: string;
    kind: string;
    source_id?: string;
    target_id?: string;
    method: string;
    path: string;
    name: string;
    status: string;
    error?: string;
}

interface BackupDetailInfo {
    file: BackupFile;
    version: number;
    createdAt: string;
    counts: {
        roles: number;
        channels: number;
        emojis: number;
        stickers: number;
        automod: number;
        events: number;
        sounds: number;
    } | null;
    warnings: string[];
}

interface PreviewResult {
    plan: {
        GuildChange: boolean;
        Roles: number;
        Channels: number;
        Emojis: number;
        Stickers: number;
        AutoMod: number;
        Events: number;
        Sounds: number;
        Total: number;
        Skipped: number;
        Warnings?: string[];
        Steps?: {
            Key: string;
            Kind: string;
            Method: string;
            Path: string;
            Name: string;
            Status: string;
        }[];
    };
    existingJob?: RestoreJob | null;
}

export default function BackupsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const [files, setFiles] = useState<BackupFile[]>([]);
    const [jobs, setJobs] = useState<RestoreJob[]>([]);
    const [manualCount, setManualCount] = useState(0);
    const [maxPerUser, setMaxPerUser] = useState(10);
    const [isOwner, setIsOwner] = useState(false);
    const [pinnedBackupId, setPinnedBackupId] = useState("");
    const [lastBackupId, setLastBackupId] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [query, setQuery] = useState("");
    const [filterTab, setFilterTab] = useState<'all' | 'guild' | 'manual' | 'antiraid'>('all');
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    // Modals
    const [detailModal, setDetailModal] = useState<BackupDetailInfo | null>(null);
    const [previewModal, setPreviewModal] = useState<{ backup: BackupFile; data: PreviewResult } | null>(null);
    const [restoreModal, setRestoreModal] = useState<BackupFile | null>(null);
    const [confirmGuildInput, setConfirmGuildInput] = useState("");
    const [forceNewJournal, setForceNewJournal] = useState(false);
    const [restoring, setRestoring] = useState(false);

    // Job Inspector Modal
    const [jobInspector, setJobInspector] = useState<{ job: RestoreJob; steps: RestoreStep[] } | null>(null);
    const [resolveStepKey, setResolveStepKey] = useState("");
    const [resolveResourceId, setResolveResourceId] = useState("");
    const [jobActionBusy, setJobActionBusy] = useState(false);

    const fetchBackups = useCallback(async (search = query) => {
        if (!guildId) return;
        setLoading(true);
        try {
            const url = `${API_BASE}/api/guilds/${guildId}/backups${search ? `?q=${encodeURIComponent(search)}` : ''}`;
            const res = await fetch(url, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setFiles(Array.isArray(data.files) ? data.files : []);
                setJobs(Array.isArray(data.jobs) ? data.jobs : []);
                setManualCount(Number(data.manualCount || 0));
                setMaxPerUser(Number(data.maxPerUser || 10));
                setIsOwner(Boolean(data.isOwner));
                setPinnedBackupId(data.pinnedBackupId || "");
                setLastBackupId(data.lastBackupId || "");
            }
        } catch (err) {
            console.error("Error cargando backups:", err);
        } finally {
            setLoading(false);
        }
    }, [guildId, query]);

    useEffect(() => {
        fetchBackups("");
    }, [guildId]);

    const handleCreateBackup = async () => {
        setCreating(true);
        setStatusMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/backups/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.error) {
                throw new Error(data.error || "No se pudo crear la copia de seguridad");
            }
            setStatusMsg(`✅ Copia de seguridad creada con éxito (${data.file?.id || ''})`);
            await fetchBackups(query);
        } catch (err: any) {
            setStatusMsg(`❌ ${err?.message || 'Error al crear copia de seguridad'}`);
        } finally {
            setCreating(false);
        }
    };

    const handleInspectBackup = async (backupId: string) => {
        setStatusMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/backups/${backupId}`, {
                credentials: 'include'
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.error) {
                throw new Error(data.error || "No se pudo leer el detalle de la copia");
            }
            setDetailModal(data);
        } catch (err: any) {
            setStatusMsg(`❌ ${err?.message || 'Error al inspeccionar copia'}`);
        }
    };

    const handlePreviewBackup = async (backup: BackupFile, forceNew = false) => {
        setStatusMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/backups/${backup.id}/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ new: forceNew })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.error) {
                throw new Error(data.error || "No se pudo generar la vista previa");
            }
            setPreviewModal({ backup, data });
        } catch (err: any) {
            setStatusMsg(`❌ ${err?.message || 'Error en vista previa'}`);
        }
    };

    const handleExecuteRestore = async () => {
        if (!restoreModal) return;
        if (confirmGuildInput.trim() !== guildId) {
            setStatusMsg("❌ El ID de confirmación no coincide con el ID de este servidor.");
            return;
        }
        setRestoring(true);
        setStatusMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/backups/${restoreModal.id}/load`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    confirm: confirmGuildInput.trim(),
                    new: forceNewJournal
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok && !data.job) {
                throw new Error(data.error || "Error al ejecutar la restauración");
            }
            setRestoreModal(null);
            setConfirmGuildInput("");
            if (data.error) {
                setStatusMsg(`⚠️ Restauración pausada (${data.job?._id || ''}): ${data.error}`);
            } else {
                setStatusMsg(`✅ Restauración completada (${data.report?.Applied || 0} aplicados, ${data.report?.Skipped || 0} omitidos)`);
            }
            await fetchBackups(query);
            if (data.job?._id) {
                await handleInspectJob(data.job._id);
            }
        } catch (err: any) {
            setStatusMsg(`❌ ${err?.message || 'Error al restaurar copia'}`);
        } finally {
            setRestoring(false);
        }
    };

    const handleDeleteBackup = async (backupId: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar la copia de seguridad ${backupId}? Esta acción es irreversible.`)) {
            return;
        }
        setStatusMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/backups/${backupId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.error) {
                throw new Error(data.error || "No se pudo eliminar la copia");
            }
            setStatusMsg(`✅ Copia ${backupId} eliminada correctamente`);
            await fetchBackups(query);
        } catch (err: any) {
            setStatusMsg(`❌ ${err?.message || 'Error al eliminar copia'}`);
        }
    };

    const handleInspectJob = async (jobId: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/backups/jobs/${jobId}`, {
                credentials: 'include'
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.error) {
                throw new Error(data.error || "No se pudo consultar la operación");
            }
            setJobInspector({ job: data.job, steps: Array.isArray(data.steps) ? data.steps : [] });
        } catch (err: any) {
            setStatusMsg(`❌ ${err?.message || 'Error al consultar operación'}`);
        }
    };

    const handleResumeJob = async (jobId: string) => {
        setJobActionBusy(true);
        setStatusMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/backups/jobs/${jobId}/resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ confirm: guildId })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok && !data.job) {
                throw new Error(data.error || "Error al reanudar restauración");
            }
            setStatusMsg(data.error ? `⚠️ Restauración pausada: ${data.error}` : `✅ Restauración ${jobId} reanudada con éxito`);
            await handleInspectJob(jobId);
            await fetchBackups(query);
        } catch (err: any) {
            setStatusMsg(`❌ ${err?.message || 'Error al reanudar'}`);
        } finally {
            setJobActionBusy(false);
        }
    };

    const handleResolveStep = async (jobId: string, stepKey: string, resourceId: string) => {
        setJobActionBusy(true);
        setStatusMsg(null);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/backups/jobs/${jobId}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    confirm: guildId,
                    step: stepKey,
                    resource: resourceId
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.error) {
                throw new Error(data.error || "No se pudo resolver el paso");
            }
            setStatusMsg(`✅ Paso ${stepKey} marcado como aplicado. Ahora puedes reanudar la restauración.`);
            setResolveStepKey("");
            setResolveResourceId("");
            await handleInspectJob(jobId);
        } catch (err: any) {
            setStatusMsg(`❌ ${err?.message || 'Error al resolver paso'}`);
        } finally {
            setJobActionBusy(false);
        }
    };

    const formatDate = (iso?: string) => {
        if (!iso) return "N/A";
        const d = new Date(iso);
        if (isNaN(d.getTime())) return "N/A";
        return d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    };

    const filteredFiles = files.filter(f => {
        if (filterTab === 'guild') return f.metadata?.guild_id === guildId;
        if (filterTab === 'manual') return f.metadata?.kind !== 'antiraid';
        if (filterTab === 'antiraid') return f.metadata?.kind === 'antiraid';
        return true;
    });

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                        <Archive size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-wide">Copias de Seguridad (Backups)</h1>
                        <p className="text-slate-400">Captura instantáneas completas, descarga archivos .pbackup y restaura con diario transaccional</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={`/dashboard/${guildId}/security`}
                        className="flex items-center gap-2 text-orange-300 hover:text-white bg-orange-500/15 hover:bg-orange-500/25 px-4 py-2.5 rounded-xl border border-orange-500/30 transition-all"
                    >
                        <ShieldCheck size={18} weight="fill" />
                        <span className="text-sm font-bold">Centro Anti-Raid</span>
                    </Link>
                    <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Volver</span>
                    </Link>
                </div>
            </div>

            {statusMsg && (
                <div className={`glass-panel p-4 rounded-2xl border flex items-center justify-between text-sm font-medium ${statusMsg.includes('✅') ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : statusMsg.includes('⚠️') ? 'border-amber-500/40 bg-amber-500/10 text-amber-200' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
                    <span>{statusMsg}</span>
                    <button type="button" onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Barra de Cuota, Búsqueda y Crear Copia */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-black/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-white">Cuota de Copias Manuales</span>
                        <span className="font-mono text-cyan-300 font-bold">{manualCount} / {maxPerUser} utilizadas</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (manualCount / Math.max(1, maxPerUser)) * 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400">
                        Las copias automáticas de Anti-Raid tienen su propia retención y no consumen tu cuota manual de {maxPerUser} copias.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por servidor o ID..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchBackups(query)}
                            className="bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchBackups(query)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-slate-200 cursor-pointer flex items-center gap-2"
                    >
                        <ArrowsClockwise size={16} className={loading ? "animate-spin text-cyan-400" : ""} />
                        Buscar
                    </button>
                    <button
                        type="button"
                        disabled={creating || manualCount >= maxPerUser}
                        onClick={handleCreateBackup}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Plus size={18} weight="bold" />
                        {creating ? 'Capturando Servidor...' : 'Crear Backup Ahora'}
                    </button>
                </div>
            </div>

            {/* Pestañas de Filtro */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        { id: 'all', label: `Todas tus copias (${files.length})` },
                        { id: 'guild', label: 'De este servidor' },
                        { id: 'manual', label: 'Manuales' },
                        { id: 'antiraid', label: 'Automáticas Anti-Raid' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterTab(tab.id as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === tab.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {!isOwner && (
                    <div className="text-xs text-amber-300 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                        <LockKey size={14} weight="fill" />
                        Solo el propietario del servidor puede ejecutar vistas previas o restaurar copias.
                    </div>
                )}
            </div>

            {/* Lista de Copias de Seguridad */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 bg-white/5 rounded-2xl w-full" />
                    ))}
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-4">
                    <Archive size={48} weight="duotone" className="text-slate-500 mx-auto" />
                    <h3 className="text-xl font-bold text-white">No se encontraron copias de seguridad</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Haz clic en &ldquo;Crear Backup Ahora&rdquo; para guardar la estructura completa de roles, canales, permisos, emojis, stickers, eventos y reglas AutoMod de este servidor.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredFiles.map(file => {
                        const isAuto = file.metadata?.kind === 'antiraid';
                        const isPinned = pinnedBackupId === file.id;
                        const isLast = lastBackupId === file.id;
                        const isProtected = isAuto && (isPinned || isLast);
                        const isSameGuild = file.metadata?.guild_id === guildId;

                        return (
                            <div key={file.id} className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/25 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="font-mono text-base font-black text-white bg-white/10 px-3 py-1 rounded-lg">
                                            {file.id}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isAuto ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
                                            {isAuto ? '🤖 Auto Anti-Raid' : '👤 Manual'}
                                        </span>
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
                                        {isSameGuild && (
                                            <span className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-slate-300">
                                                Este servidor
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-sm text-slate-200 font-medium">
                                        Servidor origen: <strong className="text-white">{file.metadata?.guild_name || file.metadata?.guild_id}</strong>{" "}
                                        <span className="text-xs font-mono text-slate-400">({file.metadata?.guild_id})</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                                        <span>Creada: {formatDate(file.metadata?.created_at || file.uploadDate)}</span>
                                        <span>Comprimido: {Math.max(1, Math.round(file.length / 1024))} KiB</span>
                                        {file.metadata?.raw_size && (
                                            <span>JSON Original: {Math.max(1, Math.round(file.metadata.raw_size / 1024))} KiB</span>
                                        )}
                                        {file.metadata?.sha256 && (
                                            <span className="font-mono text-[11px] text-slate-500">
                                                SHA-256: {file.metadata.sha256.slice(0, 16)}…
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleInspectBackup(file.id)}
                                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Info size={16} />
                                        Detalles
                                    </button>

                                    <a
                                        href={`${API_BASE}/api/guilds/${guildId}/backups/${file.id}/download`}
                                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-cyan-300 flex items-center gap-1.5"
                                    >
                                        <DownloadSimple size={16} weight="bold" />
                                        .pbackup
                                    </a>

                                    {isOwner && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handlePreviewBackup(file, false)}
                                                className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-bold text-indigo-200 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Eye size={16} />
                                                Vista Previa
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRestoreModal(file);
                                                    setConfirmGuildInput("");
                                                    setForceNewJournal(false);
                                                }}
                                                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-200 flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Play size={16} weight="fill" />
                                                Restaurar aquí
                                            </button>
                                        </>
                                    )}

                                    <button
                                        type="button"
                                        disabled={isProtected}
                                        title={isProtected ? "Protegida por Anti-Raid (fijada o última copia sana)" : "Eliminar copia"}
                                        onClick={() => handleDeleteBackup(file.id)}
                                        className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold text-red-300 flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Operaciones de Restauración Recientes (Diario Transaccional) */}
            {jobs.length > 0 && (
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 bg-black/20 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <ClockCounterClockwise size={24} className="text-amber-400" />
                        <div>
                            <h3 className="text-xl font-bold text-white">Diario de Operaciones de Restauración</h3>
                            <p className="text-xs text-slate-400">Revisa el progreso paso a paso, reanuda restauraciones interrumpidas o resuelve pasos inciertos</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {jobs.map(job => (
                            <div key={job._id} className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white/10 text-white">
                                            Job: {job._id}
                                        </span>
                                        <span className="font-mono text-xs text-cyan-300">
                                            Backup: {job.backup_id}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : job.status === 'running' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                            {job.status}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            Actualizado: {formatDate(job.updated_at)}
                                        </span>
                                    </div>
                                    {job.error && (
                                        <p className="text-xs text-red-400">Detalle: {job.error}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleInspectJob(job._id)}
                                        className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Eye size={15} />
                                        Ver Pasos
                                    </button>
                                    {isOwner && job.status !== 'completed' && (
                                        <button
                                            type="button"
                                            disabled={jobActionBusy}
                                            onClick={() => handleResumeJob(job._id)}
                                            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-200 cursor-pointer flex items-center gap-1.5"
                                        >
                                            <ArrowsClockwise size={15} />
                                            Reanudar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL: DETALLE DE BACKUP */}
            {detailModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-white/15 bg-[#0b0b18] space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Info size={22} className="text-cyan-400" />
                                Detalle de Copia #{detailModal.file.id}
                            </h3>
                            <button type="button" onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {detailModal.counts ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { label: 'Roles', val: detailModal.counts.roles },
                                    { label: 'Canales', val: detailModal.counts.channels },
                                    { label: 'Emojis', val: detailModal.counts.emojis },
                                    { label: 'Stickers', val: detailModal.counts.stickers },
                                    { label: 'Reglas AutoMod', val: detailModal.counts.automod },
                                    { label: 'Eventos', val: detailModal.counts.events },
                                    { label: 'Sonidos Soundboard', val: detailModal.counts.sounds }
                                ].map(item => (
                                    <div key={item.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-xs text-slate-400">{item.label}</div>
                                        <div className="text-lg font-black text-white">{item.val}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Metadatos de archivo disponibles en GridFS.</p>
                        )}

                        {detailModal.warnings && detailModal.warnings.length > 0 && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1 max-h-40 overflow-y-auto">
                                <div className="font-bold">Advertencias de captura:</div>
                                {detailModal.warnings.map((w, idx) => (
                                    <div key={idx}>• {w}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: VISTA PREVIA (PREVIEW) */}
            {previewModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="glass-panel max-w-2xl w-full p-6 rounded-3xl border border-white/15 bg-[#0b0b18] space-y-5 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Eye size={22} className="text-indigo-400" />
                                Vista Previa de Restauración ({previewModal.backup.id})
                            </h3>
                            <button type="button" onClick={() => setPreviewModal(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto space-y-4 pr-1">
                            {previewModal.data.existingJob && (
                                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200">
                                    Existe una operación previa (Job <code className="font-mono">{previewModal.data.existingJob._id}</code> en estado <strong>{previewModal.data.existingJob.status}</strong>). Los pasos ya completados se omitirán automáticamente salvo que inicies un diario nuevo.
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-slate-400">Operaciones Totales</div>
                                    <div className="text-xl font-black text-white">{previewModal.data.plan.Total}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-slate-400">Ya Aplicadas / Omitidas</div>
                                    <div className="text-xl font-black text-emerald-300">{previewModal.data.plan.Skipped}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-slate-400">Roles / Canales</div>
                                    <div className="text-lg font-bold text-white">{previewModal.data.plan.Roles} / {previewModal.data.plan.Channels}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-xs text-slate-400">Emojis / AutoMod</div>
                                    <div className="text-lg font-bold text-white">{previewModal.data.plan.Emojis} / {previewModal.data.plan.AutoMod}</div>
                                </div>
                            </div>

                            {previewModal.data.plan.Steps && previewModal.data.plan.Steps.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="text-xs font-bold text-slate-300 uppercase">Primeros pasos planificados:</div>
                                    <div className="max-h-56 overflow-y-auto space-y-1 bg-black/40 p-3 rounded-xl border border-white/5 text-xs font-mono">
                                        {previewModal.data.plan.Steps.slice(0, 60).map(s => (
                                            <div key={s.Key} className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0">
                                                <span className="text-slate-300 truncate">[{s.Kind}] {s.Name} ({s.Method})</span>
                                                <span className={s.Status === 'completed' ? 'text-emerald-400' : 'text-cyan-300'}>{s.Status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => {
                                    const b = previewModal.backup;
                                    setPreviewModal(null);
                                    setRestoreModal(b);
                                    setConfirmGuildInput("");
                                }}
                                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-200 cursor-pointer"
                            >
                                Proceder a Restaurar →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CONFIRMAR RESTAURACIÓN */}
            {restoreModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-red-500/30 bg-[#0b0b18] space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Warning size={22} weight="fill" className="text-amber-400" />
                                Confirmar Restauración
                            </h3>
                            <button type="button" onClick={() => setRestoreModal(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-slate-300">
                            Vas a restaurar la copia <code className="text-cyan-300 font-mono">{restoreModal.id}</code> ({restoreModal.metadata?.guild_name}) sobre este servidor.
                            Esta operación sincronizará ajustes, roles, canales, permisos, emojis, stickers, eventos y reglas AutoMod.
                        </p>

                        <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">
                                Escribe el ID exacto de este servidor (<code className="text-amber-300">{guildId}</code>) para confirmar:
                            </label>
                            <input
                                type="text"
                                value={confirmGuildInput}
                                onChange={(e) => setConfirmGuildInput(e.target.value)}
                                placeholder={guildId}
                                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm font-mono text-white"
                            />
                        </div>

                        <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={forceNewJournal}
                                onChange={(e) => setForceNewJournal(e.target.checked)}
                            />
                            Ignorar diario previo e iniciar una restauración completamente desde cero
                        </label>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setRestoreModal(null)}
                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={restoring || confirmGuildInput.trim() !== guildId}
                                onClick={handleExecuteRestore}
                                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {restoring ? 'Restaurando servidor...' : 'Confirmar y Restaurar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: INSPECTOR DE OPERACIÓN DE RESTAURACIÓN (STEPS & RESOLVE) */}
            {jobInspector && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="glass-panel max-w-3xl w-full p-6 rounded-3xl border border-white/15 bg-[#0b0b18] space-y-5 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Operación de Restauración #{jobInspector.job._id}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Estado: <strong className="text-cyan-300">{jobInspector.job.status}</strong> · Backup: <code className="font-mono">{jobInspector.job.backup_id}</code>
                                </p>
                            </div>
                            <button type="button" onClick={() => setJobInspector(null)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto space-y-3 pr-1">
                            {jobInspector.steps.map(step => (
                                <div key={step._id || step.key} className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-white">{step.key}</span>
                                            <span className="text-slate-400">[{step.kind}] {step.name}</span>
                                        </div>
                                        {step.error && <div className="text-red-400">Error: {step.error}</div>}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`px-2 py-0.5 rounded font-bold ${step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : step.status === 'uncertain' ? 'bg-amber-500/25 text-amber-200' : step.status === 'failed' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-slate-300'}`}>
                                            {step.status}
                                        </span>
                                        {isOwner && step.status === 'uncertain' && (
                                            <button
                                                type="button"
                                                onClick={() => setResolveStepKey(step.key)}
                                                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold flex items-center gap-1"
                                            >
                                                <Wrench size={12} /> Resolver
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isOwner && resolveStepKey && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                                <div className="text-xs font-bold text-amber-200">
                                    Resolver paso incierto: <code className="font-mono">{resolveStepKey}</code>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="ID del recurso en Discord (requerido si fue creación POST)"
                                        value={resolveResourceId}
                                        onChange={(e) => setResolveResourceId(e.target.value)}
                                        className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white"
                                    />
                                    <button
                                        type="button"
                                        disabled={jobActionBusy}
                                        onClick={() => handleResolveStep(jobInspector.job._id, resolveStepKey, resolveResourceId)}
                                        className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black cursor-pointer"
                                    >
                                        Marcar como Aplicado
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
