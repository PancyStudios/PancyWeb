'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	SquaresFour,
	MusicNotes,
	ArrowLeft,
	List,
	CaretDown,
	Bell,
	ShieldCheck,
	Coins
} from '@phosphor-icons/react';
import {redirect} from "next/navigation";

// --- TIPOS ---
interface DiscordGuild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: number;
	permissions_new?: string;
}

interface UserPremium {
	_id: string | null;
	User: string;
	Permanent: boolean | null;
	Expira: number | null;
	isActive?: boolean; // Propiedad opcional según tu backend
}

// --- CONFIGURACIÓN ---
// Ajusta esto si tu API está en otro subdominio o puerto en desarrollo
const API_BASE = "https://api.pancy.miau.media";

export default function DashboardPage() {
	// Estados
	const [managedGuilds, setManagedGuilds] = useState<DiscordGuild[]>([]);
	const [invitableGuilds, setInvitableGuilds] = useState<DiscordGuild[]>([]);
	const [userPremium, setUserPremium] = useState<UserPremium | null>(null); // Estado para Premium
	const [userData, setUserData] = useState<any>(null); // Para el avatar y nombre
	const [loading, setLoading] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(false); // Para móvil

	useEffect(() => {
		const fetchData = async () => {
			try {
				const opts: RequestInit = {
					headers: {'Content-Type': 'application/json'},
					credentials: 'include',
					method: 'GET'
				};

				const [userRes, premiumRes] = await Promise.all([
					fetch(`${API_BASE}/api/users`, opts),
					fetch(`${API_BASE}/api/users/premium`, opts)
				]);

				if (userRes.status === 401 || premiumRes.status === 401) {
					const currentUrl = window.location.href;
					window.location.href = `${API_BASE}/api/auth/discord?redirect=${encodeURIComponent(currentUrl)}`;
					return;
				}

				if (userRes.ok) setUserData(await userRes.json());
				if (premiumRes.ok) setUserPremium(await premiumRes.json());

				const managedRes = await fetch(`${API_BASE}/api/guilds`, opts);

				if (managedRes.status === 401) return; // Doble check por seguridad
				if (managedRes.ok) setManagedGuilds(await managedRes.json());

				const invitableRes = await fetch(`${API_BASE}/api/guilds/notfound`, opts);

				if (invitableRes.ok) setInvitableGuilds(await invitableRes.json());

				setLoading(false);
			} catch (err) {
				console.error(err);
			}
		};
		fetchData();
	}, []);

	// Helper para Iconos de Discord
	const getIconUrl = (guild: DiscordGuild) => {
		if (guild.icon) return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`;
		return null;
	};

	const isPremium = userPremium?.isActive || userPremium?.Permanent;

	return (
		<div className="flex h-screen font-sans overflow-hidden relative">

			{/* --- FONDO ANIMADO (Usando tus clases globales) --- */}
			<div className="fixed inset-0 z-[-1]">
				<div className="absolute inset-0 stars-bg opacity-40"></div>
				{/* Nebulosas decorativas */}
				<div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] nebula blur-[100px]"></div>
				<div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px]"></div>
			</div>

			{/* --- SIDEBAR --- */}
			<aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
				<div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
					<div className="relative w-8 h-8 float"> {/* Animación float */}
						<div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-50"></div>
						<img src="/logo.png" alt="PancyBot" className="relative w-full h-full object-contain drop-shadow-lg" />
					</div>
					<span className="font-bold text-white text-xl tracking-wide gradient-text">PancyBot</span>
				</div>

				<nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
					<div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">General</div>

					<Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-cyan-300 border border-white/5 shadow-lg shadow-cyan-500/10 transition-all">
						<SquaresFour size={20} weight="fill" />
						<span className="font-medium">Vista General</span>
					</Link>
				</nav>

				<div className="p-4 border-t border-white/5 bg-black/20">
					<Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-4 py-3 rounded-lg hover:bg-white/5">
						<ArrowLeft size={18} />
						Volver al Inicio
					</Link>
				</div>
			</aside>

			{/* Overlay para cerrar sidebar en móvil */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
					onClick={() => setSidebarOpen(false)}
				></div>
			)}

			{/* --- CONTENIDO PRINCIPAL --- */}
			<main className="flex-1 flex flex-col relative z-10 overflow-hidden">

				{/* HEADER */}
				<header className="h-20 glass-header flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSidebarOpen(true)}
							className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
						>
							<List size={24} />
						</button>

						{/* Breadcrumb / Selector Falso */}
						<div className="hidden md:block">
							<div className="flex items-center gap-2 text-sm text-slate-400">
								<span className="text-cyan-400">Dashboard</span>
								<span>/</span>
								<span className="text-white">Selección de Servidor</span>
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
								<div className="text-sm font-bold text-white">
									{userData?.username || 'Usuario'}
								</div>
								<div>{/* --- BADGE PREMIUM DINÁMICO --- */}
									{isPremium ? (
										<div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 font-black tracking-wide drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
											✨ PREMIUM
										</div>
									) : (
										<div className="text-[10px] text-slate-500 font-bold tracking-wide">
											GRATIS
										</div>
									)}
								</div>
							</div>
							<div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-cyan-500 to-purple-600 overflow-hidden shadow-lg shadow-purple-500/20">
								{/* Usamos el endpoint de avatar que creaste en el backend */}
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
				<div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">

					<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
						<div>
							<h1 className="text-3xl font-bold text-white mb-1">
								Mis <span className="gradient-text">Servidores</span>
							</h1>
							<p className="text-slate-400 text-sm md:text-base max-w-2xl">
								Selecciona un servidor para configurar los módulos de PancyBot o invita el bot a tus nuevos servidores.
							</p>
						</div>
					</div>

					{loading ? (
						<div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-pulse gap-4">
							<div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
							<p>Sincronizando con Discord...</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10 pb-10">

							{/* --- GESTIONAR (Bot ya está) --- */}
							{managedGuilds.map((guild) => (
								<Link href={`/dashboard/${guild.id}`} key={guild.id}>
									<div className="glass-panel p-5 rounded-2xl relative group cursor-pointer h-full flex flex-col">
										{/* Efecto Hover Fondo */}
										<div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

										<div className="flex items-center gap-4 mb-4 relative z-10">
											{getIconUrl(guild) ? (
												<img
													src={getIconUrl(guild)!}
													alt={guild.name}
													className="w-14 h-14 rounded-2xl object-cover shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300 group-hover:scale-105"
												/>
											) : (
												<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xl shadow-inner">
													{guild.name.charAt(0)}
												</div>
											)}
											<div className="overflow-hidden flex-1">
												<h3 className="font-bold text-white text-lg truncate group-hover:text-cyan-300 transition-colors">{guild.name}</h3>
												<p className="text-xs text-slate-500 font-mono">ID: {guild.id}</p>
											</div>
										</div>

										<div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                              <span className="text-[10px] font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded-md uppercase tracking-wide border border-green-500/20">
                                Activo
                              </span>
											<span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                Gestionar <ArrowLeft size={14} className="rotate-180" />
                              </span>
										</div>
									</div>
								</Link>
							))}

							{/* --- INVITAR (Bot falta) --- */}
							{invitableGuilds.map((guild) => (
								<div key={guild.id} className="glass-panel p-5 rounded-2xl relative group h-full flex flex-col opacity-70 hover:opacity-100 transition-all hover:border-slate-600">
									<div className="flex items-center gap-4 mb-4 relative z-10">
										{getIconUrl(guild) ? (
											<img
												src={getIconUrl(guild)!}
												alt={guild.name}
												className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
											/>
										) : (
											<div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl">
												{guild.name.charAt(0)}
											</div>
										)}
										<div className="overflow-hidden flex-1">
											<h3 className="font-bold text-slate-300 text-lg truncate group-hover:text-white transition-colors">{guild.name}</h3>
											<p className="text-xs text-slate-600 font-mono">Sin configurar</p>
										</div>
									</div>

									<div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
										{/* Botón usando tu clase 'btn-cosmic' */}
										<a
											href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=8&scope=bot&guild_id=${guild.id}&response_type=code&redirect_uri=${encodeURIComponent(API_BASE + '/api/auth/discord/callback')}`}
											target="_blank"
											rel="noreferrer"
											className="w-full"
										>
											<button className="btn-cosmic w-full py-2 rounded-lg text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-transform hover:scale-[1.02] active:scale-95">
												Configurar Bot
											</button>
										</a>
									</div>
								</div>
							))}

						</div>
					)}
				</div>
			</main>
		</div>
	);
}