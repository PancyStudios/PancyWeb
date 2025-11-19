import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	// 1. Obtenemos el header 'host' de la petición
	// Esto suele venir como "pancybot.miau.media" o "123.45.67.89:3000"
	const hostHeader = request.headers.get('host') || '';

	// 2. Limpiamos el puerto (nos quedamos solo con el dominio/IP)
	// Ejemplo: "pancybot.miau.media:3000" -> "pancybot.miau.media"
	const hostname = hostHeader.split(':')[0];

	// 3. Definimos tu dominio permitido
	const allowedDomain = 'pancybot.miau.media';

	// --- LÓGICA DE SEGURIDAD ---

	// Permitimos siempre el acceso en modo desarrollo (localhost) para que puedas trabajar
	if (process.env.NODE_ENV === 'development') {
		return NextResponse.next();
	}

	// Si el hostname NO coincide con tu dominio oficial...
	if (hostname !== allowedDomain) {
		// ... bloqueamos el acceso inmediatamente.
		return new NextResponse(
			JSON.stringify({
				success: false,
				error: 'Forbidden Access',
				message: `El acceso directo por IP no está permitido. Por favor usa el dominio oficial: https://${allowedDomain}`
			}),
			{
				status: 403,
				headers: { 'content-type': 'application/json' }
			}
		);
	}

	// Si todo está bien, dejamos pasar la petición
	return NextResponse.next();
}

// Configuramos el middleware para que se ejecute en todas las rutas
// excepto en los archivos estáticos (imágenes, favicon, etc.) para no saturar
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes) -> Si quieres proteger la API también, quita esta línea
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (svg, png, etc)
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}