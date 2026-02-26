import { NextResponse, type NextRequest } from 'next/server';

// ⚠️ BYPASS TEMPORAL - auth desactivada para explorar el front
// Reactivar reemplazando este archivo con el original cuando se indique

export async function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|.*\\.png$).*)'],
};
