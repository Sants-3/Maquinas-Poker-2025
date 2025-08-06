import { NextRequest, NextResponse } from 'next/server';
import { RepuestoService } from '@/services/repuesto.service';

export const RepuestoController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
      const data = await RepuestoService.getRepuestos(id ? Number(id) : undefined);
      if (!data) return NextResponse.json({ error: 'Repuesto no encontrado' }, { status: 404 });
      return data;
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },

  async post(req: NextRequest) {
    try {
      const body = await req.json();
      await RepuestoService.createRepuesto(body);
      return NextResponse.json({ message: 'Repuesto creado correctamente' });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },

  async put(req: NextRequest) {
    try {
      const body = await req.json();
      await RepuestoService.updateRepuesto(body);
      return NextResponse.json({ message: 'Repuesto actualizado correctamente' });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },

  async del(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    try {
      await RepuestoService.deleteRepuesto(Number(id));
      return NextResponse.json({ message: 'Repuesto eliminado correctamente' });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }
};
