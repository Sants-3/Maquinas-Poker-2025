import { NextRequest, NextResponse } from 'next/server';
import { FinanzaService } from '@/services/finanza.service';

export const FinanzaController = {
  
// eslint-disable-next-line @typescript-eslint/no-unused-vars
   async get(_req: Request) {
    try {
      const data = await FinanzaService.getFinanzas();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error en FinanzaController.get:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Error desconocido al obtener finanzas',
          code: (error as any).code || 'UNKNOWN_ERROR'
        },
        { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
      );
    }
  },

  async post(req: NextRequest) {
    try {
      const body = await req.json();
      const requiredFields = [
        'tipo_movimiento', 'monto', 'moneda', 'fecha_movimiento',
        'maquina_id', 'usuario_id', 'transaccion_id', 'proveedor_id', 'orden_trabajo_id'
      ];

      for (const field of requiredFields) {
        if (!body[field] && body[field] !== 0) {
          return NextResponse.json({ error: `Falta el campo requerido: ${field}` }, { status: 400 });
        }
      }

      await FinanzaService.createFinanza(body);
      return NextResponse.json({ message: 'Movimiento financiero registrado exitosamente' });
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message || 'Error desconocido al registrar movimiento financiero' },
        { status: 500 }
      );
    }
  },

  async put(req: NextRequest) {
    try {
      const body = await req.json();

      if (!body.id) {
        return NextResponse.json({ error: 'Falta el ID del registro financiero' }, { status: 400 });
      }

      await FinanzaService.updateFinanza(body);
      return NextResponse.json({ message: 'Registro financiero actualizado correctamente' });
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message || 'Error desconocido al actualizar registro financiero' },
        { status: 500 }
      );
    }
  }
};
