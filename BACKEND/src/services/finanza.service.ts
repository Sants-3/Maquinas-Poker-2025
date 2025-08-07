import { Finanza } from '@/entity/Finanza';
import { FinanzaRepository } from '@/repositories/finanza.repository';
import { getDataSource } from '@/lib/data-source';
import { Maquina } from '@/entity/Maquina';
import { User } from '@/entity/User';
import { Transaccion } from '@/entity/Transaccion';
import { OrdenTrabajo } from '@/entity/OrdenesTrabajo';

type FinanzaInput = {
  tipo_movimiento: string;
  monto: number;
  moneda: string;
  fecha_movimiento: Date | string;
  maquina_id: number;
  usuario_id: number;
  transaccion_id: number;
  orden_trabajo_id: number;
  referencia_externa?: string;
  notas?: string;
};

export const FinanzaService = {
  async getFinanzas() {
    return await FinanzaRepository.findAll();
  },

  async createFinanza(data: FinanzaInput) {
    const requiredFields = ['tipo_movimiento', 'monto', 'moneda', 'fecha_movimiento', 
                          'maquina_id', 'usuario_id', 'transaccion_id', 'orden_trabajo_id'];

    requiredFields.forEach(field => {
      if (data[field as keyof FinanzaInput] === undefined || data[field as keyof FinanzaInput] === null) {
        throw new Error(`Falta el campo requerido: ${field}`);
      }
    });

    const db = await getDataSource();

    // Obtener las entidades relacionadas
    const maquina = await db.getRepository(Maquina).findOneBy({ id: data.maquina_id });
    if (!maquina) throw new Error(`Máquina con ID ${data.maquina_id} no encontrada`);

    const usuario = await db.getRepository(User).findOneBy({ id: data.usuario_id });
    if (!usuario) throw new Error(`Usuario con ID ${data.usuario_id} no encontrado`);

    const transaccion = await db.getRepository(Transaccion).findOneBy({ id: data.transaccion_id });
    if (!transaccion) throw new Error(`Transacción con ID ${data.transaccion_id} no encontrada`);

    const ordenTrabajo = await db.getRepository(OrdenTrabajo).findOneBy({ id: data.orden_trabajo_id });
    if (!ordenTrabajo) throw new Error(`Orden de trabajo con ID ${data.orden_trabajo_id} no encontrada`);

    const nuevaFinanza: Partial<Finanza> = {
      tipo_movimiento: data.tipo_movimiento,
      monto: data.monto,
      moneda: data.moneda,
      fecha_movimiento: new Date(data.fecha_movimiento),
      maquina: maquina,
      usuario: usuario,
      transaccion: transaccion,
      ordenTrabajo: ordenTrabajo,
      referencia_externa: data.referencia_externa || '',
      notas: data.notas || ''
    };

    return await FinanzaRepository.create(nuevaFinanza);
  },

  async updateFinanza(id: number, data: Partial<FinanzaInput>) {
    if (!id || id <= 0) {
      throw new Error('ID de finanza inválido o faltante.');
    }

    const db = await getDataSource();
    const updateData: Partial<Finanza> = {};
    
    if (data.tipo_movimiento !== undefined) updateData.tipo_movimiento = data.tipo_movimiento;
    if (data.monto !== undefined) updateData.monto = data.monto;
    if (data.moneda !== undefined) updateData.moneda = data.moneda;
    if (data.fecha_movimiento !== undefined) updateData.fecha_movimiento = new Date(data.fecha_movimiento);
    
    // Manejo de relaciones en la actualización
    if (data.maquina_id !== undefined) {
      const maquina = await db.getRepository(Maquina).findOneBy({ id: data.maquina_id });
      if (!maquina) throw new Error(`Máquina con ID ${data.maquina_id} no encontrada`);
      updateData.maquina = maquina;
    }
    
    if (data.usuario_id !== undefined) {
      const usuario = await db.getRepository(User).findOneBy({ id: data.usuario_id });
      if (!usuario) throw new Error(`Usuario con ID ${data.usuario_id} no encontrado`);
      updateData.usuario = usuario;
    }
    
    if (data.transaccion_id !== undefined) {
      const transaccion = await db.getRepository(Transaccion).findOneBy({ id: data.transaccion_id });
      if (!transaccion) throw new Error(`Transacción con ID ${data.transaccion_id} no encontrada`);
      updateData.transaccion = transaccion;
    }
    
    if (data.orden_trabajo_id !== undefined) {
      const ordenTrabajo = await db.getRepository(OrdenTrabajo).findOneBy({ id: data.orden_trabajo_id });
      if (!ordenTrabajo) throw new Error(`Orden de trabajo con ID ${data.orden_trabajo_id} no encontrada`);
      updateData.ordenTrabajo = ordenTrabajo;
    }

    if (data.referencia_externa !== undefined) updateData.referencia_externa = data.referencia_externa;
    if (data.notas !== undefined) updateData.notas = data.notas;

    return await FinanzaRepository.update(id, updateData);
  },

  async deleteFinanza(id: number) {
    if (!id || id <= 0) {
      throw new Error('ID inválido para eliminar.');
    }
    return await FinanzaRepository.delete(id);
  }
};