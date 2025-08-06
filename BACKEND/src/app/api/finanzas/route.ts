import { NextRequest } from 'next/server';
import { FinanzaController } from '@/controllers/finanza.controller';
import { authenticateRole } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'cliente'])(req);
  if (auth) return auth;
  return FinanzaController.get(req);
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  return FinanzaController.post(req);
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  return FinanzaController.put(req);
}

