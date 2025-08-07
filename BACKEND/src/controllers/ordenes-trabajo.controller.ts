import { OrdenesTrabajoService } from '@/services/ordenes-trabajo.service';
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';

export const OrdenesTrabajoController = {
  async get(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const estado = searchParams.get('estado');
    const tecnicoId = searchParams.get('tecnicoId');
    
    console.log('GET Órdenes de Trabajo - Parámetros:', { id, estado, tecnicoId });
    
    try {
      const data = await OrdenesTrabajoService.getOrdenes(
        id ? Number(id) : undefined,
        estado || undefined,
        tecnicoId ? Number(tecnicoId) : undefined
      );
      
      console.log('Órdenes obtenidas:', data);
      console.log('Cantidad de órdenes:', data?.length || 0);
      
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error al obtener órdenes de trabajo:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  },

  async post(req: NextRequest) {
    const body = await req.json();
    console.log('POST Body recibido:', body);
    
    try {
      let ordenId;
      
      if (body.reporteId && body.tecnicoId) {
        // Crear orden desde reporte
        ordenId = await OrdenesTrabajoService.createOrdenFromReporte(
          body.reporteId,
          body.tecnicoId,
          body.tiempoEstimado
        );
      } else {
        // Crear orden manual
        ordenId = await OrdenesTrabajoService.createOrden(body);
      }
      
      console.log('Orden de trabajo creada exitosamente:', ordenId);
      
      return new NextResponse(JSON.stringify({ 
        id: ordenId,
        message: 'Orden de trabajo creada correctamente'
      }), {
        status: 201,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error al crear orden de trabajo:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
  },

  async put(req: NextRequest) {
    const body = await req.json();
    
    try {
      await OrdenesTrabajoService.updateOrden(body);
      
      return new NextResponse(JSON.stringify({ 
        message: 'Orden de trabajo actualizada correctamente' 
      }), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error al actualizar orden de trabajo:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
  },

  async delete(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    try {
      await OrdenesTrabajoService.deleteOrden(Number(id));
      
      return new NextResponse(JSON.stringify({ 
        message: 'Orden de trabajo eliminada correctamente' 
      }), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error al eliminar orden de trabajo:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }
  }
};