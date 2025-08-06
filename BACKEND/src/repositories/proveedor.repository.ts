import { getDataSource } from '@/lib/data-source';
import { Proveedor } from '@/entity/Proveedor';
import { Maquina } from '@/entity/Maquina';

export const ProveedorRepository = {
  async findAll() {
    const db = await getDataSource();
    return db.getRepository(Proveedor).find();
  },

  async findById(id: number) {
    const db = await getDataSource();
    return db.getRepository(Proveedor).findOneBy({ id });
  },

  async create(proveedor: Proveedor) {
    const db = await getDataSource();
    return db.getRepository(Proveedor).save(proveedor);
  },

  async update(proveedor: Proveedor) {
    const db = await getDataSource();
    return db.getRepository(Proveedor).save(proveedor);
  },

  async remove(proveedor: Proveedor) {
    const db = await getDataSource();
    await db.query(
      `UPDATE maquinas SET proveedor_id = NULL WHERE proveedor_id = @0`,
      [proveedor.id]
    );
    return db.getRepository(Proveedor).remove(proveedor);
  },
};