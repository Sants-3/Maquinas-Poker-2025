import { NextRequest, NextResponse } from 'next/server';
import { authenticateRole } from '@/middleware/auth';
import { deleteUserController, getAllUsersController, updateUserController } from '@/controllers/user.controller';
import { corsHeaders, handlePreflight } from '@/lib/cors';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;

  const result = await getAllUsersController();
  if ('error' in result) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
  return new NextResponse(JSON.stringify(result), {
    status: 200,
    headers: corsHeaders
  });
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;

  const body = await req.json();
  const { id, userData } = body;

  const result = await updateUserController(id, userData);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return new NextResponse(JSON.stringify(result), {
    status: 200,
    headers: corsHeaders
  });
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID del usuario' }, { status: 400 });
  }

  const result = await deleteUserController(id);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return new NextResponse(JSON.stringify(result), {
    status: 200,
    headers: corsHeaders
  });
}