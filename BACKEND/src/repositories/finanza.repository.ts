import { getDataSource } from '@/lib/data-source';
import { Finanza } from '@/entity/Finanza';

export const FinanzaRepository = {
  async findAll() {
    const db = await getDataSource();
    return db.getRepository(Finanza).find({
      relations: ['maquina_id', 'usuario_id', 'transaccion_id', 'proveedor_id', 'orden_trabajo_id']
    });
  },

  async findById(id: number) {
    const db = await getDataSource();
    return db.getRepository(Finanza).findOne({
      where: { id },
      relations: ['maquina_id', 'usuario_id', 'transaccion_id', 'proveedor_id', 'orden_trabajo_id']
    });
  },

  async create(finanza: Finanza) {
    const db = await getDataSource();
    return db.getRepository(Finanza).save(finanza);
  },

  async update(finanza: Finanza) {
    const db = await getDataSource();
    return db.getRepository(Finanza).save(finanza);
  }
};
