import { getDataSource } from '@/lib/data-source';
import { Finanza } from '@/entity/Finanza';

export const FinanzaRepository = {
  async findAll() {
    const db = await getDataSource();
    return await db.getRepository(Finanza).find({
      relations: ['maquina', 'usuario', 'transaccion', 'ordenTrabajo'],
    });
  },

  async findById(id: number) {
    const db = await getDataSource();
    const finanza = await db.getRepository(Finanza).findOne({
      where: { id },
      relations: ['maquina', 'usuario', 'transaccion', 'ordenTrabajo'],
    });
    
    if (!finanza) {
      throw new Error(`Finanza con ID ${id} no encontrada.`);
    }
    return finanza;
  },

  async create(finanza: Partial<Finanza>) {
    const db = await getDataSource();
    return await db.getRepository(Finanza).save(finanza);
  },

  async update(id: number, finanzaData: Partial<Finanza>) {
    const db = await getDataSource();
    await db.getRepository(Finanza).update(id, finanzaData);
    return this.findById(id);
  },

  async delete(id: number) {
    const db = await getDataSource();
    const result = await db.getRepository(Finanza).delete(id);

    if (result.affected === 0) {
      throw new Error(`No se encontró la finanza con ID ${id} para eliminar.`);
    }
    return true;
  }
};