import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Rutas públicas que no requieren sesión activa.
 */
const PUBLIC_PATHS = ['/login', '/registro'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Crear un response mutable para que @supabase/ssr pueda
    // refrescar la cookie de sesión si es necesario.
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Primero en la request para que los Server Components lo lean
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Luego en la response para que el navegador lo guarde
                    response = NextResponse.next({ request: { headers: request.headers } });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // getUser() refresca el token si está por vencer (importante para sesiones largas)
    const { data: { user } } = await supabase.auth.getUser();

    const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

    // ── Sin sesión ────────────────────────────────────────────────────────────
    if (!user) {
        // Si intenta acceder a ruta protegida → login
        if (!isPublic) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return response;
    }

    // ── Con sesión ────────────────────────────────────────────────────────────
    // Si ya tiene sesión y va al login o registro → redirigir al home
    // (el layout de cada sección se encarga de verificar el rol)
    if (isPublic) {
        return NextResponse.redirect(new URL('/entrenar', request.url));
    }

    // Si intenta entrar a '/' → redirigir según rol
    // El rol lo determina el layout del alumno o del admin con useAuth()
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/entrenar', request.url));
    }

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|.*\\.png$|.*\\.webp$).*)'],
};
