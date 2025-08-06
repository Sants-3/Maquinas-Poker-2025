import { Mantenimiento } from '@/entity/Mantenimiento';
import { Tecnico } from '@/entity/Tecnico';
import { createMantenimientoService, deleteMantenimientoService,
    getAllMantenimientosService, updateMantenimientoService
 } from '@/services/mantenimiento.service';

 export async function getAllMantenimientosController() {
    const result = await getAllMantenimientosService();
    return result;
 }

 export async function createMantenimientoController(body: {
    orden_trabajo_id: number;
    tipo: string;
    descripcion: string;
    acciones_realizadas: string;
    repuestos_utilizados: string;
    costo_estimado: number;
    costo_real: number;
    fecha_programada: Date;
    fecha_realizacion: Date;
    tecnico_id: number;
    resultado: string;
    observaciones: string;
}) {

    if (!body.orden_trabajo_id || !body.tipo || !body.descripcion) {
        return { error: 'Faltan datos obligatorios para crear el mantenimiento' };
    }

    const result = await createMantenimientoService(body);
    
    if (result.error) {
        return { error: result.error }
    }
    
    return result;
}

export async function updateMantenimientoController(id: number, body: {
    tipo: string;
    descripcion: string;
    acciones_realizadas?: string;
    repuestos_utilizados?: string;
    costo_estimado?: number;
    costo_real?: number;
    fecha_programada?: Date;
    fecha_realizacion?: Date;
    tecnico_id?: Tecnico;
    resultado?: string;
    observaciones?: string;
}) {
    const { tipo, descripcion, acciones_realizadas, repuestos_utilizados, costo_estimado, costo_real, fecha_programada, fecha_realizacion, tecnico_id, resultado, observaciones } = body;

    if ( !tipo && !descripcion && !acciones_realizadas && !repuestos_utilizados && !costo_estimado && !costo_real && !fecha_programada && !fecha_realizacion && !tecnico_id && !resultado && !observaciones ) {
        return { error: 'No se proporcionaron datos para actualizar el mantenimiento' };
    }

    const mantenimientoData: Partial<Mantenimiento> = {};
    if (tipo) mantenimientoData.tipo = tipo;
    if (descripcion) mantenimientoData.descripcion = descripcion;
    if (acciones_realizadas) mantenimientoData.acciones_realizadas = acciones_realizadas;
    if (repuestos_utilizados) mantenimientoData.repuestos_utilizados = repuestos_utilizados;
    if (costo_estimado) mantenimientoData.costo_estimado = costo_estimado;
    if (costo_real) mantenimientoData.costo_real = costo_real;
    if (fecha_programada) mantenimientoData.fecha_programada = fecha_programada;
    if (fecha_realizacion) mantenimientoData.fecha_realizacion = fecha_realizacion;
    if (tecnico_id) mantenimientoData.tecnico = tecnico_id;
    if (resultado) mantenimientoData.resultado = resultado;
    if (observaciones) mantenimientoData.observaciones = observaciones;

    const result = await updateMantenimientoService(id, mantenimientoData);
    if (!result) {
        return { error: 'Mantenimiento no encontrado' };
    }

    return result;
}

export async function deleteMantenimientoController(id: number) {
    const result = await deleteMantenimientoService(id);
    return result;
}