import { MaquinaRepository } from '@/repositories/maquinas.repository';
import { Maquina } from '@/entity/Maquina';

export const MaquinaService = {
  async getMaquinas(id?: number) {
    return id ? MaquinaRepository.findById(id) : MaquinaRepository.findAll();
  },

  async createMaquina(data: any) {
    const proveedor = await MaquinaRepository.findProveedorById(Number(data.proveedor_id));
    const ubicacion = await MaquinaRepository.findUbicacionById(Number(data.ultima_ubicacion_id));
    const usuario = await MaquinaRepository.findUsuarioById(Number(data.usuario_id));

    if (!proveedor || !ubicacion) throw new Error('Proveedor o ubicación no encontrada');

    const maquina = {
      ...data,
      proveedor: proveedor,
      ubicacion: ubicacion,
      usuario: usuario,
      modelo: data.modelo,
      nombre: data.nombre,
      notas: data.notas,
      estado: data.estado,
      numero_serie: data.numero_serie,
      fecha_adquisicion: new Date(data.fecha_adquisicion),
      fecha_instalacion: data.fecha_instalacion ? new Date(data.fecha_instalacion) : null,
      ultimo_mantenimiento: data.ultimo_mantenimiento ? new Date(data.ultimo_mantenimiento) : null,
      proximo_mantenimiento: data.proximo_mantenimiento ? new Date(data.proximo_mantenimiento) : null,
      creado_en: new Date(),
      actualizado_en: new Date()
    };

    return MaquinaRepository.create(maquina as Maquina);
  },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateMaquina(data: any) {
    const maquina = await MaquinaRepository.findById(data.id);
    const proveedor = await MaquinaRepository.findProveedorById(Number(data.proveedor_id));
    const ubicacion = await MaquinaRepository.findUbicacionById(Number(data.ultima_ubicacion_id));
    const usuario = await MaquinaRepository.findUsuarioById(Number(data.usuario_id));
    if (!maquina) throw new Error('Máquina no encontrada');

    const updatedMaquina = {
      ...data,
      proveedor: proveedor,
      ubicacion: ubicacion,
      usuario: usuario,
      modelo: data.modelo,
      nombre: data.nombre,
      notas: data.notas,
      estado: data.estado,
      numero_serie: data.numero_serie,
      fecha_adquisicion: new Date(data.fecha_adquisicion),
      fecha_instalacion: data.fecha_instalacion ? new Date(data.fecha_instalacion) : null,
      ultimo_mantenimiento: data.ultimo_mantenimiento ? new Date(data.ultimo_mantenimiento) : null,
      proximo_mantenimiento: data.proximo_mantenimiento ? new Date(data.proximo_mantenimiento) : null,
      creado_en: new Date(),
      actualizado_en: new Date()
    };

    Object.assign(maquina, updatedMaquina, { actualizado_en: new Date() });
    return MaquinaRepository.update(maquina);
  },

  async deleteMaquina(id: number) {
    const maquina = await MaquinaRepository.findById(id);
    if (!maquina) throw new Error('Máquina no encontrada');

    return MaquinaRepository.remove(maquina);
  }
};
