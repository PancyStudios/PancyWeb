import Link from "next/link";

export default function Dashboard() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
			<div className="glass-panel p-10 rounded-3xl max-w-lg border border-white/10">
				<div className="text-6xl mb-6">🚧</div>
				<h1 className="text-3xl font-bold text-white mb-4">Panel de Control</h1>
				<p className="text-gray-400 mb-8">
					El sistema de navegación está en mantenimiento. El backend está siendo calibrado por nuestros ingenieros espaciales.
				</p>
				<div className="flex flex-col gap-3">
					<div className="w-full bg-gray-800 rounded-full h-2.5 mb-1">
						<div className="bg-cyan-500 h-2.5 rounded-full w-[45%] animate-pulse"></div>
					</div>
					<span className="text-xs text-cyan-400 uppercase tracking-widest">Progreso del Backend: 45%</span>
				</div>
				<div className="mt-10">
					<Link href="/" className="text-sm text-gray-500 hover:text-white underline decoration-dotted">
						Volver a la base
					</Link>
				</div>
			</div>
		</div>
	);
}