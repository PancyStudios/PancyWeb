import Link from "next/link";
import Image from "next/image";

export default function TermsOfService() {
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
		<Link href="/privacy" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors font-medium">
		Política de Privacidad &rarr;
	</Link>
	</div>
	</nav>

	{/* Contenido Principal */}
	<main className="pt-32 pb-20 px-6 container mx-auto max-w-4xl">
	<div className="glass-panel p-8 md:p-12 rounded-3xl border-t border-white/10">
	<div className="text-center mb-12">
	<h1 className="text-4xl md:text-5xl font-black text-white mb-4">
		Términos y <span className="gradient-text">Condiciones</span>
		</h1>
		<p className="text-gray-400">Última actualización: 11 de julio de 2025</p>
	</div>

	<div className="space-y-10 text-gray-300 leading-relaxed">
	<section>
		<p className="text-lg mb-4">
                ¡Bienvenido a PancyBot! Estos Términos y Condiciones (&quot;Términos&quot;) constituyen un acuerdo legal vinculante que rige el uso de la instancia oficial y pública de <strong className="text-white">PancyBot</strong> (&quot;el Servicio&quot;), operada por <strong className="text-white">PancyStudio Developers</strong>.
	</p>
	<p>
	Al añadir PancyBot a su servidor de Discord o al interactuar con cualquiera de sus funciones, usted acepta y se compromete a cumplir con estos Términos. El uso del código fuente del bot, por otro lado, se rige por su propia licencia de software.
	</p>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">1.</span> Diferencia entre Servicio y Software
		</h3>
		<p className="mb-4">Es fundamental entender la diferencia entre el &quot;Servicio&quot; y el &quot;Software&quot;:</p>
	<ul className="list-disc list-inside space-y-2 pl-4 marker:text-purple-500">
	<li><strong className="text-white">El Servicio:</strong> Se refiere a la instancia de PancyBot que nosotros alojamos y operamos. El uso del Servicio se rige por estos Términos y Condiciones.</li>
	<li><strong className="text-white">El Software:</strong> Se refiere al código fuente de PancyBot, disponible públicamente en nuestro repositorio de GitHub. El uso del Software (descargar, modificar, auto-alojar) se rige exclusivamente por la licencia de código abierto adjunta en dicho repositorio.</li>
	</ul>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">2.</span> Licencia de Código Abierto
		</h3>
		<p>
		El Software de PancyBot es de código abierto y se distribuye bajo los términos de la Licencia MIT. Eres libre de alojar tu propia instancia del Bot, siempre que cumplas con los términos de dicha licencia. PancyStudio Developers no es responsable del funcionamiento, seguridad o prácticas de privacidad de ninguna instancia que no sea la oficial.
	</p>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">3.</span> Uso Aceptable del Servicio
		</h3>
		<p className="mb-4">Usted se compromete a no utilizar nuestro Servicio oficial para ninguna de las siguientes actividades:</p>
	<ul className="list-disc list-inside space-y-2 pl-4 marker:text-purple-500">
		<li>Realizar, promover o facilitar cualquier actividad que viole las leyes aplicables o los Términos de Servicio de Discord.</li>
	<li>Explotar errores (bugs), realizar spam de comandos, o intentar deliberadamente sobrecargar, interrumpir o dañar nuestra infraestructura.</li>
	<li>Utilizar el Bot para generar, mostrar o distribuir contenido odioso, difamatorio, acosador o que infrinja los derechos de terceros.</li>
	</ul>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">4.</span> Funciones Premium (&quot;Protocolo Omega&quot;)
		</h3>
		<p>
		PancyBot puede ofrecer Funciones Premium que requieran una activación o suscripción. Estas funciones solo pueden ser activadas y utilizadas en la instancia oficial del Bot. La licencia de código abierto le da acceso para ver el código, pero no le otorga el derecho a usar funcionalmente las características premium sin la activación correspondiente en nuestro Servicio.
	</p>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">5.</span> Propiedad Intelectual y Marca
		</h3>
		<p>
		Los nombres &quot;PancyBot&quot;, &quot;PancyStudio&quot; y &quot;MiauMedia&quot;, así como sus logotipos, son marcas propiedad de sus desarrolladores. La licencia de código abierto no le otorga el derecho a utilizar nuestras marcas de una manera que sugiera que su instancia del bot es un servicio oficial o respaldado por nosotros.
	</p>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">6.</span> Terminación del Servicio
		</h3>
		<p>
		Nos reservamos el derecho de suspender o terminar su acceso a nuestro Servicio, de manera temporal o permanente, sin previo aviso, si determinamos que ha violado estos Términos y Condiciones.
	</p>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">7.</span> Exclusión de Garantías
		</h3>
		<p>
		El Servicio se proporciona &quot;TAL CUAL&quot; y &quot;SEGÚN DISPONIBILIDAD&quot;. No garantizamos que el Servicio estará siempre en línea, libre de errores o que funcionará ininterrumpidamente. En la máxima medida permitida por la ley, PancyStudio Developers no será responsable de ningún daño directo o indirecto que resulte del uso o la incapacidad de usar nuestro Servicio oficial.
	</p>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">8.</span> Ley Aplicable
		</h3>
		<p>
		Este acuerdo se regirá e interpretará de acuerdo con la legislación correspondiente a su ubicación. Si usted reside en México, el acuerdo se someterá a la Ley Federal del Derecho de Autor y demás leyes aplicables. Si reside fuera de México, el acuerdo se regirá por los tratados internacionales sobre derechos de autor y propiedad intelectual aplicables.
	</p>
	</section>

	<section>
	<h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
	<span className="text-cyan-400">9.</span> Modificaciones y Contacto
		</h3>
		<p>
		Podemos modificar estos Términos en cualquier momento. Le notificaremos de los cambios a través de nuestro servidor de soporte oficial. Si tiene alguna pregunta, contáctenos allí.
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