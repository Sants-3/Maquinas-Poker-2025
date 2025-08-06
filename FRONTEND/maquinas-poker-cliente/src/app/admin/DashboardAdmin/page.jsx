'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/admin/DashboardAdmin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  if (status !== 'authenticated' || session?.user?.role !== 'admin') {
    return <div className="p-4">Cargando dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard del Admin</h1>
      {/* Contenido específico del dashboard */}
    </div>
  );
}