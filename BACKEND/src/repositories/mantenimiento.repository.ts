import { getDataSource } from "@/lib/data-source";
import { Mantenimiento } from "@/entity/Mantenimiento";
import { OrdenTrabajo } from "@/entity/OrdenesTrabajo";
import { Tecnico } from "@/entity/Tecnico";

export async function findAllMantenimientosRepository() {
    const db = await getDataSource();
    const mantenimientoRepository = db.getRepository(Mantenimiento);
    return mantenimientoRepository.find({ relations: ['orden_trabajo',
        'tecnico_id'
    ] });
}

export async function findOrdenByIdRepository(id: number) {
    const db = await getDataSource();
    const ordenRepository = db.getRepository(OrdenTrabajo);
    return ordenRepository.findOne({ where: { id } });
}

export async function findTecnicoByIdRepository(id: number) {
    const db = await getDataSource();
    const tecnicoRepository = db.getRepository(Tecnico);
    return tecnicoRepository.findOne({ where: { id } });
}

export async function createMantenimientoRepository(data: Partial<Mantenimiento>) {
    const db = await getDataSource();
    const mantenimientoRepository = db.getRepository(Mantenimiento);
    const newMantenimiento = mantenimientoRepository.create(data);
    return mantenimientoRepository.save(newMantenimiento);
}

export async function updateMantenimientoRepository(id: number, data: Partial<Mantenimiento>) {
    const db = await getDataSource();
    const mantenimientoRepository = db.getRepository(Mantenimiento);
    const mantenimiento = await mantenimientoRepository.findOne({ where: { id } });

    if (!mantenimiento) return { error: 'Mantenimiento no encontrado' };
    await mantenimientoRepository.update(id, data);
    return mantenimientoRepository.findOne({ where: { id } });
}

export async function deleteMantenimientoRepository(id: number) {
    const db = await getDataSource();
    const mantenimientoRepository = db.getRepository(Mantenimiento);
    const mantenimiento = await mantenimientoRepository.findOne({ where: { id } });
    if (!mantenimiento) return { error: 'Mantenimiento no encontrado' };

    return mantenimientoRepository.remove(mantenimiento);
}