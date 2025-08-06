import { UbicacionService } from '@/services/ubicaciones.service';
import { NextRequest, NextResponse } from 'next/server';

export const UbicacionController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    console.log('ID de ubicación:', id);

    try {
      const data = await UbicacionService.getUbicaciones(id ? Number(id) : undefined);
      if (!data) return NextResponse.json({ error: 'Ubicación no encontrada' }, { status: 404 });
      return data;
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },
};