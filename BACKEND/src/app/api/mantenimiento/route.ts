// import { connectDB } from '@/lib/db';
import { createMantenimientoController, deleteMantenimientoController, getAllMantenimientosController, updateMantenimientoController } from '@/controllers/mantenimiento.controller';
import { authenticateRole } from '@/middleware/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;

  const result = await getAllMantenimientosController();
  if('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'cliente'])(req);
  if (auth) return auth;

  const body = await req.json();
  const result = await createMantenimientoController(body);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ message: 'Mantenimiento creado exitosamente', mantenimiento: result },
    { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;

  const body = await req.json();
  const { id, mantenimientoData } = body;

  const result = await updateMantenimientoController(id, mantenimientoData);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ message: 'Mantenimiento actualizado exitosamente', mantenimiento: result }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID del mantenimiento' }, { status: 400 });
  }

  const result = await deleteMantenimientoController(id);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ message: 'Mantenimiento eliminado exitosamente', mantenimiento: result , status: 200});
}