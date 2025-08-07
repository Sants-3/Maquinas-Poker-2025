import { TecnicosRepository } from '@/repositories/tecnicos.repository';

export const TecnicosService = {
  async getTecnicos(activo?: boolean) {
    return await TecnicosRepository.findAll(activo);
  },

  async getTecnicoById(id: number) {
    return await TecnicosRepository.findById(id);
  }
};