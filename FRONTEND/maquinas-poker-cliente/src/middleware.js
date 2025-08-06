import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = {
  admin: ['/admin', '/configuracion'],
  tecnico: ['/tecnico'],
  cliente: ['/cliente']
};

export default withAuth(
  async function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth?.token;

    // Verificación más estricta de autenticación
    if (!token) {
      console.log('Middleware: No hay token, redirigiendo a login');
      return NextResponse.redirect(new URL(`/login?error=No autenticado&from=${encodeURIComponent(pathname)}`, request.url));
    }

    // Verificación de rutas protegidas
    for (const [role, routes] of Object.entries(PROTECTED_PATHS)) {
      if (routes.some(route => pathname.startsWith(route))) {
        if (role === 'admin' && token.role !== 'admin') {
          console.log(`Middleware: Intento de acceso a ${pathname} sin rol admin`);
          return NextResponse.redirect(new URL('/login?error=Requiere rol admin', request.url));
        }
        if (role === 'tecnico' && !['tecnico', 'admin'].includes(token.role)) {
          console.log(`Middleware: Intento de acceso a ${pathname} sin rol tecnico`);
          return NextResponse.redirect(new URL('/login?error=Requiere rol tecnico', request.url));
        }
        if (role === 'cliente' && !['cliente', 'admin'].includes(token.role)) {
          console.log(`Middleware: Intento de acceso a ${pathname} sin rol cliente`);
          return NextResponse.redirect(new URL('/login?error=Requiere rol cliente', request.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Verificación más estricta
        if (!token) {
          console.log('Callback authorized: No hay token');
          return false;
        }
        return true;
      },
    },
    pages: {
      signIn: '/login',
      error: '/login?error=',
      signOut: '/login'
    }
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/tecnico/:path*',
    '/cliente/:path*',
    '/DashboardCliente',
    '/DashboardTecnico'
  ]
};