import { authenticateRole } from '@/middleware/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/data-source';
import { Inventario } from '@/entity/Inventario';
import { Repuesto } from '@/entity/Repuesto';
import { Ubicacion } from '@/entity/Ubicacion';
import { corsHeaders, handlePreflight } from '@/lib/cors';
import { InventarioController } from '@/controllers/inventario.controller';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;
  const result = await InventarioController.get(req);
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: corsHeaders
    });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateRole(['admin'])(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    const {
      repuesto_id,
      cantidad,
      ubicacion_id,
      ultima_entrada_fecha,
      ultima_entrada_cantidad,
      ultima_salida_fecha,
      ultima_salida_cantidad,
      stock_minimo,
      notas
    } = body;

    if (!repuesto_id || cantidad == null || !ubicacion_id || !ultima_entrada_fecha || !ultima_salida_fecha) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const db = await getDataSource();
    const inventarioRepository = db.getRepository(Inventario);
    const repuestoRepository = db.getRepository(Repuesto);
    const ubicacionRepository = db.getRepository(Ubicacion);

    const repuesto = await repuestoRepository.findOneBy({ id: repuesto_id });
    if (!repuesto) {
      return NextResponse.json({ error: 'Repuesto no encontrado' }, { status: 404 });
    }

    const ubicacion = await ubicacionRepository.findOneBy({ id: ubicacion_id });
    if (!ubicacion) {
      return NextResponse.json({ error: 'Ubicación no encontrada' }, { status: 404 });
    }

    const nuevoInventario = inventarioRepository.create({
      repuesto,
      cantidad,
      ubicacion,
      ultima_entrada_fecha: new Date(ultima_entrada_fecha),
      ultima_entrada_cantidad,
      ultima_salida_fecha: new Date(ultima_salida_fecha),
      ultima_salida_cantidad,
      stock_minimo,
      notas,
      creado_en: new Date(),
      actualizado_en: new Date()
    });

    await inventarioRepository.save(nuevoInventario);
    return new NextResponse(JSON.stringify({ message: 'Inventario creado exitosamente' }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al crear inventario:', error.message);
      return NextResponse.json(
        { error: `Error al crear inventario: ${error.message}` },
        { status: 500 }
      );
    }
    console.error('Error desconocido al crear inventario:', error);
    return NextResponse.json({ error: 'Error desconocido al crear inventario' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await authenticateRole(['admin', 'tecnico'])(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    const { id, cantidad, stock_minimo, ultima_entrada_cantidad, ultima_entrada_fecha, ultima_salida_cantidad, ultima_salida_fecha, notas } = body;

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del inventario' }, { status: 400 });
    }

    const db = await getDataSource();
    const inventarioRepository = db.getRepository(Inventario);
    const inventario = await inventarioRepository.findOne({ where: { id }, relations: ['repuesto'] });

    if (!inventario) {
      return NextResponse.json({ error: 'Inventario no encontrado' }, { status: 404 });
    }

    // Actualizamos campos si están presentes en el body
    if (cantidad !== undefined) inventario.cantidad = cantidad;
    if (stock_minimo !== undefined) inventario.stock_minimo = stock_minimo;
    if (ultima_entrada_cantidad !== undefined) inventario.ultima_entrada_cantidad = ultima_entrada_cantidad;
    if (ultima_entrada_fecha) inventario.ultima_entrada_fecha = new Date(ultima_entrada_fecha);
    if (ultima_salida_cantidad !== undefined) inventario.ultima_salida_cantidad = ultima_salida_cantidad;
    if (ultima_salida_fecha) inventario.ultima_salida_fecha = new Date(ultima_salida_fecha);
    if (notas !== undefined) inventario.notas = notas;

    inventario.actualizado_en = new Date();

    await inventarioRepository.save(inventario);
    return new NextResponse(JSON.stringify({ message: 'Inventario actualizado correctamente' }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al actualizar inventario:', error.message);
      return NextResponse.json(
        { error: `Error al actualizar inventario: ${error.message}` },
        { status: 500 }
      );
    }
    console.error('Error desconocido al actualizar inventario:', error);
    return NextResponse.json({ error: 'Error desconocido al actualizar inventario' }, { status: 500 });
  }
}