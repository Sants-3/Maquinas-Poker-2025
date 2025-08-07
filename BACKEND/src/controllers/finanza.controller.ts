import { NextRequest, NextResponse } from 'next/server';
import { FinanzaService } from '@/services/finanza.service';
import { corsHeaders } from '@/lib/cors';

export const FinanzaController = {
  async get(_req: Request) {
    try {
      const data = await FinanzaService.getFinanzas();
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error('Error en FinanzaController.get:', error);
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Error desconocido al obtener finanzas',
          code: (error as any).code || 'UNKNOWN_ERROR',
        },
        { status: 500, headers: corsHeaders }
      );
    }
  },

  async post(req: NextRequest) {
    try {
      const body = await req.json();
      
      // Validación básica del body
      if (!body || typeof body !== 'object') {
        return NextResponse.json(
          { error: 'Cuerpo de la solicitud inválido' },
          { status: 400, headers: corsHeaders }
        );
      }

      const result = await FinanzaService.createFinanza(body);
      
      return NextResponse.json(
        { 
          message: 'Movimiento financiero registrado exitosamente',
          data: result 
        },
        { status: 201, headers: corsHeaders }
      );
    } catch (error) {
      console.error('Error en FinanzaController.post:', error);
      
      const status = error instanceof Error && 
                    (error.message.includes('Falta el campo') || 
                     error.message.includes('no encontrad')) ? 400 : 500;
      
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Error desconocido al registrar movimiento financiero',
        },
        { status, headers: corsHeaders }
      );
    }
  },

  async put(req: NextRequest) {
    try {
      const body = await req.json();
      
      if (!body || typeof body !== 'object') {
        return NextResponse.json(
          { error: 'Cuerpo de la solicitud inválido' },
          { status: 400, headers: corsHeaders }
        );
      }

      if (!body.id) {
        return NextResponse.json(
          { error: 'Falta el ID del registro financiero' },
          { status: 400, headers: corsHeaders }
        );
      }

      const result = await FinanzaService.updateFinanza(body.id, body);
      
      return NextResponse.json(
        { 
          message: 'Registro financiero actualizado correctamente',
          data: result 
        },
        { status: 200, headers: corsHeaders }
      );
    } catch (error) {
      console.error('Error en FinanzaController.put:', error);
      
      const status = error instanceof Error && 
                    error.message.includes('no encontrad') ? 404 : 500;
      
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Error desconocido al actualizar registro financiero',
        },
        { status, headers: corsHeaders }
      );
    }
  },

  async delete(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id = Number(searchParams.get('id'));
      
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'ID inválido o faltante' },
          { status: 400, headers: corsHeaders }
        );
      }

      await FinanzaService.deleteFinanza(id);
      
      return NextResponse.json(
        { message: 'Registro financiero eliminado correctamente' },
        { status: 200, headers: corsHeaders }
      );
    } catch (error) {
      console.error('Error en FinanzaController.delete:', error);
      
      const status = error instanceof Error && 
                    error.message.includes('no encontrad') ? 404 : 500;
      
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Error desconocido al eliminar registro financiero',
        },
        { status, headers: corsHeaders }
      );
    }
  },
};