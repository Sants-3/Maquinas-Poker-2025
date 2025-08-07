import { MaquinaService } from '@/services/maquinas.service';
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { getUserFromToken } from '@/middleware/auth';

export const MaquinaController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    // Obtener información del usuario del token
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    let data;
    if (user.rol === 'cliente') {
      // Si es cliente, solo mostrar sus máquinas
      data = await MaquinaService.getMaquinas(id ? Number(id) : undefined, user.id);
    } else {
      // Si es admin o técnico, mostrar todas o la específica
      data = await MaquinaService.getMaquinas(id ? Number(id) : undefined);
    }

    if (!data) return NextResponse.json({ error: 'Máquina no encontrada' }, { status: 404 });

    return data;
  },

  async post(req: NextRequest) {
    const body = await req.json();
    try {
      const data = await MaquinaService.createMaquina(body);
      return data;
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 404 });
    }
  },

  async put(req: NextRequest) {
    const body = await req.json();
    
    // Obtener información del usuario del token
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    try {
      // Si es cliente, verificar que solo pueda actualizar sus propias máquinas
      if (user.rol === 'cliente') {
        const maquina = await MaquinaService.getMaquinas(body.id);
        if (!maquina || (Array.isArray(maquina) ? maquina[0]?.usuario_id !== user.id : maquina.usuario_id !== user.id)) {
          return NextResponse.json({ error: 'No tienes permisos para actualizar esta máquina' }, { status: 403 });
        }
        
        // Los clientes solo pueden actualizar ciertos campos (estado y notas)
        const allowedFields = { id: body.id, estado: body.estado, notas: body.notas };
        await MaquinaService.updateMaquina(allowedFields);
      } else {
        // Admin y técnico pueden actualizar todos los campos
        await MaquinaService.updateMaquina(body);
      }
      
      return new NextResponse(JSON.stringify({ message: 'Máquina actualizada correctamente' }), {
          status: 200,
          headers: corsHeaders
        });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 404 });
    }
  },

  async del(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    try {
      await MaquinaService.deleteMaquina(Number(id));
      return new NextResponse(JSON.stringify({ message: 'Máquina eliminada correctamente' }), {
          status: 200,
          headers: corsHeaders
        });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 404 });
    }
  }
};
