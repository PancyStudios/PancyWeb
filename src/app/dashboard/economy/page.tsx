'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	SquaresFour,
	ArrowLeft,
	List,
	Bell,
	CurrencyCircleDollar,
	Bank,
	Trophy,
	Medal,
	Terminal
} from 'phosphor-react';
import { redirect } from "next/navigation";

// --- TIPOS ---
interface UserPremium {
	_id: string | null;
	User: string;
	Permanent: boolean | null;
	Expira: number | null;
	isActive?: boolean;
}

interface LeaderboardUser {
	id: string;
	username: string;
	avatar: string;
	wallet: number;
	bank: number;
	total: number;
}

interface MyEconomy {
	id: string;
	wallet: number;
	bank: number;
	bank_capacity: number;
	inventory: any;
}

const API_BASE = "https://api.pancy.miau.media";

export default function GlobalEconomyPage() {
	const [userData, setUserData] = useState<any>(null);
	const [userPremium, setUserPremium] = useState<UserPremium | null>(null);
	const [myEconomy, setMyEconomy] = useState<MyEconomy | null>(null);
	const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const opts: RequestInit = {
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					method: 'GET'
				};

				const [userRes, premiumRes, ecoRes, leadRes] = await Promise.all([
					fetch(`${API_BASE}/api/users`, opts),
					fetch(`${API_BASE}/api/users/premium`, opts),
					fetch(`${API_BASE}/api/economy/global/me`, opts),
					fetch(`${API_BASE}/api/economy/global/leaderboard`, opts)
				]);

				if (userRes.status === 401 || premiumRes.status === 401) {
					const currentUrl = window.location.href;
					window.location.href = `${API_BASE}/api/auth/discord?redirect=${encodeURIComponent(currentUrl)}`;
					return;
				}

				if (userRes.ok) setUserData(await userRes.json());
				if (premiumRes.ok) setUserPremium(await premiumRes.json());
				if (ecoRes.ok) setMyEconomy(await ecoRes.json());
				if (leadRes.ok) setLeaderboard(await leadRes.json());

				setLoading(false);
			} catch (err) {
				console.error(err);
			}
		};
		fetchData();
	}, []);

	const isPremium = userPremium?.isActive || userPremium?.Permanent;

	return (
		<div className="flex h-screen font-sans overflow-hidden relative">

			{/* --- FONDO ANIMADO --- */}
			<div className="fixed inset-0 z-[-1]">
				<div className="absolute inset-0 stars-bg opacity-40"></div>
				<div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] nebula blur-[100px]"></div>
				<div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-900/10 rounded-full blur-[120px]"></div>
			</div>

			{/* --- SIDEBAR --- */}
			<aside className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
				<div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
					<div className="relative w-8 h-8 float">
						<div className="absolute inset-0 bg-yellow-500 rounded-full blur opacity-50"></div>
						<img src="/logo.png" alt="PancyBot" className="relative w-full h-full object-contain drop-shadow-lg" />
					</div>
					<span className="font-bold text-white text-xl tracking-wide gradient-text">PancyBot</span>
				</div>

				<nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
					<div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">General</div>

					<Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
						<SquaresFour size={20} weight="fill" />
						<span className="font-medium">Vista General</span>
					</Link>
					
					<div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Comunidad</div>
					<Link href="/dashboard/economy" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-yellow-400 border border-white/5 shadow-lg shadow-yellow-500/10 transition-all">
						<CurrencyCircleDollar size={20} weight="fill" />
						<span className="font-medium">Economía Global</span>
					</Link>
					
					{userData?.isDeveloper && (
						<>
							<div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Administración</div>
							<Link href="/dashboard/developer" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-purple-400 hover:text-purple-300 transition-all">
								<Terminal size={20} weight="fill" />
								<span className="font-medium">Panel Developer</span>
							</Link>
						</>
					)}
				</nav>

				<div className="p-4 border-t border-white/5 bg-black/20">
					<Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-4 py-3 rounded-lg hover:bg-white/5">
						<ArrowLeft size={18} />
						Volver al Inicio
					</Link>
				</div>
			</aside>

			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
					onClick={() => setSidebarOpen(false)}
				></div>
			)}

			{/* --- CONTENIDO PRINCIPAL --- */}
			<main className="flex-1 flex flex-col relative z-10 overflow-hidden min-w-0">

				{/* HEADER */}
				<header className="h-20 glass-header flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSidebarOpen(true)}
							className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
						>
							<List size={24} />
						</button>

						<div className="hidden md:block">
							<div className="flex items-center gap-2 text-sm text-slate-400">
								<span className="text-cyan-400">Dashboard</span>
								<span>/</span>
								<span className="text-white">Economía Global</span>
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
								<div>
									{userData?.isDeveloper ? (
										<div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 font-black tracking-wide drop-shadow-[0_0_8px_rgba(192,38,211,0.5)]">
											👨‍💻 DEVELOPER
										</div>
									) : isPremium ? (
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
								Economía <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 drop-shadow-[0_0_10px_rgba(252,211,77,0.4)]">Global</span>
							</h1>
							<p className="text-slate-400 text-sm md:text-base max-w-2xl">
								Visualiza tu capital intergaláctico (Stars) y el Top 10 de los usuarios más ricos de la comunidad.
							</p>
						</div>
					</div>

					{loading ? (
						<div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-pulse gap-4">
							<div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
							<p>Sincronizando banco interestelar...</p>
						</div>
					) : (
						<div className="space-y-8 mb-10 pb-10">
							
							{/* --- MY STATS --- */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{/* Billetera */}
								<div className="glass-panel p-6 rounded-2xl border-t border-white/10 hover:border-yellow-500/30 transition-all flex flex-col justify-center h-32 relative overflow-hidden group">
									<div className="absolute -right-4 -bottom-4 text-yellow-500/5 group-hover:text-yellow-500/10 transition-colors duration-500">
										<CurrencyCircleDollar size={120} weight="fill" className="transform -rotate-12" />
									</div>
									<div className="flex items-center gap-4 relative z-10">
										<div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-lg shadow-yellow-500/10">
											<CurrencyCircleDollar size={32} weight="fill" />
										</div>
										<div>
											<h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Billetera</h3>
											<p className="text-3xl font-black text-white">{myEconomy?.wallet.toLocaleString()}</p>
										</div>
									</div>
								</div>

								{/* Banco */}
								<div className="glass-panel p-6 rounded-2xl border-t border-white/10 hover:border-blue-500/30 transition-all flex flex-col justify-center h-32 relative overflow-hidden group">
									<div className="absolute -right-4 -bottom-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors duration-500">
										<Bank size={120} weight="fill" className="transform rotate-12" />
									</div>
									<div className="flex items-center gap-4 relative z-10">
										<div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
											<Bank size={32} weight="fill" />
										</div>
										<div className="flex-1">
											<h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Banco</h3>
											<div className="flex items-end justify-between">
												<p className="text-3xl font-black text-white">{myEconomy?.bank.toLocaleString()}</p>
												<span className="text-xs font-mono text-slate-500">Cap: {myEconomy?.bank_capacity.toLocaleString()}</span>
											</div>
										</div>
									</div>
								</div>

								{/* Total */}
								<div className="glass-panel p-6 rounded-2xl border-t border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-center h-32 relative overflow-hidden group md:col-span-2 lg:col-span-1">
									<div className="absolute -right-4 -bottom-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors duration-500">
										<Trophy size={120} weight="fill" className="transform -rotate-6" />
									</div>
									<div className="flex items-center gap-4 relative z-10">
										<div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
											<Trophy size={32} weight="fill" />
										</div>
										<div>
											<h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Neto</h3>
											<p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
												{((myEconomy?.wallet || 0) + (myEconomy?.bank || 0)).toLocaleString()}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* --- LEADERBOARD --- */}
							<div className="glass-panel rounded-3xl overflow-hidden border-t border-white/10 mt-8">
								<div className="px-8 py-6 border-b border-white/5 flex items-center gap-3 bg-black/20">
									<Medal size={28} weight="duotone" className="text-amber-400" />
									<h2 className="text-xl font-bold text-white">Top Magnates Globales</h2>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full text-left border-collapse">
										<thead>
											<tr className="bg-white/[0.02]">
												<th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Rank</th>
												<th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
												<th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Billetera</th>
												<th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Banco</th>
												<th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right text-yellow-400">Neto</th>
											</tr>
										</thead>
										<tbody>
											{leaderboard.length === 0 ? (
												<tr>
													<td colSpan={5} className="px-8 py-12 text-center text-slate-500">Aún no hay millonarios en el universo.</td>
												</tr>
											) : leaderboard.map((user, index) => {
												const isFirst = index === 0;
												const isSecond = index === 1;
												const isThird = index === 2;
												
												return (
													<tr key={user.id} className="border-t border-white/5 hover:bg-white/5 transition-colors group">
														<td className="px-8 py-5">
															{isFirst ? (
																<div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(234,179,8,0.3)]">1</div>
															) : isSecond ? (
																<div className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-300 flex items-center justify-center font-bold text-sm">2</div>
															) : isThird ? (
																<div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-500 flex items-center justify-center font-bold text-sm">3</div>
															) : (
																<div className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 text-sm">#{index + 1}</div>
															)}
														</td>
														<td className="px-8 py-5">
															<div className="flex items-center gap-3">
																<div className={`w-10 h-10 rounded-full overflow-hidden ${isFirst ? 'ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/20' : ''}`}>
																	<img 
																		src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
																		className="w-full h-full object-cover" 
																		alt={user.username || 'Usuario'} 
																	/>
																</div>
																<span className={`font-bold ${isFirst ? 'text-yellow-400' : 'text-slate-300 group-hover:text-white transition-colors'}`}>
																	{user.username || 'Usuario Desconocido'}
																</span>
															</div>
														</td>
														<td className="px-8 py-5 text-right font-mono text-sm text-slate-400">
															{user.wallet.toLocaleString()}
														</td>
														<td className="px-8 py-5 text-right font-mono text-sm text-slate-400">
															{user.bank.toLocaleString()}
														</td>
														<td className="px-8 py-5 text-right font-mono text-sm font-bold text-emerald-400">
															{user.total.toLocaleString()}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
