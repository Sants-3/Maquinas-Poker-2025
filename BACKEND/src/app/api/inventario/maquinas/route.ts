import { NextRequest, NextResponse } from 'next/server';
import { MaquinaController } from '@/controllers/maquinas.controller';
import { authenticateRole } from '@/middleware/auth';
import { corsHeaders, handlePreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;
  const result = await MaquinaController.get(req);
  return new NextResponse(JSON.stringify(result), {
    status: 200,
    headers: corsHeaders
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  const result = await MaquinaController.post(req);
  return new NextResponse(JSON.stringify(result), {
    status: 200,
    headers: corsHeaders
  });
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;
  return MaquinaController.put(req);
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  return MaquinaController.del(req);
}
