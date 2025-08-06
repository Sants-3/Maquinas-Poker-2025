import { FinanzaRepository } from '@/repositories/finanza.repository';
import { Finanza } from '@/entity/Finanza';
import { FinanzaDTO } from '@/intrerface/finanza_input';

export const FinanzaService = {
  async getFinanzas() {
    return FinanzaRepository.findAll();
  },

  async createFinanza(data: FinanzaDTO) {
    if (!data.tipo_movimiento || !data.descripcion || !data.monto || !data.moneda) {
    throw new Error('Faltan campos obligatorios');
  }

    const nueva = {
      tipo_movimiento: data.tipo_movimiento,
      descripcion: data.descripcion,
      monto: data.monto,
      moneda: data.moneda,
      fecha_movimiento: new Date(data.fecha_movimiento),
      maquina_id: { id: data.maquina_id },
      usuario_id: { id: data.usuario_id },
      transaccion_id: { id: data.transaccion_id },
      proveedor_id: { id: data.proveedor_id },
      orden_trabajo_id: { id: data.orden_trabajo_id },
      referencia_externa: data.referencia_externa,
      notas: data.notas,
      creado_en: new Date(),
      actualizado_en: new Date()
    };

    return FinanzaRepository.create(nueva as Finanza);
  },

  async updateFinanza(data: Partial<FinanzaDTO> & { id: number }) {
    const finanza = await FinanzaRepository.findById(data.id);
    if (!finanza) throw new Error('Registro financiero no encontrado');

    if (data.monto !== undefined) finanza.monto = data.monto;
    if (data.descripcion !== undefined) finanza.descripcion = data.descripcion;
    if (data.moneda !== undefined) finanza.moneda = data.moneda;
    if (data.notas !== undefined) finanza.notas = data.notas;

    finanza.actualizado_en = new Date();

    return FinanzaRepository.update(finanza);
  }
};