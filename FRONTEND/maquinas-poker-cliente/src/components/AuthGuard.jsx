// src/components/AuthGuard.jsx
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children, requiredRoles = [] }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && requiredRoles.length > 0 && !requiredRoles.includes(session.user.role)) {
      router.push('/no-autorizado');
    }
  }, [status, session, requiredRoles, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'authenticated' && (requiredRoles.length === 0 || requiredRoles.includes(session.user.role))) {
    return <>{children}</>;
  }

  return null;
}