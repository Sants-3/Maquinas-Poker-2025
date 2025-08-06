import { UbicacionRepository } from '@/repositories/ubicaciones.repository';

export const UbicacionService = {
  async getUbicaciones(id?: number) {
    return id ? UbicacionRepository.findById(id) : UbicacionRepository.findAll();
  },
};