import Image from "next/image";
import Link from "next/link";
import UserButton from "@/components/UserButton"; // Importamos el componente

export default function Home() {
	return (
		<div className="relative">
			{/* Navbar */}
			<nav className="fixed w-full z-50 border-b border-white/5 bg-[#030014]/80 backdrop-blur-md">
				<div className="container mx-auto px-6 py-4 flex justify-between items-center">
					<Link href="/" className="flex items-center gap-3 group">
						<div className="relative w-10 h-10 transition-transform duration-500 group-hover:rotate-12">
							<Image
								src="/logo.png"
								alt="PancyBot Logo"
								fill
								sizes="40px"
								priority
								className="object-contain drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]"
							/>
						</div>
						<span className="text-2xl font-bold text-white tracking-wide">PancyBot</span>
					</Link>

					<div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
						<Link href="#musica" className="hover:text-cyan-400 transition-colors">Sonido</Link>
						<Link href="#economia" className="hover:text-fuchsia-400 transition-colors">Economía</Link>
					</div>

					<div className="flex items-center gap-4">
						{/* Aquí integramos el botón inteligente */}
						<UserButton />
						<a href="https://discord.com/oauth2/authorize?client_id=801873281975975968"
							className="hidden sm:flex btn-cosmic text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-purple-500/30 transition-transform hover:scale-105">
							Invitar
						</a>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden">
				<div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
					<div className="md:w-1/2 text-center md:text-left z-10">
						<div className="inline-block py-1 px-3 rounded-full border border-cyan-500/30 bg-cyan-900/10 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-6">
							Estación Espacial v1.0 Online
						</div>
						<h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
							El Bot que <br />
							<span className="gradient-text">Orbita tu Servidor</span>
						</h1>
						<p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0">
							Aterriza en la mejor experiencia de Discord. Música Hi-Fi desde Deezer, economía intergaláctica y moderación de grado militar. Todo en una sola nave.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
							<a href="https://discord.com/oauth2/authorize?client_id=801873281975975968"
								className="btn-cosmic text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-transform hover:-translate-y-1 text-center">
								🚀 Despegar ahora
							</a>
							{/* Aquí usamos Link para ir al dashboard, que será manejado por middleware/page.tsx */}
							<Link href="/dashboard" className="glass-panel text-gray-300 px-8 py-4 rounded-xl font-bold text-lg hover:text-white hover:bg-white/5 transition-all text-center flex items-center justify-center gap-2">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
								Configurar Bot
							</Link>
						</div>
					</div>

					<div className="md:w-1/2 flex justify-center relative z-10">
						<div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
							<div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-full blur-[80px] opacity-40 animate-pulse"></div>
							<div className="relative w-full h-full float">
								<Image
									src="/logo.png"
									alt="Planet Logo"
									fill
									sizes="(max-width: 768px) 300px, 500px"
									priority
									className="object-contain drop-shadow-2xl"
								/>
							</div>
							<div className="absolute top-0 right-10 w-16 h-16 glass-panel rounded-2xl flex items-center justify-center animate-bounce" style={{ animationDuration: "3s" }}>
								<span className="text-2xl">🎵</span>
							</div>
							<div className="absolute bottom-10 left-0 w-20 h-20 glass-panel rounded-full flex items-center justify-center animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
								<span className="text-3xl">💎</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Música */}
			<section id="musica" className="py-24 relative">
				<div className="container mx-auto px-6">
					<div className="glass-panel rounded-3xl p-8 md:p-12 border-l-4 border-l-cyan-500 relative overflow-hidden">
						<div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none"></div>

						<div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
							<div className="md:w-1/2">
								<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Audio de Alta Frecuencia</h2>
								<p className="text-gray-400 mb-6">
									Olvídate de las interferencias. PancyBot intercepta la señal directamente de <strong>Deezer</strong> para traerte audio sin pérdidas (FLAC) o MP3 320kbps.
								</p>
								<div className="grid grid-cols-2 gap-4">
									<div className="p-4 rounded-lg bg-white/5 border border-white/10">
										<div className="text-cyan-400 font-bold text-xl mb-1">320 kbps</div>
										<div className="text-xs text-gray-500 uppercase">Bitrate Estándar</div>
									</div>
									<div className="p-4 rounded-lg bg-white/5 border border-white/10">
										<div className="text-fuchsia-400 font-bold text-xl mb-1">FLAC</div>
										<div className="text-xs text-gray-500 uppercase">Audio Lossless</div>
									</div>
								</div>
							</div>
							<div className="md:w-1/2 w-full bg-black/40 rounded-xl p-6 border border-white/10">
								<div className="flex items-end justify-between h-24 gap-1">
									{[40, 70, 50, 85, 60, 90, 45].map((h, i) => (
										<div key={i} className={`w-full rounded-t-sm animate-pulse ${i % 2 === 0 ? 'bg-cyan-500/50' : i % 3 === 0 ? 'bg-purple-500/50' : 'bg-fuchsia-500/50'}`} style={{ height: `${h}%` }}></div>
									))}
								</div>
								<div className="mt-4 flex items-center gap-4">
									<div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center">💿</div>
									<div>
										<div className="text-sm text-white font-bold">Transmitiendo...</div>
										<div className="text-xs text-cyan-400">Fuente: Deezer Direct</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Grid de Sistemas */}
			<section id="funciones" className="py-24 px-6">
				<div className="container mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-white mb-4">Sistemas de la Nave</h2>
						<p className="text-gray-400">Módulos esenciales para el control total.</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						<div className="glass-panel p-8 rounded-2xl text-center group">
							<div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
								<span className="text-3xl text-black font-bold">$</span>
							</div>
							<h3 className="text-xl font-bold text-white mb-3">Economía Galáctica</h3>
							<p className="text-sm text-gray-400">Sistema monetario global. Trabaja en las minas de asteroides, comercia y conviértete en el magnate del servidor.</p>
						</div>

						<div className="glass-panel p-8 rounded-2xl text-center group">
							<div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
							</div>
							<h3 className="text-xl font-bold text-white mb-3">Defensa & Seguridad</h3>
							<p className="text-sm text-gray-400">Protocolos de moderación avanzados. Baneos temporales, purga de mensajes y logs de seguridad.</p>
						</div>

						<div className="glass-panel p-8 rounded-2xl text-center group">
							<div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
							</div>
							<h3 className="text-xl font-bold text-white mb-3">Utilidades</h3>
							<p className="text-sm text-gray-400">Herramientas para la tripulación. Avatares, información de usuario y comandos divertidos.</p>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl py-12 mt-20">
				<div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="text-center md:text-left">
						<span className="text-lg font-bold text-white block tracking-widest uppercase text-xs mb-1">Sistema</span>
						<span className="text-2xl font-bold gradient-text">PancyBot</span>
						<p className="text-xs text-gray-500 mt-2">Copyright © 2025 PancyStudio. Todos los derechos reservados.</p>
					</div>
					<div className="flex gap-8 text-sm text-gray-400">
						<Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacidad</Link>
						<Link href="/tos" className="hover:text-cyan-400 transition-colors">Términos</Link>
						<a href="https://discord.gg/soporte" className="hover:text-cyan-400 transition-colors">Soporte</a>
					</div>
				</div>
			</footer>
		</div>
	);
}