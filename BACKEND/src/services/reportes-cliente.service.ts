import { ReporteClienteRepository } from '@/repositories/reportes-cliente.repository';
import { MaquinaService } from './maquinas.service';

export interface ReporteClienteData {
  id?: number;
  maquina_id: number;
  usuario_id: number;
  descripcion: string;
  gravedad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  tipo: 'reporte_problema' | 'confirmacion_operativa';
  estado: 'pendiente' | 'procesado' | 'resuelto';
  estado_anterior?: string;
  nuevo_estado_sugerido?: string;
  fecha_reporte?: Date;
  fecha_procesado?: Date;
  observaciones_admin?: string;
}

export const ReporteClienteService = {
  async getReportes(id?: number, estado?: string) {
    return await ReporteClienteRepository.findAll(id, estado);
  },

  async createReporte(data: ReporteClienteData) {
    // Validar que la máquina existe
    const maquina = await MaquinaService.getMaquinas(data.maquina_id);
    if (!maquina) {
      throw new Error('Máquina no encontrada');
    }

    // Obtener el estado actual de la máquina
    const maquinaData = Array.isArray(maquina) ? maquina[0] : maquina;
    data.estado_anterior = maquinaData.estado;

    // Determinar el nuevo estado sugerido basado en la gravedad
    if (data.tipo === 'reporte_problema') {
      switch (data.gravedad) {
        case 'Crítica':
          data.nuevo_estado_sugerido = 'Fuera de Servicio';
          break;
        case 'Alta':
          data.nuevo_estado_sugerido = 'Fuera de Servicio'; // Cambiar de 'Error' a 'Fuera de Servicio'
          break;
        case 'Media':
          data.nuevo_estado_sugerido = 'Advertencia';
          break;
        case 'Baja':
          data.nuevo_estado_sugerido = 'En Mantenimiento';
          break;
        default:
          data.nuevo_estado_sugerido = 'En Mantenimiento';
      }

      // Actualizar automáticamente el estado de la máquina
      const notasReporte = `${maquinaData.notas || ''}\n[REPORTE CLIENTE - ${new Date().toLocaleString('es-ES')}]\nGravedad: ${data.gravedad}\nDescripción: ${data.descripcion}\nEstado anterior: ${data.estado_anterior} -> Nuevo estado: ${data.nuevo_estado_sugerido}\n---`;
      
      await MaquinaService.updateMaquinaEstado(
        data.maquina_id,
        data.nuevo_estado_sugerido,
        notasReporte
      );
    }

    // Crear el reporte
    const reporteId = await ReporteClienteRepository.create(data);
    
    return {
      id: reporteId,
      message: data.tipo === 'reporte_problema' 
        ? `Reporte enviado correctamente. Estado cambiado de "${data.estado_anterior}" a "${data.nuevo_estado_sugerido}".`
        : 'Confirmación enviada correctamente.',
      estado_anterior: data.estado_anterior,
      nuevo_estado: data.nuevo_estado_sugerido
    };
  },

  async updateReporte(data: { id: number; estado?: string; observaciones_admin?: string; fecha_procesado?: Date }) {
    return await ReporteClienteRepository.update(data);
  },

  async deleteReporte(id: number) {
    return await ReporteClienteRepository.delete(id);
  }
};