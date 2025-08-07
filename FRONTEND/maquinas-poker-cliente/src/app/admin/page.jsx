'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role === 'admin') {
        // Redirigir automáticamente al Dashboard del Administrador
        router.push('/admin/DashboardAdmin');
      } else {
        router.push('/no-autorizado');
      }
    }
  }, [status, session, router]);

  // Mostrar loading mientras se hace la redirección
  return (
    <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="text-center">
        <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
          <span className="visually-hidden">Redirigiendo...</span>
        </div>
        <h5 className="text-muted">Redirigiendo al Dashboard del Administrador...</h5>
      </div>
    </div>
  );
}