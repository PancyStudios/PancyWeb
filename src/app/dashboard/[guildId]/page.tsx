"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
	SquaresFour,
	MusicNotes,
	ArrowLeft,
	List,
	Bell,
	ShieldCheck,
	Crown,
	Users,
	Hash,
	CaretRight
} from 'phosphor-react';

// --- TIPOS ---
interface GuildDetails {
	id: string;
	name: string;
	icon: string | null;
	ownerId: string;
	memberCount: number;
	description: string | null;
	premiumTier: number;
	banner: string | null;
}

interface UserData {
	username: string;
	avatar: string;
}

const API_BASE = "https://api.pancy.miau.media";

export default function ServerDashboardPage() {
	const params = useParams();
	const guildId = params.guildId as string;

	const [guild, setGuild] = useState<GuildDetails | null>(null);
	const [userData, setUserData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const opts: RequestInit = {
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include'
				};

				// 1. Pedimos info del servidor y del usuario en paralelo
				const [guildRes, userRes] = await Promise.all([
					fetch(`${API_BASE}/api/guilds/${guildId}/info`, opts),
					fetch(`${API_BASE}/api/users`, opts)
				]);

				if (guildRes.status === 404) {
					setError("No se encontró el servidor o el bot no tiene acceso.");
					return;
				}

				if (!guildRes.ok) throw new Error("Error al cargar datos del servidor");

				setGuild(await guildRes.json());
				if (userRes.ok) setUserData(await userRes.json());

			} catch (err) {
				console.error(err);
				setError("Ocurrió un error al conectar con el servidor.");
			} finally {
				setLoading(false);
			}
		};

		if (guildId) fetchData();
	}, [guildId]);

	// Helper para Iconos de Discord (Soporta GIF si es animado)
	const getIconUrl = (g: GuildDetails) =>
		g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith('a_') ? 'gif' : 'webp'}?size=256` : null;

	const getBannerUrl = (g: GuildDetails) =>
		g.banner ? `https://cdn.discordapp.com/banners/${g.id}/${g.banner}.webp?size=1024` : null;

	// --- RENDERIZADO DE CARGA / ERROR ---

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#030014] text-slate-400 font-sans relative overflow-hidden">
				<div className="absolute inset-0 stars-bg opacity-40"></div>
				<div className="flex flex-col items-center gap-4 relative z-10">
					<div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_30px_rgba(34,211,238,0.2)]"></div>
					<p className="animate-pulse font-bold tracking-widest text-cyan-400">SINTONIZANDO SEÑAL...</p>
				</div>
			</div>
		);
	}

	if (error || !guild) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#030014] text-white font-sans relative">
				<div className="absolute inset-0 stars-bg opacity-40"></div>
				<div className="glass-panel p-10 rounded-3xl text-center space-y-6 max-w-md mx-4 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
					<div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
						<ShieldCheck size={40} weight="duotone" />
					</div>
					<h1 className="text-3xl font-bold text-white">Error de Conexión</h1>
					<p className="text-slate-400">{error || "Servidor no encontrado"}</p>
					<Link href="/dashboard">
						<button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all w-full font-bold border border-white/5">
							Volver al Dashboard
						</button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen font-sans overflow-hidden relative bg-[#030014]">

			{/* --- FONDO ANIMADO --- */}
			<div className="fixed inset-0 z-[-1]">
				<div className="absolute inset-0 stars-bg opacity-40"></div>
				<div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] nebula blur-[100px]"></div>
				<div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px]"></div>
			</div>

			{/* --- SIDEBAR (Igual al dashboard principal) --- */}
			<aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
				<div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
					<div className="relative w-8 h-8 float">
						<div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-50"></div>
						<img src="/logo.png" alt="Logo" className="relative w-full h-full object-contain drop-shadow-lg" />
					</div>
					<span className="font-bold text-white text-xl tracking-wide gradient-text">PancyBot</span>
				</div>

				<nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
					{/* Info del Servidor Actual en el Sidebar */}
					<div className="px-4 mb-6">
						<div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
							{getIconUrl(guild) ? (
								<img src={getIconUrl(guild)!} className="w-10 h-10 rounded-full" />
							) : (
								<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">{guild.name.charAt(0)}</div>
							)}
							<div className="overflow-hidden">
								<div className="text-xs text-cyan-400 font-bold uppercase">Gestionando</div>
								<div className="text-sm text-white font-bold truncate">{guild.name}</div>
							</div>
						</div>
					</div>

					<div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">General</div>
					<Link href={`/dashboard/${guildId}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 border-l-2 border-cyan-400">
						<SquaresFour size={20} weight="fill" />
						<span className="font-medium">Vista General</span>
					</Link>

					<div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Módulos</div>
					<Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
						<MusicNotes size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
						<span>Música Hi-Fi</span>
					</Link>
					<Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
						<ShieldCheck size={20} className="text-green-400 group-hover:scale-110 transition-transform" />
						<span>Moderación</span>
					</Link>
				</nav>

				<div className="p-4 border-t border-white/5 bg-black/20">
					<Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-4 py-3 rounded-lg hover:bg-white/5">
						<ArrowLeft size={18} />
						Volver a la lista
					</Link>
				</div>
			</aside>

			{/* Overlay Móvil */}
			{sidebarOpen && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
			)}

			{/* --- CONTENIDO PRINCIPAL --- */}
			<main className="flex-1 flex flex-col relative z-10 overflow-hidden">

				{/* HEADER */}
				<header className="h-20 glass-header flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
					<div className="flex items-center gap-4">
						<button onClick={() => setSidebarOpen(true)} className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg">
							<List size={24} />
						</button>

						<div className="hidden md:block">
							<div className="flex items-center gap-2 text-sm text-slate-400">
								<Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
								<CaretRight size={12} />
								<span className="text-white font-bold">{guild.name}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-6">
						<button className="relative text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
							<Bell size={22} />
							<span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a15]"></span>
						</button>

						<div className="flex items-center gap-3 pl-6 border-l border-white/10 h-8">
							<div className="text-right hidden sm:block leading-tight">
								<div className="text-sm font-bold text-white">{userData?.username || 'Usuario'}</div>
								<div className="text-[10px] text-cyan-400 font-medium tracking-wide">CONECTADO</div>
							</div>
							<div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-cyan-500 to-purple-600 overflow-hidden shadow-lg">
								<img
									src={`${API_BASE}/api/users/avatar`}
									className="w-full h-full rounded-full object-cover bg-black"
									alt="Avatar"
									onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
								/>
							</div>
						</div>
					</div>
				</header>

				{/* CONTENIDO SCROLLABLE */}
				<div className="flex-1 overflow-y-auto scroll-smooth">

					{/* --- HERO SECTION DEL SERVIDOR --- */}
					<div className="relative w-full h-64 md:h-80">
						{/* Banner de Fondo */}
						<div className="absolute inset-0 w-full h-full overflow-hidden">
							{getBannerUrl(guild) ? (
								<img src={getBannerUrl(guild)!} className="w-full h-full object-cover opacity-50 blur-sm" />
							) : (
								<div className="w-full h-full bg-gradient-to-b from-indigo-900/40 via-[#030014]/80 to-[#030014]"></div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/60 to-transparent"></div>
						</div>

						<div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-6 flex items-end gap-6">
							{/* Icono con efecto Glass */}
							<div className="relative group">
								<div className="absolute inset-0 bg-cyan-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
								<div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl glass-panel p-1.5 relative z-10 overflow-hidden">
									{getIconUrl(guild) ? (
										<img src={getIconUrl(guild)!} className="w-full h-full rounded-2xl object-cover" />
									) : (
										<div className="w-full h-full rounded-2xl bg-indigo-600 flex items-center justify-center text-4xl font-bold text-white">
											{guild.name.charAt(0)}
										</div>
									)}
								</div>
								{/* Indicador de Nivel (Opcional) */}
								<div className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-black px-2 py-1 rounded-full shadow-lg z-20">
									LVL {guild.premiumTier}
								</div>
							</div>

							<div className="flex-1 mb-2">
								<h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg mb-2">
									{guild.name}
								</h1>
								<div className="flex flex-wrap items-center gap-3 text-sm font-medium">
									<div className="glass-panel px-3 py-1 rounded-full flex items-center gap-2 text-slate-300">
										<Users size={16} className="text-cyan-400" />
										{guild.memberCount} Miembros
									</div>
									<div className="glass-panel px-3 py-1 rounded-full flex items-center gap-2 text-slate-300">
										<Hash size={16} className="text-purple-400" />
										{guild.id}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* --- GRID DE MÓDULOS --- */}
					<div className="px-6 md:px-10 py-8">
						<h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
							<span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full"></span>
							Módulos & Configuración
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">

							{/* Tarjeta Música */}
							<div className="glass-panel p-6 rounded-2xl relative group cursor-pointer overflow-hidden">
								<div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
									<MusicNotes size={100} />
								</div>
								<div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
									<MusicNotes size={28} weight="fill" />
								</div>
								<h3 className="text-lg font-bold text-white mb-2">Música Hi-Fi</h3>
								<p className="text-sm text-slate-400 mb-4">Gestiona la reproducción, DJ Roles y canales exclusivos de música.</p>
								<button className="btn-cosmic w-full py-2 rounded-lg text-sm font-bold text-white shadow-lg shadow-pink-500/20">
									Configurar
								</button>
							</div>

							{/* Tarjeta Moderación */}
							<div className="glass-panel p-6 rounded-2xl relative group cursor-pointer overflow-hidden">
								<div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
									<ShieldCheck size={100} />
								</div>
								<div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
									<ShieldCheck size={28} weight="fill" />
								</div>
								<h3 className="text-lg font-bold text-white mb-2">Sistema de Seguridad</h3>
								<p className="text-sm text-slate-400 mb-4">Logs de auditoría, Anti-Raid, Auto-Mod y sanciones.</p>
								<button className="px-4 py-2 w-full rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all">
									Configurar
								</button>
							</div>

							{/* Tarjeta Economía (Ejemplo Inactivo) */}
							<div className="glass-panel p-6 rounded-2xl relative group overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
								<div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
									<Crown size={100} />
								</div>
								<div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
									<Crown size={28} weight="fill" />
								</div>
								<h3 className="text-lg font-bold text-white mb-2">Economía Global</h3>
								<p className="text-sm text-slate-400 mb-4">Próximamente: Tienda, niveles y recompensas.</p>
								<span className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold text-slate-400 border border-white/10">
                            En Desarrollo
                         </span>
							</div>

						</div>
					</div>

				</div>
			</main>
		</div>
	);
}