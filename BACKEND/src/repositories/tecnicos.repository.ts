import { getDataSource } from '@/lib/data-source';
import { User } from '@/entity/User';

export const TecnicosRepository = {
  async findAll(activo?: boolean) {
    const db = await getDataSource();
    const repository = db.getRepository(User);
    
    const queryBuilder = repository.createQueryBuilder('usuario')
      .where('usuario.rol = :rol', { rol: 'tecnico' });
    
    if (activo !== undefined) {
      queryBuilder.andWhere('usuario.activo = :activo', { activo });
    }
    
    queryBuilder.orderBy('usuario.nombre', 'ASC');
    
    return await queryBuilder.getMany();
  },

  async findById(id: number) {
    const db = await getDataSource();
    const repository = db.getRepository(User);
    
    return await repository.findOne({
      where: { 
        id,
        rol: 'tecnico'
      }
    });
  }
};