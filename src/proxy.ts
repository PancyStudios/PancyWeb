import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
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
	return NextResponse.next();
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}