import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { BuildInfoInjector } from '@/components/BuildInfoInjector';
import "./globals.css";
const outfit = Outfit({
	subsets: ["latin"],
	variable: "--font-outfit",
	weight: ["300", "500", "700", "900"],
});

export const metadata: Metadata = {
	title: "PancyBot - La Nueva Era",
	description: "Tu compañero multifuncional en el universo de Discord. Música Hi-Fi, Economía y Moderación.",
	robots: { index: false, follow: false },
	// --- CONFIGURACIÓN DE ICONOS ---
	icons: {
		// Icono estándar (se usa el logo.png directamente para mejor calidad)
		icon: [
			{ url: '/logo.png', sizes: 'any' }, // Deja que el navegador escale
			{ url: '/logo.png', type: 'image/png', sizes: '32x32' }, // Fallback común
			{ url: '/logo.png', type: 'image/png', sizes: '192x192' }, // Pestañas grandes / Android
		],
		// Icono para dispositivos Apple (iPhone/iPad) - Se ve increíble al añadir a inicio
		apple: [
			{ url: '/logo.png', sizes: '180x180', type: 'image/png' },
		],
		// Opcional: Icono de acceso directo
		shortcut: ['/logo.png'],
	},
	// -----------------------------
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" className="scroll-smooth" suppressHydrationWarning data-scroll-behavior="smooth">
			<body
				// suppressHydrationWarning soluciona el error causado por extensiones
				// que inyectan atributos en el body (como las de traducción o seguridad)
				suppressHydrationWarning={true}
				className={`${outfit.variable} font-sans bg-[#030014] text-slate-200`}
			>
				<BuildInfoInjector />
				{/* Fondo del Universo Fijo para todas las páginas */}
				<div className="fixed inset-0 z-[-1] bg-[#030014]">
					<div className="absolute inset-0 stars-bg opacity-60"></div>
					<div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] nebula"></div>
					<div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[100px] nebula" style={{ animationDelay: "-5s" }}></div>
				</div>
				{children}
			</body>
		</html>
	);
}