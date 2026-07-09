"use client";

import { SocketProvider } from '@/context/SocketContext';
import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = "https://api.pancy.miau.media";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const res = await fetch(`${API_BASE}/api/users`, {
					credentials: 'include'
				});
				if (res.status === 401) {
					const currentUrl = window.location.href;
					window.location.href = `${API_BASE}/api/auth/discord?redirect=${encodeURIComponent(currentUrl)}`;
				}
			} catch (err) {
				console.error("Auth check failed:", err);
				// Si falla la petición por CORS o red, asumimos que requiere login
				const currentUrl = window.location.href;
				window.location.href = `${API_BASE}/api/auth/discord?redirect=${encodeURIComponent(currentUrl)}`;
			}
		};
		checkAuth();

		// --- INTERCEPTOR GLOBAL DE FETCH ---
		// Captura errores de red o errores 500/503 (Base de datos desconectada)
		const originalFetch = window.fetch;
		window.fetch = async (...args) => {
			try {
				const response = await originalFetch(...args);
				if (response.status === 500 || response.status === 503) {
					// Mostrar notificación de caída
					toast.error("El dashboard no está disponible debido a que la base de datos está desconectada.", {
						id: "db-offline-toast",
						duration: 5000,
						style: { background: '#1e1b4b', color: '#fff', border: '1px solid #3730a3' }
					});
				}
				return response;
			} catch (error) {
				toast.error("Error de conexión con la API.", {
					id: "api-offline-toast",
					duration: 5000,
					style: { background: '#1e1b4b', color: '#fff', border: '1px solid #3730a3' }
				});
				throw error;
			}
		};

		return () => {
			window.fetch = originalFetch;
		};
	}, []);

	return (
		<SocketProvider>
			{/* Toaster global para todo el dashboard */}
			<Toaster position="bottom-right" />
			{children}
		</SocketProvider>
	);
}