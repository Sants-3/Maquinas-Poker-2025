import { NextRequest, NextResponse } from 'next/server';
import { ProveedorService } from '@/services/proveedor.service';

export const ProveedorController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
      const data = await ProveedorService.getProveedores(id ? Number(id) : undefined);
      if (!data) return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
      return data;
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },
};