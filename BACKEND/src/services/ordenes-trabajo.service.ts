import { OrdenesTrabajoRepository } from '@/repositories/ordenes-trabajo.repository';

export interface OrdenTrabajoData {
  id?: number;
  codigo?: string;
  maquinaId?: number;
  tecnicoId?: number;
  reporteClienteId?: number;
  tipo?: string;
  prioridad?: string;
  estado?: string;
  descripcion?: string;
  fechaCreacion?: Date;
  fechaAsignacion?: Date;
  fechaInicio?: Date;
  fechaFinalizacion?: Date;
  tiempoEstimado?: number;
  tiempoReal?: number;
  clienteNotificado?: boolean;
  firmaCliente?: string;
  fotoFinalizacion?: string;
  calificacionServicio?: number;
  comentariosCliente?: string;
  notasTecnico?: string;
}

export const OrdenesTrabajoService = {
  async getOrdenes(id?: number, estado?: string, tecnicoId?: number) {
    return await OrdenesTrabajoRepository.findAll(id, estado, tecnicoId);
  },

  async createOrden(data: OrdenTrabajoData) {
    // Generar código único para la orden
    const codigo = await this.generateCodigoOrden();
    
    const ordenData = {
      ...data,
      codigo,
      estado: data.estado || 'pendiente',
      fechaCreacion: new Date(),
      fechaAsignacion: new Date()
    };

    return await OrdenesTrabajoRepository.create(ordenData);
  },

  async createOrdenFromReporte(reporteId: number, tecnicoId: number, tiempoEstimado?: number) {
    // Obtener información del reporte
    const reporte = await OrdenesTrabajoRepository.getReporteById(reporteId);
    
    if (!reporte) {
      throw new Error('Reporte no encontrado');
    }

    // Determinar tipo y prioridad basado en la gravedad del reporte
    let tipo = 'correctivo';
    let prioridad = 'media';
    
    switch (reporte.gravedad) {
      case 'Crítica':
        prioridad = 'alta';
        break;
      case 'Alta':
        prioridad = 'alta';
        break;
      case 'Media':
        prioridad = 'media';
        break;
      case 'Baja':
        prioridad = 'baja';
        break;
    }

    const ordenData: OrdenTrabajoData = {
      maquinaId: reporte.maquinaId,
      tecnicoId,
      reporteClienteId: reporteId,
      tipo,
      prioridad,
      descripcion: `Orden generada desde reporte #${reporteId}: ${reporte.descripcion}`,
      tiempoEstimado: tiempoEstimado || this.estimarTiempoPorGravedad(reporte.gravedad)
    };

    const ordenId = await this.createOrden(ordenData);

    // Actualizar el reporte para vincularlo con la orden de trabajo
    await OrdenesTrabajoRepository.updateReporteOrdenTrabajo(reporteId, ordenId, tecnicoId);

    return ordenId;
  },

  async updateOrden(data: Partial<OrdenTrabajoData> & { id: number }) {
    return await OrdenesTrabajoRepository.update(data);
  },

  async deleteOrden(id: number) {
    return await OrdenesTrabajoRepository.delete(id);
  },

  async generateCodigoOrden(): Promise<string> {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    
    // Obtener el siguiente número secuencial del día
    const secuencial = await OrdenesTrabajoRepository.getNextSecuencial(fecha);
    
    return `OT${year}${month}${day}-${secuencial.toString().padStart(3, '0')}`;
  },

  estimarTiempoPorGravedad(gravedad: string): number {
    switch (gravedad) {
      case 'Crítica':
        return 4; // 4 horas
      case 'Alta':
        return 3; // 3 horas
      case 'Media':
        return 2; // 2 horas
      case 'Baja':
        return 1; // 1 hora
      default:
        return 2; // 2 horas por defecto
    }
  }
};