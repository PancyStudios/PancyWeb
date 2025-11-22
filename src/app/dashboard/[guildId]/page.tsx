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
	Users,
	Hash,
	CaretRight,
	CaretDown,
	Check,
	SignOut,
	Activity,
	Scroll,
	Faders,
	Eye,
	Wrench,
	Planet,
	Copy,
	Gauge
} from 'phosphor-react';

// --- TIPOS ---
interface Channel {
	id: string;
	name: string;
	type: number;
}

interface GuildDetails {
	id: string;
	name: string;
	icon: string | null;
	ownerId: string;
	memberCount: number;
	description: string | null;
	premiumTier: number;
	banner: string | null;
	channels?: Channel[];
}

interface GuildSimple {
	id: string;
	name: string;
	icon: string | null;
}

interface UserData {
	username: string;
	avatar: string;
	id: string;
}

interface AvatarResponse {
	avatarURL: string;
}

interface UserPremium {
	_id: string | null;
	User: string;
	Permanent: boolean | null;
	Expira: number | null;
	isActive?: boolean;
}

// --- CONFIGURACIÓN ---
const API_BASE = "https://api.pancy.miau.media";

export default function ServerDashboardPage() {
	// Obtenemos el ID real de la URL /dashboard/[guildId]
	const params = useParams();
	// Aseguramos que sea string por si acaso
	const guildId = typeof params?.guildId === 'string' ? params.guildId : '';

	// --- ESTADOS ---
	const [guild, setGuild] = useState<GuildDetails | null>(null);
	const [serverList, setServerList] = useState<GuildSimple[]>([]);
	const [userData, setUserData] = useState<UserData | null>(null);
	const [userPremium, setUserPremium] = useState<UserPremium | null>(null);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	// UI States
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isSelectorOpen, setIsSelectorOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [ping, setPing] = useState(24); // Ping visual inicial (puedes conectarlo a tu API si tienes endpoint)

	// --- DATA FETCHING REAL ---
	useEffect(() => {
		if (!guildId) return;

		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const opts: RequestInit = {
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include', // Importante para enviar cookies de sesión
					method: 'GET',
				};

				// Peticiones en paralelo para optimizar carga
				const [guildRes, userRes, listRes, premiumRes, avatarRes] = await Promise.all([
					fetch(`${API_BASE}/api/guilds/${guildId}/info`, opts),
					fetch(`${API_BASE}/api/users`, opts),
					fetch(`${API_BASE}/api/guilds`, opts),
					fetch(`${API_BASE}/api/users/premium`, opts),
					fetch(`${API_BASE}/api/users/avatar`, opts)
				]);

				// Manejo de errores específicos
				if (guildRes.status === 404) {
					setError("No se encontró el servidor o el bot no tiene acceso.");
					setLoading(false);
					return;
				}

				if (guildRes.status === 401 || guildRes.status === 403) {
					setError("No tienes permisos para ver este servidor.");
					setLoading(false);
					return;
				}

				if (!guildRes.ok) throw new Error("Error al cargar datos del servidor");

				// Asignación de datos
				const guildData = await guildRes.json();
				setGuild(guildData);

				if (userRes.ok) setUserData(await userRes.json());
				if (listRes.ok) setServerList(await listRes.json());
				if (premiumRes.ok) setUserPremium(await premiumRes.json());

				if (avatarRes.ok) {
					const avData: AvatarResponse = await avatarRes.json();
					setAvatarUrl(avData.avatarURL);
				}

				const apiInt = Date.now()
				const apiRes = await fetch(`${API_BASE}`)
				const apiLat = Date.now() - apiInt
				setPing(apiLat)

			} catch (err) {
				console.error("Dashboard Error:", err);
				setError("Ocurrió un error al conectar con los servicios de Pancy.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [guildId]);

	useEffect(() => {
		const interval = setInterval(async () => {
			const apiInt = Date.now()
			const apiRes = await fetch(`${API_BASE}`)
			const apiLat = Date.now() - apiInt
			setPing(apiLat)
		}, 30000);
		return () => clearInterval(interval);
	}, []);

	// --- HELPERS ---
	const getIconUrl = (g: GuildDetails | GuildSimple, size = 256) =>
		g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith('a_') ? 'gif' : 'webp'}?size=${size}` : null;

	const getBannerUrl = (g: GuildDetails) =>
		g.banner ? `https://cdn.discordapp.com/banners/${g.id}/${g.banner}.webp?size=1024` : null;

	const isPremium = userPremium?.isActive || userPremium?.Permanent;

	const copyToClipboard = (text: string) => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text);
			// Aquí podrías añadir un toast notification (ej: sonner o react-hot-toast)
		}
	};

	// --- RENDER: LOADING ---
	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#030014] text-slate-400 font-sans relative overflow-hidden">
				{/* Estilos globales necesarios solo durante loading si CSS global tarda */}
				<style jsx global>{`
                    .stars-bg {
                        background-image: radial-gradient(1px 1px at 10% 10%, white 1px, transparent 0), radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.7) 1px, transparent 0), radial-gradient(2px 2px at 40% 70%, white 1px, transparent 0), radial-gradient(1px 1px at 60% 40%, rgba(192, 132, 252, 0.5) 1px, transparent 0), radial-gradient(2px 2px at 80% 10%, white 1px, transparent 0), radial-gradient(1px 1px at 90% 80%, rgba(34, 211, 238, 0.5) 1px, transparent 0);
                        background-size: 550px 550px;
                        animation: starsMove 100s linear infinite;
                    }
                    @keyframes starsMove { from { background-position: 0 0; } to { background-position: 0 1000px; } }
                `}</style>
				<div className="absolute inset-0 stars-bg opacity-40"></div>
				<div className="flex flex-col items-center gap-4 relative z-10">
					<div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_30px_rgba(34,211,238,0.2)]"></div>
					<p className="animate-pulse font-bold tracking-widest text-cyan-400">SINTONIZANDO SEÑAL...</p>
				</div>
			</div>
		);
	}

	// --- RENDER: ERROR ---
	if (error || !guild) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#030014] text-white font-sans relative">
				<div className="glass-panel p-10 rounded-3xl text-center space-y-6 max-w-md mx-4 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
					<div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
						<ShieldCheck size={40} weight="duotone" />
					</div>
					<h1 className="text-3xl font-bold text-white">Error de Conexión</h1>
					<p className="text-slate-400">{error || "Servidor no encontrado"}</p>
					<Link href="/dashboard">
						<button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all w-full font-bold border border-white/5 cursor-pointer">
							Volver al Dashboard
						</button>
					</Link>
				</div>
			</div>
		);
	}

	// --- RENDER: DASHBOARD PRINCIPAL ---
	return (
		<div className="flex h-screen font-sans overflow-hidden relative bg-[#030014] text-[#e2e8f0]">
			{/* Estilos inline para animaciones específicas si no están en tu global.css */}
			<style jsx global>{`
                /* ANIMACIONES ESPACIALES */
                .stars-bg {
                    background-image: radial-gradient(1px 1px at 10% 10%, white 1px, transparent 0), radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.7) 1px, transparent 0), radial-gradient(2px 2px at 40% 70%, white 1px, transparent 0), radial-gradient(1px 1px at 60% 40%, rgba(192, 132, 252, 0.5) 1px, transparent 0), radial-gradient(2px 2px at 80% 10%, white 1px, transparent 0), radial-gradient(1px 1px at 90% 80%, rgba(34, 211, 238, 0.5) 1px, transparent 0);
                    background-size: 550px 550px;
                    animation: starsMove 100s linear infinite;
                }
                @keyframes starsMove { from { background-position: 0 0; } to { background-position: 0 1000px; } }

                .nebula {
                    background: radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.15), transparent 70%);
                    animation: pulseNebula 10s ease-in-out infinite alternate;
                }
                @keyframes pulseNebula { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 0.8; } }

                .gradient-text {
                    background: linear-gradient(to right, #e879f9, #22d3ee);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 0 30px rgba(192, 132, 252, 0.3);
                }

                .glass-panel {
                    background: rgba(13, 13, 25, 0.6);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .glass-panel:hover {
                    border-color: rgba(34, 211, 238, 0.3);
                    box-shadow: 0 0 50px rgba(34, 211, 238, 0.1);
                    transform: translateY(-5px);
                }

                .glass-header {
                    background: rgba(3, 0, 20, 0.7);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .float { animation: float 6s ease-in-out infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }

                .btn-cosmic {
                    background: linear-gradient(90deg, #c026d3, #4f46e5);
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                    transition: all 0.3s ease;
                }
                .btn-cosmic::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(90deg, #4f46e5, #c026d3);
                    opacity: 0;
                    z-index: -1;
                    transition: opacity 0.3s ease;
                }
                .btn-cosmic:hover::before { opacity: 1; }
                .btn-cosmic:hover { box-shadow: 0 0 20px rgba(192, 38, 211, 0.4); }
                
                .scrollbar-hide::-webkit-scrollbar { width: 8px; }
                .scrollbar-hide::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .scrollbar-hide::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                .scrollbar-hide::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>

			{/* --- FONDO ANIMADO --- */}
			<div className="fixed inset-0 z-[-1]">
				<div className="absolute inset-0 stars-bg opacity-40"></div>
				<div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] nebula blur-[100px]"></div>
				<div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px]"></div>
			</div>

			{/* --- SIDEBAR --- */}
			<aside className={`
                fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r-0 border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
				<div className="h-24 flex items-center px-8 border-b border-white/5 gap-4 shrink-0">
					<div className="relative w-10 h-10 float">
						<div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-50"></div>
						<div className="relative w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white">
							<Planet size={24} weight="bold" />
						</div>
					</div>
					<span className="font-bold text-white text-2xl tracking-wide gradient-text">PancyBot</span>
				</div>

				<nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto scrollbar-hide">

					{/* --- SELECTOR DE SERVIDOR --- */}
					<div className="mb-8 relative group">
						<button
							onClick={() => setIsSelectorOpen(!isSelectorOpen)}
							className={`w-full p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-all text-left group hover:border-cyan-500/30 ${isSelectorOpen ? 'ring-2 ring-cyan-500/50 bg-white/10' : ''}`}
						>
							{guild && getIconUrl(guild, 64) ? (
								<img src={getIconUrl(guild, 64)!} className="w-10 h-10 rounded-full bg-black/20 object-cover ring-2 ring-white/10" alt="Icon" />
							) : (
								<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white ring-2 ring-white/10">{guild?.name.charAt(0)}</div>
							)}
							<div className="overflow-hidden flex-1">
								<div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-0.5">Gestionando</div>
								<div className="text-sm text-white font-bold truncate">{guild?.name}</div>
							</div>
							<CaretDown size={16} className={`text-slate-500 group-hover:text-white transition-transform duration-300 ${isSelectorOpen ? 'rotate-180' : ''}`} />
						</button>

						{/* Dropdown Items */}
						{isSelectorOpen && (
							<>
								<div className="fixed inset-0 z-40" onClick={() => setIsSelectorOpen(false)}></div>
								<div className="absolute top-full left-0 right-0 mt-2 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
									<div className="p-2 space-y-1">
										{serverList.map((s) => (
											<Link
												key={s.id}
												href={`/dashboard/${s.id}`}
												onClick={() => setIsSelectorOpen(false)}
												className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group ${s.id === guildId ? 'bg-cyan-500/10 border border-cyan-500/20' : 'border border-transparent'}`}
											>
												{getIconUrl(s, 64) ? (
													<img src={getIconUrl(s, 64)!} className="w-8 h-8 rounded-full object-cover" alt={s.name} />
												) : (
													<div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">{s.name.charAt(0)}</div>
												)}
												<div className="flex-1 truncate text-sm font-medium text-slate-300 group-hover:text-white">
													{s.name}
												</div>
												{s.id === guildId && <Check size={16} className="text-cyan-400" />}
											</Link>
										))}
									</div>
								</div>
							</>
						)}
					</div>

					<div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">General</div>
					<Link href={`/dashboard/${guildId}`} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 border-l-2 border-cyan-400 mb-1 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
						<SquaresFour size={20} weight="fill" />
						<span className="font-medium">Vista General</span>
					</Link>

					<div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 mt-8">Administración</div>

					<Link href={`/dashboard/${guildId}/music`} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group mb-1">
						<MusicNotes size={20} className="text-pink-400 group-hover:scale-110 transition-transform" weight="duotone" />
						<span className="font-medium">Música Hi-Fi</span>
					</Link>

					<Link href={`/dashboard/${guildId}/moderation`} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group mb-1">
						<ShieldCheck size={20} className="text-green-400 group-hover:scale-110 transition-transform" weight="duotone" />
						<span className="font-medium">Moderación</span>
					</Link>

					<Link href={`/dashboard/${guildId}/logs`} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group mb-1">
						<Scroll size={20} className="text-amber-400 group-hover:scale-110 transition-transform" weight="duotone" />
						<span className="font-medium">Logs & Auditoría</span>
					</Link>

					<Link href={`/dashboard/${guildId}/config`} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group mb-1">
						<Wrench size={20} className="text-slate-300 group-hover:scale-110 transition-transform" weight="duotone" />
						<span className="font-medium">Configuración</span>
					</Link>
				</nav>

				<div className="p-6 border-t border-white/5 bg-black/20 mt-auto shrink-0">
					<Link href="/dashboard" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors w-full px-4 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5">
						<ArrowLeft size={18} weight="bold" />
						Volver a la lista
					</Link>
				</div>
			</aside>

			{/* Overlay Móvil */}
			{sidebarOpen && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
			)}

			{/* --- CONTENIDO PRINCIPAL --- */}
			<main className="flex-1 flex flex-col relative z-10 overflow-hidden min-w-0">

				{/* HEADER */}
				<header className="h-24 glass-header flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-30">
					<div className="flex items-center gap-4">
						<button onClick={() => setSidebarOpen(true)} className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg">
							<List size={24} weight="bold" />
						</button>

						<div className="hidden md:block">
							<div className="flex items-center gap-2 text-sm text-slate-400">
								<Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
								<CaretRight size={12} weight="bold" />
								<span className="text-white font-bold">{guild?.name}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-6">
						{/* Notificaciones */}
						<button className="relative text-slate-400 hover:text-white transition-colors p-2.5 hover:bg-white/5 rounded-full group">
							<Bell size={22} weight="bold" className="group-hover:animate-swing" />
							<span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a15] animate-pulse"></span>
						</button>

						{/* Usuario Dropdown */}
						<div className="relative">
							<button
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
								className="flex items-center gap-4 pl-6 border-l border-white/10 h-10 cursor-pointer hover:opacity-90 transition-opacity"
							>
								<div className="text-right hidden sm:block leading-tight">
									<div className="text-sm font-bold text-white">{userData?.username || 'Usuario'}</div>
									{isPremium ? (
										<div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 font-black tracking-wide drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
											✨ PREMIUM
										</div>
									) : (
										<div className="text-[10px] text-slate-500 font-bold tracking-wide">GRATIS</div>
									)}
								</div>
								<div className={`w-11 h-11 rounded-full p-[2px] shadow-lg ${isPremium ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-amber-500/20' : 'bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-cyan-500/20'}`}>
									<img
										src={avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
										className="w-full h-full rounded-full object-cover border-2 border-[#0a0a15] bg-black"
										alt="Avatar"
									/>
								</div>
							</button>

							{/* Menú User */}
							{isUserMenuOpen && (
								<>
									<div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
									<div className="absolute top-full right-0 mt-4 w-56 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
										<div className="p-2">
											<div className="px-3 py-2 border-b border-white/5 mb-1">
												<div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mi Cuenta</div>
											</div>
											<a
												href={`${API_BASE}/api/auth/logout?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
												className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors w-full group"
											>
												<SignOut size={18} className="group-hover:translate-x-1 transition-transform" />
												<span className="font-medium text-sm">Cerrar Sesión</span>
											</a>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</header>

				{/* CONTENIDO SCROLLABLE */}
				<div className="flex-1 overflow-y-auto scroll-smooth p-0 scrollbar-hide">

					{/* --- HERO SECTION --- */}
					<div className="relative w-full">
						{/* Banner */}
						<div className="h-64 md:h-80 w-full relative overflow-hidden group">
							<div className="absolute inset-0 bg-indigo-900/20"></div>
							{guild && getBannerUrl(guild) ? (
								<img src={getBannerUrl(guild)!} className="w-full h-full object-cover opacity-60 mix-blend-screen transition-transform duration-1000 group-hover:scale-105" alt="Banner" />
							) : (
								<div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/80 to-transparent"></div>
						</div>

						{/* Info Server */}
						<div className="px-6 md:px-12 -mt-20 relative z-10 pb-8">
							<div className="flex flex-col md:flex-row items-start md:items-end gap-6">

								{/* Icono Server */}
								<div className="relative group">
									<div className="absolute inset-0 bg-cyan-500 rounded-[2rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
									<div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] glass-panel p-1.5 relative z-10 overflow-hidden shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-300">
										{guild && getIconUrl(guild) ? (
											<img src={getIconUrl(guild)!} className="w-full h-full rounded-[1.7rem] object-cover" alt="Icon" />
										) : (
											<div className="w-full h-full rounded-[1.7rem] bg-indigo-600 flex items-center justify-center text-5xl font-bold text-white">
												{guild?.name.charAt(0)}
											</div>
										)}
									</div>
									{guild && (
										<div className="absolute -top-3 -right-3 bg-gradient-to-br from-amber-400 to-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/30 z-20 border border-white/20">
											LVL {guild.premiumTier}
										</div>
									)}
								</div>

								{/* Textos y Stats */}
								<div className="flex-1 mb-2 w-full">
									<h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl mb-4">
										{guild?.name}
									</h1>

									{/* STATS BAR */}
									<div className="flex flex-wrap items-center gap-3 text-sm font-medium">

										{/* Miembros */}
										<div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2.5 text-slate-300 border-white/5 hover:bg-white/5 transition-colors cursor-default">
											<Users size={18} weight="fill" className="text-cyan-400" />
											<span className="text-white font-bold">{guild?.memberCount}</span>
											<span className="text-slate-500">Miembros</span>
										</div>

										{/* Canales */}
										<div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2.5 text-slate-300 border-white/5 hover:bg-white/5 transition-colors cursor-default">
											<Hash size={18} weight="fill" className="text-purple-400" />
											<span className="text-white font-bold">{guild?.channels?.length || 0}</span>
											<span className="text-slate-500">Canales</span>
										</div>

										{/* Ping Bot */}
										<div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2.5 text-slate-300 border-white/5 hover:bg-white/5 transition-colors cursor-default">
											<Activity size={18} weight="fill" className="text-green-400 animate-pulse" />
											<span className="text-white font-bold">{ping}ms</span>
											<span className="text-slate-500">Ping</span>
										</div>

										{/* ID Copy */}
										<button
											onClick={() => guild && copyToClipboard(guild.id)}
											className="glass-panel px-4 py-2 rounded-full flex items-center gap-2.5 text-slate-400 border-white/5 hover:bg-white/5 transition-colors cursor-pointer hover:text-white ml-auto active:scale-95"
										>
											<Copy size={18} weight="bold" />
											ID: {guild?.id}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* --- GRID DE MODULOS --- */}
					<div className="px-6 md:px-12 py-6 pb-20">
						<h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
							<span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"></span>
							Panel de Control
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

							{/* 1. MÚSICA */}
							<Link href={`/dashboard/${guildId}/music`} className="glass-panel p-8 rounded-3xl relative group cursor-pointer overflow-hidden h-full border-t border-white/10 hover:border-pink-500/30 block">
								<div className="absolute -right-6 -top-6 text-pink-500/5 group-hover:text-pink-500/10 transition-colors duration-500">
									<MusicNotes size={150} weight="fill" className="transform rotate-12" />
								</div>

								<div className="relative z-10 flex flex-col h-full">
									<div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-pink-500/10">
										<MusicNotes size={32} weight="fill" />
									</div>

									<h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-300 transition-colors">Sistema de Música</h3>
									<p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
										Gestiona canales de voz 24/7, roles de DJ, filtros de audio y listas de reproducción del servidor.
									</p>

									<div className="btn-cosmic w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2">
										<Faders size={20} weight="bold" />
										Configurar
									</div>
								</div>
							</Link>

							{/* 2. MODERACIÓN */}
							<Link href={`/dashboard/${guildId}/moderation`} className="glass-panel p-8 rounded-3xl relative group cursor-pointer overflow-hidden h-full border-t border-white/10 hover:border-green-500/30 block">
								<div className="absolute -right-6 -top-6 text-green-500/5 group-hover:text-green-500/10 transition-colors duration-500">
									<ShieldCheck size={150} weight="fill" className="transform rotate-12" />
								</div>

								<div className="relative z-10 flex flex-col h-full">
									<div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-green-500/10">
										<ShieldCheck size={32} weight="fill" />
									</div>

									<h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">Seguridad & AutoMod</h3>
									<p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
										Protección anti-raid, filtros de chat automático, sistema de advertencias y gestión de sanciones.
									</p>

									<div className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
										<Gauge size={20} weight="bold" />
										Gestionar Reglas
									</div>
								</div>
							</Link>

							{/* 3. LOGS */}
							<Link href={`/dashboard/${guildId}/logs`} className="glass-panel p-8 rounded-3xl relative group cursor-pointer overflow-hidden h-full border-t border-white/10 hover:border-amber-500/30 block">
								<div className="absolute -right-6 -top-6 text-amber-500/5 group-hover:text-amber-500/10 transition-colors duration-500">
									<Scroll size={150} weight="fill" className="transform rotate-12" />
								</div>

								<div className="relative z-10 flex flex-col h-full">
									<div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-amber-500/10">
										<Scroll size={32} weight="fill" />
									</div>

									<h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-300 transition-colors">Registros (Logs)</h3>
									<p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
										Historial detallado de eventos: mensajes borrados, cambios de roles, entradas/salidas y voz.
									</p>

									<div className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
										<Eye size={20} weight="bold" />
										Ver Historial
									</div>
								</div>
							</Link>

							{/* 4. CONFIGURACIÓN */}
							<Link href={`/dashboard/${guildId}/config`} className="glass-panel p-8 rounded-3xl relative group cursor-pointer overflow-hidden h-full border-t border-white/10 hover:border-blue-500/30 block">
								<div className="absolute -right-6 -top-6 text-blue-500/5 group-hover:text-blue-500/10 transition-colors duration-500">
									<Wrench size={150} weight="fill" className="transform rotate-12" />
								</div>

								<div className="relative z-10 flex flex-col h-full">
									<div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/10">
										<Wrench size={32} weight="fill" />
									</div>

									<h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">Configuración del Bot</h3>
									<p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
										Ajusta el prefijo, idioma, permisos de comandos y mensajes de bienvenida/despedida.
									</p>

									<div className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
										<Wrench size={20} weight="bold" />
										Ajustes
									</div>
								</div>
							</Link>

						</div>
					</div>

				</div>
			</main>
		</div>
	);
}