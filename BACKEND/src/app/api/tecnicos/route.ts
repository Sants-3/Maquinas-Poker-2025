import { NextRequest } from 'next/server';
import { TecnicosController } from '@/controllers/tecnicos.controller';
import { authenticateRole } from '@/middleware/auth';
import { handlePreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;
  
  return await TecnicosController.get(req);
}