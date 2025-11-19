import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicy() {
	return (
		<div className="min-h-screen relative">
			{/* Navbar Simplificada */}
			<nav className="fixed w-full z-50 border-b border-white/5 bg-[#030014]/80 backdrop-blur-md">
				<div className="container mx-auto px-6 py-4 flex justify-between items-center">
					<Link href="/" className="flex items-center gap-3 group">
						<Image
							src="/logo.png"
							alt="PancyBot Logo"
							width={32}
							height={32}
							className="w-8 h-8 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]"
						/>
						<span className="text-xl font-bold text-white tracking-wide">PancyBot</span>
					</Link>
					<Link href="/tos" className="text-sm text-gray-400 hover:text-purple-400 transition-colors font-medium">
						Términos y Condiciones &rarr;
					</Link>
				</div>
			</nav>

			{/* Contenido Principal */}
			<main className="pt-32 pb-20 px-6 container mx-auto max-w-4xl">
				<div className="glass-panel p-8 md:p-12 rounded-3xl border-t border-white/10">
					<div className="text-center mb-12">
						<h1 className="text-4xl md:text-5xl font-black text-white mb-4">
							Política de <span className="gradient-text">Privacidad</span>
						</h1>
						<p className="text-gray-400">Última actualización: 11 de julio de 2025</p>
					</div>

					<div className="space-y-10 text-gray-300 leading-relaxed">
						<section>
							<p className="text-lg mb-4">
								En PancyStudio, tu privacidad es una prioridad. Esta Política de Privacidad tiene como objetivo informarte de manera clara y transparente sobre qué información recopila la instancia oficial de <strong className="text-white">PancyBot</strong> (&quot;el Bot&quot;, &quot;el Servicio&quot;), por qué la recopilamos y cómo la utilizamos. Esta política se aplica exclusivamente a la instancia oficial operada por <strong className="text-white">PancyStudio Developers</strong>.
							</p>
						</section>

						<section>
							<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
								<span className="text-purple-400">1.</span> Información que Recopilamos
							</h3>
							<p className="mb-4">Para funcionar correctamente, PancyBot necesita recopilar y almacenar una cantidad mínima de información:</p>

							<div className="bg-white/5 p-6 rounded-xl mb-4 border border-white/5">
								<h4 className="font-bold text-lg text-white mb-2">a) Datos de Configuración:</h4>
								<ul className="list-disc list-inside space-y-1 pl-4 marker:text-cyan-400">
									<li><strong className="text-cyan-200">ID del Servidor de Discord (Guild ID):</strong> Para guardar ajustes específicos de tu servidor (prefijos, canales de logs, etc.).</li>
									<li><strong className="text-cyan-200">ID de Usuario de Discord (User ID):</strong> Para gestionar configuraciones personales, perfiles de economía y niveles.</li>
								</ul>
							</div>

							<div className="bg-white/5 p-6 rounded-xl mb-4 border border-white/5">
								<h4 className="font-bold text-lg text-white mb-2">b) Datos de Operación y Monitoreo:</h4>
								<ul className="list-disc list-inside space-y-1 pl-4 marker:text-cyan-400">
									<li><strong className="text-cyan-200">Logs de Unión y Salida:</strong> Registramos cuando el Bot es añadido o expulsado de un servidor (nombre e ID) para fines estadísticos. Estos registros son privados.</li>
									<li><strong className="text-cyan-200">Informes de Errores:</strong> Si ocurre un error crítico, generamos un reporte automático que puede contener el ID del servidor/usuario para depuración técnica.</li>
								</ul>
							</div>

							<div className="bg-green-900/20 p-6 rounded-xl border border-green-500/20">
								<h4 className="font-bold text-lg text-green-300 mb-2">c) Lo que NO Recopilamos:</h4>
								<p>PancyBot <strong className="text-white underline decoration-green-500">nunca</strong> almacenará de forma permanente el contenido de tus mensajes, tu correo electrónico, contraseñas, o información de pago directa.</p>
							</div>
						</section>

						<section>
							<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
								<span className="text-purple-400">2.</span> Cómo Utilizamos tu Información
							</h3>
							<p>
								Utilizamos la información recopilada exclusivamente para el funcionamiento técnico del Bot, para diagnóstico de errores y para fines estadísticos internos. <strong className="text-white">No vendemos, alquilamos ni compartimos tu información personal con terceros.</strong>
							</p>
						</section>

						<section>
							<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
								<span className="text-purple-400">3.</span> Almacenamiento y Seguridad
							</h3>
							<p>
								La información se almacena en una base de datos <strong className="text-white">MongoDB</strong> alojada en nuestra propia infraestructura privada. Para garantizar la máxima seguridad, esta base de datos no está expuesta a la red pública de internet; opera en una red local virtual, accesible únicamente por las instancias del Bot. El acceso a esta infraestructura está estrictamente limitado a los desarrolladores autorizados de PancyStudio.
							</p>
						</section>

						<section>
							<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
								<span className="text-purple-400">4.</span> Tus Derechos y Control de Datos
							</h3>
							<p>
								Puedes solicitar ver o eliminar todos los datos de configuración asociados a tu ID de usuario o al ID de tu servidor (Derecho al Olvido). Para ejercer estos derechos, por favor, contáctanos a través de nuestro servidor de soporte oficial de Discord. Al eliminar tus datos, es posible que pierdas tu progreso en economía y configuraciones.
							</p>
						</section>

						<section>
							<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
								<span className="text-purple-400">5.</span> Contacto
							</h3>
							<p>
								Si tienes alguna pregunta o inquietud sobre esta Política de Privacidad, no dudes en abrir un ticket en nuestro servidor de soporte.
							</p>
						</section>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl py-8">
				<div className="container mx-auto px-6 text-center text-gray-500 text-sm">
					<p>&copy; 2025 PancyStudio. Todos los derechos reservados.</p>
					<div className="mt-4">
						<Link href="/" className="hover:text-white transition-colors">Volver al Inicio</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}