"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MusicNotes, Faders, SpeakerHigh, Disc, SkipForward, Pause, Play, Queue, FloppyDisk } from 'phosphor-react';
import { useSocket } from '@/context/SocketContext';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = "https://api.pancy.miau.media";

interface MusicSettings {
    guildId: string;
    djRole: string | null;
    defaultVolume: number;
    stayInVc: boolean;
    channelId: string | null;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MusicPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

    const { socket, isConnected, musicState } = useSocket();

    const [settings, setSettings] = useState<MusicSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Local progress for smooth animation
    const [localProgress, setLocalProgress] = useState(0);

    // Action loading state (e.g. 'play', 'pause', 'skip', 'skip:3')
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Helper to POST an action to the API and handle loading state
    const postAction = async (endpoint: string, body?: Record<string, unknown>) => {
        if (!guildId) {
            toast.error('ID de servidor no disponible');
            return null;
        }
        setActionLoading(endpoint);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await res.json().catch(() => ({ ok: false, message: 'Error al parsear respuesta' }));

            if (!res.ok || !data.ok) {
                toast.error(data.message || data.error || 'Error al ejecutar la acción');
                return null;
            }

            toast.success(data.message || 'Acción ejecutada correctamente');
            return data;
        } catch (err) {
            console.error('Action error', err);
            toast.error('Error de conexión con el servidor');
            return null;
        } finally {
            setActionLoading(null);
        }
    };

    const handlePlay = async () => {
        // Optimistic UI: actualizamos el estado local inmediatamente
        if (musicState) {
            musicState.isPaused = false;
        }
        const result = await postAction(`/api/guilds/${guildId}/music/play`);
        // Si falla, el socket actualizará el estado real
        if (!result && musicState) {
            // Revertir en caso de error
            musicState.isPaused = true;
        }
    };

    const handlePause = async () => {
        // Optimistic UI
        if (musicState) {
            musicState.isPaused = true;
        }
        const result = await postAction(`/api/guilds/${guildId}/music/pause`);
        if (!result && musicState) {
            musicState.isPaused = false;
        }
    };

    const handleSkipNext = async () => {
        await postAction(`/api/guilds/${guildId}/music/skip`, { direction: 'next' });
        // El socket actualizará automáticamente con la nueva canción
    };

    const handleSkipPrevious = async () => {
        await postAction(`/api/guilds/${guildId}/music/skip`, { direction: 'previous' });
    };

    const handleSkipToIndex = async (index: number) => {
        await postAction(`/api/guilds/${guildId}/music/skip/${index}`);
    };

    // Load settings
    useEffect(() => {
        if (!guildId) return;
        fetch(`${API_BASE}/api/guilds/${guildId}/music`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading music settings:", err);
                setLoading(false);
            });
    }, [guildId]);

    // Subscribe to guild music updates
    useEffect(() => {
        if (socket && guildId && isConnected) {
            socket.emit('subscribe:guild', guildId);
            console.log('🎵 Subscribed to guild music updates:', guildId);
        }
    }, [socket, guildId, isConnected]);

    // Sync local progress with music state
    useEffect(() => {
        if (musicState?.progress !== undefined) {
            setLocalProgress(musicState.progress);
        }
    }, [musicState?.progress]);

    // Update local progress every second when playing
    useEffect(() => {
        if (musicState?.isPlaying && musicState?.currentTrack) {
            const interval = setInterval(() => {
                if (!musicState?.isPaused) {
                    setLocalProgress(prev => {
                        const newProgress = prev + 1;
                        // Don't exceed track duration
                        return newProgress <= musicState.currentTrack!.duration ? newProgress : prev;
                    });
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [musicState?.isPlaying, musicState?.isPaused, musicState?.currentTrack]);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/guilds/${guildId}/music`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                toast.success('Configuración guardada correctamente');
            } else {
                toast.error('Error al guardar la configuración');
            }
        } catch (err) {
            console.error("Error saving settings:", err);
            toast.error('Error de conexión al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Cargando sistema de música...</div>;

    const currentTrack = musicState?.currentTrack;
    const isPlaying = musicState?.isPlaying && !musicState?.isPaused;
    const progress = localProgress || 0;
    const duration = currentTrack?.duration || 0;
    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#ec4899',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 shadow-lg shadow-pink-500/10">
                        <MusicNotes size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Sistema de Música</h1>
                        <p className="text-slate-400">Gestiona la reproducción y configuración de audio.</p>
                    </div>
                </div>
                <Link href={`/dashboard/${guildId}`} className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all">
                    <span className="font-bold">Volver al Panel</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Player */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5"></div>

                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            {/* Album Art */}
                            <div className="w-48 h-48 rounded-2xl bg-black/40 shadow-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                {currentTrack?.thumbnail ? (
                                    <img
                                        src={currentTrack.thumbnail}
                                        alt={currentTrack.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <>
                                        <div className={`absolute inset-0 bg-gradient-to-tr from-pink-500 to-purple-600 opacity-20 ${isPlaying ? 'animate-pulse' : ''}`}></div>
                                        <Disc size={64} className={`text-white/20 ${isPlaying ? 'animate-spin-slow' : ''}`} weight="duotone" />
                                    </>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-pink-400 tracking-wider uppercase">
                                        {isPlaying ? 'Reproduciendo ahora' : musicState?.isPaused ? 'En pausa' : 'Esperando'}
                                    </span>
                                    <h3 className="text-2xl font-bold text-white truncate">
                                        {currentTrack?.title || 'Nothing Playing'}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        {currentTrack?.artist || 'Unirse a un canal de voz para comenzar'}
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full mt-6 mb-2">
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full relative transition-all duration-300"
                                            style={{ width: `${progressPercent}%` }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>{formatTime(progress)}</span>
                                        <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
                                    <button
                                        onClick={handleSkipPrevious}
                                        className="p-3 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={!currentTrack || !!actionLoading}
                                    >
                                        <SkipForward size={24} weight="fill" className="rotate-180" />
                                    </button>
                                    <button
                                        onClick={isPlaying ? handlePause : handlePlay}
                                        className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={!currentTrack || !!actionLoading}
                                    >
                                        {actionLoading === `/api/guilds/${guildId}/music/play` || actionLoading === 'play' || actionLoading === 'pause' ? (
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                        ) : (
                                            isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" className="ml-1" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSkipNext}
                                        className="p-3 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        disabled={!currentTrack || !!actionLoading}
                                    >
                                        <SkipForward size={24} weight="fill" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Queue */}
                    {musicState?.queue && musicState.queue.length > 0 && (
                        <div className="glass-panel p-6 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                                <Queue size={20} className="text-pink-400" />
                                <h3 className="font-bold text-white">Cola ({musicState.queue.length})</h3>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {musicState.queue.map((track, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleSkipToIndex(idx)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <span className="text-slate-500 text-sm font-bold w-6">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-white truncate">{track.title}</div>
                                            <div className="text-xs text-slate-400 truncate">{track.artist}</div>
                                        </div>
                                        <span className="text-xs text-slate-500">{formatTime(track.duration)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Settings */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                            <Faders size={20} className="text-pink-400" />
                            <h3 className="font-bold text-white">Configuración</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Default Volume */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Volumen por defecto</label>
                                <div className="flex items-center gap-4">
                                    <SpeakerHigh size={20} className="text-slate-500" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={settings?.defaultVolume || 100}
                                        onChange={(e) => setSettings(prev => prev ? ({ ...prev, defaultVolume: parseInt(e.target.value) }) : null)}
                                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                    />
                                    <span className="text-sm font-bold text-white w-10 text-right">{settings?.defaultVolume}%</span>
                                </div>
                            </div>

                            {/* 24/7 Mode */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <div>
                                    <div className="text-sm font-bold text-white">Modo 24/7</div>
                                    <div className="text-xs text-slate-400">Mantener en canal de voz</div>
                                </div>
                                <button
                                    onClick={() => setSettings(prev => prev ? ({ ...prev, stayInVc: !prev.stayInVc }) : null)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings?.stayInVc ? 'bg-pink-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings?.stayInVc ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {/* DJ Role */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Rol de DJ</label>
                                <input
                                    type="text"
                                    value={settings?.djRole || ''}
                                    onChange={(e) => setSettings(prev => prev ? ({ ...prev, djRole: e.target.value }) : null)}
                                    placeholder="ID del Rol o Nombre"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <FloppyDisk size={18} weight="bold" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className="glass-panel p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-slate-400">
                                {isConnected ? 'Conectado en tiempo real' : 'Desconectado'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
