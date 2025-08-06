import { getDataSource } from "@/lib/data-source";
import { Ubicacion } from "@/entity/Ubicacion";

export const UbicacionRepository = {
  async findAll() {
    const db = await getDataSource();
    return db.getRepository(Ubicacion).find();
  },

  async findById(id: number) {
    const db = await getDataSource();
    return db.getRepository(Ubicacion).findOne({ where: { id } });
  }
};