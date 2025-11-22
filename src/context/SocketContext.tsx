"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
const API_URL = "https://api.pancy.miau.media";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	lastLog: any; // Aquí guardaremos el último log recibido globalmente
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

		setSocket(socketInstance);

		// Limpieza al desmontar
		return () => {
			socketInstance.disconnect();
		};
	}, []);

	return (
		<SocketContext.Provider value={{ socket, isConnected, lastLog }}>
			{children}
		</SocketContext.Provider>
	);
};