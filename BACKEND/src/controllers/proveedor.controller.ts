import { NextRequest, NextResponse } from 'next/server';
import { ProveedorService } from '@/services/proveedor.service';
import { corsHeaders } from '@/lib/cors';

export const ProveedorController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
      const data = await ProveedorService.getProveedores(id ? Number(id) : undefined);
      if (!data && id) return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
      return data;
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },

  async post(req: NextRequest) {
    try {
      const body = await req.json();
      await ProveedorService.createProveedor(body);
      return new NextResponse(JSON.stringify({ message: 'Proveedor creado correctamente' }), {
            status: 201,
            headers: corsHeaders
          });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },

  async put(req: NextRequest) {
    try {
      const body = await req.json();
      await ProveedorService.updateProveedor(body);
      return new NextResponse(JSON.stringify({ message: 'Proveedor actualizado correctamente' }), {
            status: 200,
            headers: corsHeaders
          });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },

  async del(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    try {
      await ProveedorService.deleteProveedor(Number(id));
      return new NextResponse(JSON.stringify({ message: 'Proveedor eliminado correctamente' }), {
            status: 200,
            headers: corsHeaders
          });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },
};