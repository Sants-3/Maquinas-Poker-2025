import { Proveedor } from '@/entity/Proveedor';
import { ProveedorRepository } from '@/repositories/proveedor.repository';

export const ProveedorService = {
  async getProveedores(id?: number) { 
    return id ? ProveedorRepository.findById(id) : ProveedorRepository.findAll();
  },

  async createProveedor(data: Omit<Proveedor, 'id'>) { //Crea un nuevo tipo que tiene todas las propiedades de la entidad Proveedor excepto id
    // Validación adicional de email
    if (data.email) {
      const proveedores = await ProveedorRepository.findAll();
      const emailExistente = proveedores.find(p => p.email === data.email);
      if (emailExistente) {
        throw new Error('Ya existe un proveedor con este correo electrónico');
      }
    }
    return ProveedorRepository.create(data as Proveedor);
  },

  async updateProveedor(data: Proveedor) {
    const proveedor = await ProveedorRepository.findById(data.id);
    if (!proveedor) throw new Error('Proveedor no encontrado');
    Object.assign(proveedor, data);
    return ProveedorRepository.update(proveedor);
  },

  async deleteProveedor(id: number) {
    const proveedor = await ProveedorRepository.findById(id);
    if (!proveedor) throw new Error('Proveedor no encontrado');
    return ProveedorRepository.remove(proveedor);
  },
};