'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function ClientePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'cliente') {
      router.replace('/auth/login?error=Acceso no autorizado');
      return;
    }

    router.replace('/cliente/DashboardCliente');
  }, [session, status, router]);

  return null;
}