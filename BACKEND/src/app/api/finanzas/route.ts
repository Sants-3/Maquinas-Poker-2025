import { NextRequest } from 'next/server';
import { FinanzaController } from '@/controllers/finanza.controller';
import { authenticateRole } from '@/middleware/auth';
import { handlePreflight } from '@/lib/cors';

type UserRole = 'admin' | 'cliente' | 'tecnico';

export async function OPTIONS() {
  return handlePreflight();
}

const withAuth = (roles: UserRole[], handler: (req: NextRequest) => Promise<Response>) => {
  return async (req: NextRequest) => {
    const authResponse = await authenticateRole(roles)(req);
    if (authResponse) return authResponse;
    return handler(req);
  };
};

export const GET = withAuth(['admin', 'cliente'], FinanzaController.get);
export const POST = withAuth(['admin'], FinanzaController.post);
export const PUT = withAuth(['admin'], FinanzaController.put);
export const DELETE = withAuth(['admin'], FinanzaController.delete);