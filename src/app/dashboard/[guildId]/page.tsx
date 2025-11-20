"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// CAMBIO: Usando 'phosphor-react' en lugar de '@phosphor-icons/react'
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
	CaretRight,
	CaretDown,
	Check,
	SignOut // Nuevo icono para cerrar sesión
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
	const params = useParams();
	const guildId = params.guildId as string;

	const [guild, setGuild] = useState<GuildDetails | null>(null);
	const [serverList, setServerList] = useState<GuildSimple[]>([]);
	const [userData, setUserData] = useState<UserData | null>(null);
	const [userPremium, setUserPremium] = useState<UserPremium | null>(null); // Estado Premium
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // Estado para la URL del avatar

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isSelectorOpen, setIsSelectorOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // Nuevo estado para el menú de usuario

	useEffect(() => {
		const fetchData = async () => {
			try {
				const opts: RequestInit = {
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					method: 'GET',
				};

				// 1. Peticiones en paralelo
				const [guildRes, userRes, listRes, premiumRes, avatarRes] = await Promise.all([
					fetch(`${API_BASE}/api/guilds/${guildId}/info`, opts), // Info del Server
					fetch(`${API_BASE}/api/users`, opts),                  // Info del User (nombre)
					fetch(`${API_BASE}/api/guilds`, opts),                 // Lista para el selector
					fetch(`${API_BASE}/api/users/premium`, opts),          // Estado Premium
					fetch(`${API_BASE}/api/users/avatar`, opts)            // URL del Avatar
				]);

				// Verificamos si el servidor existe/bot tiene acceso
				if (guildRes.status === 404) {
					setError("No se encontró el servidor o el bot no tiene acceso.");
					return;
				}

				if (!guildRes.ok) throw new Error("Error al cargar datos del servidor");

				// Procesamos respuestas
				setGuild(await guildRes.json());
				if (userRes.ok) setUserData(await userRes.json());
				if (listRes.ok) setServerList(await listRes.json());
				if (premiumRes.ok) setUserPremium(await premiumRes.json());

				// Procesamos el avatar específicamente (es un JSON { avatarURL: string })
				if (avatarRes.ok) {
					const avData: AvatarResponse = await avatarRes.json();
					setAvatarUrl(avData.avatarURL);
				}

			} catch (err) {
				console.error(err);
				setError("Ocurrió un error al conectar con el servidor.");
			} finally {
				setLoading(false);
			}
		};

		if (guildId) fetchData();
	}, [guildId]);

	// Helpers
	const getIconUrl = (g: GuildDetails | GuildSimple, size = 256) =>
		g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.${g.icon.startsWith('a_') ? 'gif' : 'webp'}?size=${size}` : null;

	const getBannerUrl = (g: GuildDetails) =>
		g.banner ? `https://cdn.discordapp.com/banners/${g.id}/${g.banner}.webp?size=1024` : null;

	const isPremium = userPremium?.isActive || userPremium?.Permanent;

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

			{/* --- SIDEBAR --- */}
			<aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
				<div className="h-20 flex items-center px-6 border-b border-white/5 gap-3 shrink-0">
					<div className="relative w-8 h-8 float">
						<div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-50"></div>
						<img src="/logo.png" alt="Logo" className="relative w-full h-full object-contain drop-shadow-lg" />
					</div>
					<span className="font-bold text-white text-xl tracking-wide gradient-text">PancyBot</span>
				</div>

				<nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3 relative">

					{/* --- SELECTOR DE SERVIDOR (Dropdown) --- */}
					<div className="px-4 mb-6 relative">
						<button
							onClick={() => setIsSelectorOpen(!isSelectorOpen)}
							className={`w-full p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-all text-left group ${isSelectorOpen ? 'ring-2 ring-cyan-500/50 bg-white/10' : ''}`}
						>
							{getIconUrl(guild, 64) ? (
								<img src={getIconUrl(guild, 64)!} className="w-10 h-10 rounded-full bg-black/20 object-cover" />
							) : (
								<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">{guild.name.charAt(0)}</div>
							)}
							<div className="overflow-hidden flex-1">
								<div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Gestionando</div>
								<div className="text-sm text-white font-bold truncate">{guild.name}</div>
							</div>
							<CaretDown size={16} className={`text-slate-500 group-hover:text-white transition-transform duration-300 ${isSelectorOpen ? 'rotate-180' : ''}`} />
						</button>

						{/* Menú Desplegable */}
						{isSelectorOpen && (
							<>
								<div className="fixed inset-0 z-40" onClick={() => setIsSelectorOpen(false)}></div>

								<div className="absolute top-full left-4 right-4 mt-2 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-hide">
									<div className="p-2 space-y-1">
										{serverList.map((s) => (
											<Link
												key={s.id}
												href={`/dashboard/${s.id}`}
												onClick={() => setIsSelectorOpen(false)}
												className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group ${s.id === guildId ? 'bg-cyan-500/10' : ''}`}
											>
												{getIconUrl(s, 64) ? (
													<img src={getIconUrl(s, 64)!} className="w-8 h-8 rounded-full object-cover" />
												) : (
													<div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">{s.name.charAt(0)}</div>
												)}
												<div className="flex-1 truncate text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
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

				<div className="p-4 border-t border-white/5 bg-black/20 mt-auto shrink-0">
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

						{/* --- ZONA DE USUARIO CON DROPDOWN --- */}
						<div className="relative">
							<button
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
								className="flex items-center gap-3 pl-6 border-l border-white/10 h-8 cursor-pointer hover:opacity-80 transition-opacity group"
							>
								<div className="text-right hidden sm:block leading-tight">
									<div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
										{userData?.username || 'Usuario'}
									</div>
									{/* ESTADO PREMIUM DINÁMICO */}
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
								<div className={`w-10 h-10 rounded-full p-[1px] overflow-hidden shadow-lg ${isPremium ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-amber-500/20' : 'bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-purple-500/20'}`}>
									<img
										src={avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
										className="w-full h-full rounded-full object-cover bg-black"
										alt="Avatar"
									/>
								</div>
								<CaretDown size={14} className={`text-slate-500 group-hover:text-white transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
							</button>

							{/* --- MENÚ DESPLEGABLE DE USUARIO --- */}
							{isUserMenuOpen && (
								<>
									<div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
									<div className="absolute top-full right-0 mt-4 w-48 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
										<div className="p-2">
											<div className="px-3 py-2 border-b border-white/5 mb-1">
												<div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mi Cuenta</div>
											</div>

											{/* Botón de Cerrar Sesión */}
											<a
												href={`${API_BASE}/api/auth/logout?redirect=${encodeURIComponent(window.location.origin)}`}
												className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors w-full group"
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
				<div className="flex-1 overflow-y-auto scroll-smooth">

					{/* --- HERO SECTION DEL SERVIDOR --- */}
					<div className="relative w-full h-64 md:h-80">
						<div className="absolute inset-0 w-full h-full overflow-hidden">
							{getBannerUrl(guild) ? (
								<img src={getBannerUrl(guild)!} className="w-full h-full object-cover opacity-50 blur-sm" />
							) : (
								<div className="w-full h-full bg-gradient-to-b from-indigo-900/40 via-[#030014]/80 to-[#030014]"></div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/60 to-transparent"></div>
						</div>

						<div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-6 flex items-end gap-6">
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