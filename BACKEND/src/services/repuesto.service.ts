import { Repuesto } from '@/entity/Repuesto';
import { RepuestoRepository } from '@/repositories/repuesto.repository';

export const RepuestoService = {
  async getRepuestos(id?: number) {
    return id ? RepuestoRepository.findById(id) : RepuestoRepository.findAll();
  },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createRepuesto(data: any) {
    const proveedor = await RepuestoRepository.findProveedorById(data.proveedor_id);
    if (!proveedor) throw new Error('Proveedor no encontrado');

    const nuevo = {
      ...data,
      proveedor,
      fecha_ultimo_reabastecimiento: data.fecha_ultimo_reabastecimiento
        ? new Date(data.fecha_ultimo_reabastecimiento)
        : null
    };

    return RepuestoRepository.create(nuevo as Repuesto);
  },

  async updateRepuesto(data: any) {
    const repuesto = await RepuestoRepository.findById(data.id);
    if (!repuesto) throw new Error('Repuesto no encontrado');

    Object.assign(repuesto, data);
    return RepuestoRepository.update(repuesto);
  },

  async deleteRepuesto(id: number) {
    const repuesto = await RepuestoRepository.findById(id);
    if (!repuesto) throw new Error('Repuesto no encontrado');

    return RepuestoRepository.remove(repuesto);
  }
};
