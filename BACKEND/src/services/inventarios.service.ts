import { InventarioRepository } from '@/repositories/inventarios.repository';

export const InventarioService = {
  async getInventario(id?: number) {
    return id ? InventarioRepository.findById(id) : InventarioRepository.findAll();
  },
}