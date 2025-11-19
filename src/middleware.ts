import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	// --- 1. PROTECCIÓN DE DOMINIO ---
	const hostHeader = request.headers.get('host') || '';
	const hostname = hostHeader.split(':')[0];
	const allowedDomain = 'pancybot.miau.media';

	// En producción, bloqueamos IPs directas
	if (process.env.NODE_ENV !== 'development') {
		if (hostname !== allowedDomain) {
			return new NextResponse(
				JSON.stringify({
					success: false,
					error: 'Forbidden Access',
					message: `Acceso directo no permitido. Usa: https://${allowedDomain}`
				}),
				{ status: 403, headers: { 'content-type': 'application/json' } }
			);
		}
	}

	// --- 2. PROTECCIÓN DEL DASHBOARD ---
	if (request.nextUrl.pathname.startsWith('/dashboard')) {

		// CAMBIO CLAVE: Buscamos la cookie 'connect.sid'
		const session = request.cookies.get('connect.sid');

		// Si NO existe la cookie, mandamos a loguear a la API
		if (!session) {
			// Construimos la URL de login de tu API
			const loginUrl = new URL('https://api.pancy.miau.media/api/auth/discord');

			// Le adjuntamos la URL actual para que la API sepa dónde devolver al usuario
			// (Asegúrate que tu API sepa leer ?redirect=...)
			loginUrl.searchParams.set('redirect', request.url);

			return NextResponse.redirect(loginUrl);
		}

		// Si la cookie existe, dejamos pasar al usuario
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}