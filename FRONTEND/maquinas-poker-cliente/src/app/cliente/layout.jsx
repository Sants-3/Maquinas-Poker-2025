'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ClienteLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?error=No autenticado');
    } else if (status === 'authenticated' && session.user.role !== 'cliente') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  if (status !== 'authenticated' || session?.user?.role !== 'cliente') {
    return null; // O muestra un spinner de carga
  }

  return <>{children}</>;
}