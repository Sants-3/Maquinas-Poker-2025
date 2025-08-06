import { NextRequest, NextResponse } from 'next/server';
import { authenticateRole } from '@/middleware/auth';
import { ProveedorController } from '@/controllers/proveedor.controller';
import { corsHeaders, handlePreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  const result = await ProveedorController.get(req);
  return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: corsHeaders
    });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  return ProveedorController.post(req);
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  return ProveedorController.put(req);
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;
  return ProveedorController.del(req);
}