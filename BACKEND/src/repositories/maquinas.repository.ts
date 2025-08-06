import { getDataSource } from '@/lib/data-source';
import { Maquina } from '@/entity/Maquina';
import { Proveedor } from '@/entity/Proveedor';
import { Ubicacion } from '@/entity/Ubicacion';
import { User } from '@/entity/User';

export const MaquinaRepository = {
  async findAll() {
    const db = await getDataSource();
    return db.getRepository(Maquina).find({ relations: ['proveedor', 'ubicacion', 'usuario'] });
  },

  async findById(id: number) {
    const db = await getDataSource();
    return db.getRepository(Maquina).findOne({ where: { id }, relations: ['proveedor', 'ubicacion', 'usuario'] });
  },

  async create(maquina: Maquina) {
    const db = await getDataSource();
    return db.getRepository(Maquina).save(maquina);
  },

  async update(maquina: Maquina) {
    const db = await getDataSource();
    return db.getRepository(Maquina).save(maquina);
  },

  async remove(maquina: Maquina) {
    const db = await getDataSource();
    return db.getRepository(Maquina).remove(maquina);
  },

  async findProveedorById(id: number) {
    const db = await getDataSource();
    return db.getRepository(Proveedor).findOne({ where: { id } });
  },

  async findUbicacionById(id: number) {
    const db = await getDataSource();
    return db.getRepository(Ubicacion).findOne({ where: { id } });
  },

  async findUsuarioById(id: number){
    const db = await getDataSource();
    return db.getRepository(User).findOne({ where: { id } });
  }
};
