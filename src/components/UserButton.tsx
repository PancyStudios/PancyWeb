"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function UserButton() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await fetch("https://api.pancy.miau.media/api/users/avatar", {
					method: "GET",
					credentials: "include",
				}).catch(() => {});

				if (response?.ok) {
					const data = await response.json();
					setAvatarUrl(data.avatarURL);
					setIsLoggedIn(true);
				} else {
					setIsLoggedIn(false);
				}
			} catch (error) {
				console.error("Error verificando sesión:", error);
				setIsLoggedIn(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();
	}, []);

	const handleLogout = () => {
		// Redirigimos a la ruta de logout que limpia la cookie y nos devuelve al inicio
		window.location.href = "https://api.pancy.miau.media/api/auth/logout?redirect=https://pancybot.miau.media/";
	};

	if (isLoading) {
		// Un pequeño esqueleto de carga mientras verificamos
		return <div className="w-24 h-10 bg-white/5 rounded-lg animate-pulse"></div>;
	}

	if (isLoggedIn && avatarUrl) {
		return (
			<div className="flex items-center gap-4">
				{/* Enlace directo al Dashboard */}
				<Link
					href="/dashboard"
					className="hidden md:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
				>
					Dashboard
				</Link>

				<div className="relative group">
					{/* Avatar del Usuario */}
					<Link href="/dashboard">
						<div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 to-purple-500 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer">
							<div className="w-full h-full rounded-full overflow-hidden bg-black relative">
								{/* Usamos img normal para evitar problemas de cors/optimizacion con dominios externos si no están configurados en next.config.js */}
								<img
									src={avatarUrl}
									alt="User Avatar"
									className="w-full h-full object-cover"
								/>
							</div>
						</div>
					</Link>

					{/* Tooltip de Logout rápido (opcional pero útil) */}
					<div className="absolute right-0 mt-2 w-32 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
						<button
							onClick={handleLogout}
							className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5 hover:text-red-300 rounded-lg transition-colors"
						>
							Cerrar Sesión
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Estado No Logueado (Botón Login normal)
	return (
		<Link
			href="/dashboard"
			className="text-gray-300 hover:text-white text-sm font-bold border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
		>
			Login
		</Link>
	);
}