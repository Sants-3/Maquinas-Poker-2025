// src/hooks/useRole.js
import { useSession } from "next-auth/react";

export const useRole = () => {
  const { data: session, status } = useSession();

  const hasRole = (role) => {
    if (status !== 'authenticated') return false;
    return session.user.role === role;
  };

  return {
    isAdmin: hasRole('admin'),
    isTecnico: hasRole('tecnico'),
    isCliente: hasRole('cliente'),
    role: session?.user?.role,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated'
  };
};