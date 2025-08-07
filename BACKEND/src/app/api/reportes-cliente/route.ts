import { NextRequest, NextResponse } from 'next/server';
import { ReporteClienteController } from '@/controllers/reportes-cliente.controller';
import { authenticateRole } from '@/middleware/auth';
import { corsHeaders, handlePreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;
  
  return await ReporteClienteController.get(req);
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRole(['cliente'])(req);
  if (auth) return auth;
  
  return await ReporteClienteController.post(req);
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;
  
  return ReporteClienteController.put(req);
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  
  return ReporteClienteController.delete(req);
}