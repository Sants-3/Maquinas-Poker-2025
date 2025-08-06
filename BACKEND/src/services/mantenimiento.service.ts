import { findAllMantenimientosRepository, createMantenimientoRepository,
    updateMantenimientoRepository, deleteMantenimientoRepository,
    findOrdenByIdRepository,
    findTecnicoByIdRepository
 } from '@/repositories/mantenimiento.repository';

 export async function getAllMantenimientosService() {
    return await findAllMantenimientosRepository();
 }

 export async function createMantenimientoService(body: {
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
    const orden = await findOrdenByIdRepository(body.orden_trabajo_id);
    if (!orden) return { error: "Orden de trabajo no encontrada." };
    if (orden.estado !== "abierta") return { error: "La orden no está activa." };

    const tecnico = await findTecnicoByIdRepository(body.tecnico_id);
    if (!tecnico) return { error: "Técnico no encontrado." };

    if (body.fecha_realizacion < body.fecha_programada) {
        return { error: "La fecha de realización no puede ser anterior a la programada." };
    }

    if (body.costo_estimado < 0 || body.costo_real < 0) {
        return { error: "Los costos no pueden ser negativos." };
    }

    const result = await createMantenimientoRepository(body);

    return { result };
}

export async function updateMantenimientoService(id: number, body: {
    orden_trabajo_id?: number;
    tipo?: string;
    descripcion?: string;
    acciones_realizadas?: string;
    repuestos_utilizados?: string;
    costo_estimado?: number;
    costo_real?: number;
    fecha_programada?: Date;
    fecha_realizacion?: Date;
    tecnico_id?: number;
    resultado?: string;
    observaciones?: string;
}) {
    const updatedMantenimiento = await updateMantenimientoRepository(id, body);
    if (!updatedMantenimiento) {
        return { error: 'No se pudo actualizar el mantenimiento' };
    }
    return updatedMantenimiento;
}

export async function deleteMantenimientoService(id: number) {
    const deletedMantenimiento = await deleteMantenimientoRepository(id);
    if (!deletedMantenimiento) {
        return { error: 'No se pudo eliminar el mantenimiento' };
    }
    return deletedMantenimiento;
}