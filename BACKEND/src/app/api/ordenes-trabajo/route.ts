import { NextRequest, NextResponse } from 'next/server';
import { OrdenesTrabajoController } from '@/controllers/ordenes-trabajo.controller';
import { authenticateRole } from '@/middleware/auth';
import { corsHeaders, handlePreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;
  
  return await OrdenesTrabajoController.get(req);
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  
  return await OrdenesTrabajoController.post(req);
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;
  
  return await OrdenesTrabajoController.put(req);
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  
  return await OrdenesTrabajoController.delete(req);
}