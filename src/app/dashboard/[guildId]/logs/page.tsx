"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Scroll, Clock, Tag, ArrowsClockwise } from 'phosphor-react';
import { useSocket } from '@/context/SocketContext';

const API_BASE = "https://api.pancy.miau.media";

interface LogEntry {
    _id: string;
    guildId: string;
    type: string;
    content: any;
    timestamp: string;
}

export default function LogsPage() {
    const params = useParams();
    const guildId = typeof params?.guildId === 'string' ? params.guildId : '';
    const { socket, lastLog } = useSocket();

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // 1. Fetch initial history
    useEffect(() => {
        if (!guildId) return;
        fetchLogs();
    }, [guildId]);

    const fetchLogs = () => {
        setLoading(true);
        fetch(`${API_BASE}/api/guilds/${guildId}/logs?limit=50`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading logs:", err);
                setLoading(false);
            });
    };

    // 2. Subscribe to guild room
    useEffect(() => {
        if (!socket || !guildId) return;
        socket.emit('subscribe:guild', guildId);

        return () => {
            socket.emit('unsubscribe:guild', guildId);
        };
    }, [socket, guildId]);

    // 3. Listen for new logs
    useEffect(() => {
        if (lastLog) {
            // Verify if log belongs to this guild (though server should only send relevant ones)
            // The log structure from socket might differ slightly, adapting here
            const newLog = {
                _id: Date.now().toString(), // Temp ID
                guildId: guildId,
                type: lastLog.topic?.split('/').pop() || 'unknown',
                content: lastLog.data,
                timestamp: new Date().toISOString()
            };
            setLogs(prev => [newLog, ...prev]);
        }
    }, [lastLog, guildId]);

    if (loading && logs.length === 0) return <div className="p-10 text-center text-slate-400 animate-pulse">Cargando historial de eventos...</div>;

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 h-[calc(100vh-6rem)] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                        <Scroll size={32} weight="fill" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Registro de Auditoría</h1>
                        <p className="text-slate-400">Historial de eventos en tiempo real.</p>
                    </div>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Recargar historial"
                >
                    <ArrowsClockwise size={20} />
                </button>
            </div>

            {/* Logs List */}
            <div className="flex-1 glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5 bg-black/20 flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="w-32 pl-4">Hora</div>
                    <div className="w-40">Tipo</div>
                    <div className="flex-1">Detalles</div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                            <Scroll size={48} className="mb-4" />
                            <p>No hay registros recientes</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log._id} className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors text-sm group animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="w-32 pl-2 text-slate-400 font-mono text-xs flex items-center gap-2">
                                    <Clock size={14} />
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </div>
                                <div className="w-40">
                                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold text-slate-300 group-hover:text-white group-hover:border-white/20 transition-all inline-flex items-center gap-1">
                                        <Tag size={12} />
                                        {log.type}
                                    </span>
                                </div>
                                <div className="flex-1 text-slate-300 font-mono text-xs truncate">
                                    {typeof log.content === 'object' ? JSON.stringify(log.content) : log.content}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
}
