'use client';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TecnicoLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log('session', session, 'status', status);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push('/auth/login?callbackUrl=/tecnico/DashboardTecnico');
      return;
    }

    if (session.user.activo === false) {
      router.push('/auth/login?error=Usuario%20inactivo');
      return;
    }

    if (session.user.role !== 'tecnico' && session.user.rol !== 'tecnico') {
      router.push('/no-autorizado');
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div className="p-4">Cargando...</div>;
  }

  if (!session || !session.user) {
    return <div className="p-4">Redirigiendo al login...</div>;
  }

  if (session.user.activo === false) {
    return <div className="p-4">Usuario inactivo. Redirigiendo...</div>;
  }

  if (session.user.role !== 'tecnico') {
    return <div className="p-4">No autorizado. Redirigiendo...</div>;
  }

  return <div className="tecnico-layout">{children}</div>;
}