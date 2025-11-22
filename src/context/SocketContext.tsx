"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
const API_URL = "https://api.pancy.miau.media";

interface MusicTrack {
	title: string;
	artist: string;
	duration: number;
	thumbnail: string;
	url: string;
}

interface MusicState {
	isPlaying: boolean;
	isPaused: boolean;
	currentTrack: MusicTrack | null;
	progress: number; // Current position in seconds
	volume: number;
	queue: Array<{
		title: string;
		artist: string;
		duration: number;
	}>;
	guildId: string;
	lastUpdate: number;
}

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	lastLog: any; // Aquí guardaremos el último log recibido globalmente
	musicState: MusicState | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket debe usarse dentro de un SocketProvider");
	}
	return context;
};

interface SocketProviderProps {
	children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [lastLog, setLastLog] = useState<any>(null);
	const [musicState, setMusicState] = useState<MusicState | null>(null);

	useEffect(() => {
		// Creamos la conexión
		// 'withCredentials: true' es VITAL para que envíe la cookie 'connect.sid'
		const socketInstance = io(API_URL, {
			withCredentials: true,
			autoConnect: true,
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: 5,
			transports: ['websocket', 'polling'],
		});


		socketInstance.on('connect', () => {
			console.log('🟢 [Socket] Conectado:', socketInstance.id);
			setIsConnected(true);

			// Pequeño delay para asegurar que la conexión está estable antes de emitir eventos
			setTimeout(() => {
				socketInstance.emit('ready');
			}, 100);
		});

		socketInstance.on('disconnect', (reason) => {
			console.log('🔴 [Socket] Desconectado:', reason);
			setIsConnected(false);
		});

		socketInstance.on('ready:ack', (data) => {
			console.log('✅ [Socket] Servidor listo:', data.message);
		});

		socketInstance.on('connect_error', (err) => {
			console.error('⛔ [Socket] Error de Conexión:');
			console.error(err);
		});

		socketInstance.on('error', (err) => {
			console.error('❌ [Socket] Error:', err);
		});

		socketInstance.on('server:health', (data) => {
			console.debug('❤ [Socket] Heartbeat:', data);
		});

		socketInstance.on('log:new', (logData) => {
			setLastLog(logData);
		});

		socketInstance.on('music:update', (payload) => {
			console.log('🎵 [Socket] Music Update:', payload.eventType, payload.data);
			setMusicState(prev => mergeMusicState(prev, payload.data));
		});

		// Helper to merge incoming partial music state with existing state
		function mergeMusicState(prev: MusicState | null, incoming: Partial<MusicState>): MusicState {
			const base: MusicState = prev ?? {
				isPlaying: false,
				isPaused: false,
				currentTrack: null,
				progress: 0,
				volume: 100,
				queue: [],
				guildId: '',
				lastUpdate: Date.now(),
			};
			const result: MusicState = { ...base };
			(Object.entries(incoming) as [keyof MusicState, any][]).forEach(([key, value]) => {
				if (value !== undefined) {
					if (key === 'currentTrack' && typeof value === 'object' && value !== null) {
						// Deep merge track fields, preserving existing ones when not provided
						const prevTrack = result.currentTrack ?? {};
						const mergedTrack: any = { ...prevTrack };
						Object.entries(value).forEach(([k, v]) => {
							if (v !== undefined) {
								mergedTrack[k] = v;
							}
						});
						result.currentTrack = mergedTrack as any;
					} else if (key === 'currentTrack' && value === null) {
						// Preserve existing track when server sends null
						// do nothing
					} else {
						(result as any)[key] = value;
					}
				}
			});
			result.lastUpdate = Date.now();
			return result;
		}
		setSocket(socketInstance);

		// Limpieza al desmontar
		return () => {
			socketInstance.disconnect();
		};
	}, []);

	return (
		<SocketContext.Provider value={{ socket, isConnected, lastLog, musicState }}>
			{children}
		</SocketContext.Provider>
	);
};