'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function TecnicoRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role === 'tecnico') {
        // Redirigir automáticamente al Dashboard del Técnico
        router.push('/tecnico/DashboardTecnico');
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
        <h5 className="text-muted">Redirigiendo al Dashboard del Técnico...</h5>
      </div>
    </div>
  );
}