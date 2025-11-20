"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Hook vital para leer la URL
import { ArrowLeft, Crown, ShieldCheck, Users } from '@phosphor-icons/react';

// --- TIPOS ---
interface GuildDetails {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: number;
	// Agrega aquí más propiedades que devuelva tu API /info
}

// --- CONFIGURACIÓN ---
const API_BASE = "https://api.pancy.miau.media";

export default function ServerDashboardPage() {
	// 1. Obtenemos el ID de la URL (ej: dashboard/123 -> guildId = "123")
	const params = useParams();
	const guildId = params.guildId as string;

	const [guild, setGuild] = useState<GuildDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchGuildData = async () => {
			try {
				const opts: RequestInit = {
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include'
				};

				// Llamamos a tu endpoint específico de info del servidor
				const res = await fetch(`${API_BASE}/api/guilds/${guildId}/info`, opts);

				if (res.status === 404) {
					setError("No se encontró el servidor o el bot no está en él.");
					return;
				}

				if (!res.ok) throw new Error("Error al cargar datos");

				const data = await res.json();
				setGuild(data);

			} catch (err) {
				console.error(err);
				setError("Ocurrió un error al conectar con el servidor.");
			} finally {
				setLoading(false);
			}
		};

		if (guildId) {
			fetchGuildData();
		}
	}, [guildId]);

	const getIconUrl = (g: GuildDetails) =>
		g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp?size=256` : null;

	// --- RENDERIZADO ---

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#030014] text-slate-400">
				<div className="flex flex-col items-center gap-4">
					<div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
					<p className="animate-pulse">Conectando con el servidor...</p>
				</div>
			</div>
		);
	}

	if (error || !guild) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#030014] text-white">
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-bold text-red-500">¡Ups!</h1>
					<p className="text-slate-400">{error || "Servidor no encontrado"}</p>
					<Link href="/dashboard">
						<button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mt-4">
							Volver al Dashboard
						</button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#030014] font-sans text-slate-300 relative overflow-x-hidden">
			{/* Fondo simple */}
			<div className="fixed inset-0 z-[-1] stars-bg opacity-30"></div>

			{/* HEADER DEL SERVIDOR */}
			<header className="h-64 relative flex items-end pb-8 px-6 md:px-12 border-b border-white/10 bg-gradient-to-b from-indigo-900/20 to-[#030014]">
				{/* Banner Background (Podrías obtenerlo de la API si Discord te lo da) */}
				<div className="absolute inset-0 z-[-1] bg-indigo-600/5"></div>

				<div className="w-full max-w-7xl mx-auto flex items-end gap-6">
					{/* Icono Grande */}
					<div className="relative group">
						<div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-[#030014] p-1.5 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10">
							{getIconUrl(guild) ? (
								<img src={getIconUrl(guild)!} className="w-full h-full rounded-2xl object-cover" />
							) : (
								<div className="w-full h-full rounded-2xl bg-indigo-600 flex items-center justify-center text-5xl font-bold text-white">
									{guild.name.charAt(0)}
								</div>
							)}
						</div>
						{/* Indicador Online (Decorativo) */}
						<div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#030014] rounded-full"></div>
					</div>

					<div className="flex-1 mb-2">
						<h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
							{guild.name}
						</h1>
						<div className="flex items-center gap-4 mt-2 text-sm font-medium">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-cyan-400"/>
                        PancyBot Conectado
                    </span>
							{guild.owner && (
								<span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-2">
                            <Crown size={16} weight="fill"/>
                            Propietario
                        </span>
							)}
						</div>
					</div>

					<Link href="/dashboard">
						<button className="mb-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 text-white">
							<ArrowLeft weight="bold" />
							Volver
						</button>
					</Link>
				</div>
			</header>

			{/* CONTENIDO / MODULOS */}
			<main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
				<h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
					<span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
					Módulos Disponibles
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

					{/* Card Módulo 1 */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer hover:bg-white/[0.07]">
						<div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
							{/* Icono Música */}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-7 h-7 fill-current"><path d="M216,40v128a48,48,0,1,1-48-48,47.8,47.8,0,0,1,15.5,2.6V40a8,8,0,0,1,16,0Z"></path></svg>
						</div>
						<h3 className="text-lg font-bold text-white mb-2">Música Hi-Fi</h3>
						<p className="text-sm text-slate-400">Controla la reproducción, crea playlists y configura el DJ role.</p>
					</div>

					{/* Card Módulo 2 */}
					<div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer hover:bg-white/[0.07]">
						<div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
							<ShieldCheck size={32} weight="duotone" />
						</div>
						<h3 className="text-lg font-bold text-white mb-2">Moderación</h3>
						<p className="text-sm text-slate-400">Logs automáticos, protección anti-raid y comandos de sanción.</p>
					</div>

				</div>
			</main>
		</div>
	);
}