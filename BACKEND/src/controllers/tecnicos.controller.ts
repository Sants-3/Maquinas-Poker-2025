import { TecnicosService } from '@/services/tecnicos.service';
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';

export const TecnicosController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const activo = searchParams.get('activo');
    
    try {
      const data = await TecnicosService.getTecnicos(
        activo ? activo === 'true' : true // Por defecto solo técnicos activos
      );
      
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error al obtener técnicos:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }
};