import { ReporteClienteService } from '@/services/reportes-cliente.service';
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { getUserFromToken } from '@/middleware/auth';

export const ReporteClienteController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const estado = searchParams.get('estado');
    
    console.log('GET Reportes - Parámetros:', { id, estado });
    
    try {
      const data = await ReporteClienteService.getReportes(
        id ? Number(id) : undefined,
        estado || undefined
      );
      
      console.log('Reportes obtenidos:', data);
      console.log('Cantidad de reportes:', data?.length || 0);
      
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },

  async post(req: NextRequest) {
    const body = await req.json();
    console.log('POST Body recibido:', body);
    
    // Obtener información del usuario del token
    const user = getUserFromToken(req);
    console.log('Usuario del token:', user);
    
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    try {
      // Agregar el ID del usuario que reporta
      const reporteData = {
        ...body,
        usuario_id: user.id
      };
      
      console.log('Datos del reporte a crear:', reporteData);
      const data = await ReporteClienteService.createReporte(reporteData);
      console.log('Reporte creado exitosamente:', data);
      
      return new NextResponse(JSON.stringify(data), {
        status: 201,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error al crear reporte:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
  },

  async put(req: NextRequest) {
    const body = await req.json();
    
    try {
      await ReporteClienteService.updateReporte(body);
      
      let message = 'Reporte actualizado correctamente';
      
      // Mensaje específico cuando se resuelve el reporte
      if (body.estado === 'resuelto') {
        message = 'Reporte marcado como resuelto. La máquina ha sido restaurada al estado operativo.';
      } else if (body.estado === 'procesado') {
        message = 'Reporte marcado como procesado. Un técnico ha sido notificado.';
      }
      
      return new NextResponse(JSON.stringify({ message }), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
  },

  async delete(req: NextRequest) {
    const body = await req.json();
    
    try {
      const success = await ReporteClienteService.deleteReporte(body.id);
      
      if (!success) {
        return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
      }
      
      return new NextResponse(JSON.stringify({ message: 'Reporte eliminado correctamente' }), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
  }
};