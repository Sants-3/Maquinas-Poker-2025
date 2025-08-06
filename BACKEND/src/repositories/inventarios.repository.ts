import { getDataSource } from '@/lib/data-source';
import { Inventario } from '@/entity/Inventario';

export const InventarioRepository = {
  async findAll() {
    const db = await getDataSource();
    return db.getRepository(Inventario).find({ relations: ['repuesto', 'ubicacion'] });
  },

  async findById(id: number) {
    const db = await getDataSource();
    return db.getRepository(Inventario).findOne({ where: { id }, relations: ['repuesto', 'ubicacion'] });
  },
}