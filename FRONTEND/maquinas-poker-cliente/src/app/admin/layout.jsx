'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null; // O un mensaje de redirección
  }

  return (
    <div>
      <header className="bg-white border-bottom p-3">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <a href="/admin" className="h3 mb-0 text-dark">Panel de Administración</a>

            <nav className="d-flex align-items-center gap-4">
              <a href="/admin/inventario" className="text-decoration-none">
                Gestión de Inventario
              </a>
              <a href="/admin/usuarios" className="text-decoration-none">
                Gestión de Usuarios
              </a>
              <a href="/admin/proveedores" className="text-decoration-none">
                Gestión de Proveedores
              </a>
              {/*
              <a href="/configuracion" className="text-decoration-none">
                Configuración
              </a> */}
              <button className="btn btn-danger" onClick={() => signOut({ callbackUrl: '/' })}>
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}