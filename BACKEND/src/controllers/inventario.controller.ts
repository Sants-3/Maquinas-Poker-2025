import { InventarioService } from '@/services/inventarios.service';
import { NextRequest, NextResponse } from 'next/server';

export const InventarioController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const data = await InventarioService.getInventario(id ? Number(id) : undefined);
    if (!data) return NextResponse.json({ error: 'Inventario no encontrado' }, { status: 404 });

    return data;
  },
}