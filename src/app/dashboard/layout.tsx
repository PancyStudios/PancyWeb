"use client";

import { SocketProvider } from '@/context/SocketContext';
import React, { useEffect } from 'react';

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
	}, []);

	return (
		<SocketProvider>
			{children}
		</SocketProvider>
	);
}