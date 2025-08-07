import { getDataSource } from '@/lib/data-source';
import { OrdenTrabajo } from '@/entity/OrdenesTrabajo';
import { ReporteCliente } from '@/entity/ReporteCliente';
import { OrdenTrabajoData } from '@/services/ordenes-trabajo.service';

export const OrdenesTrabajoRepository = {
  async findAll(id?: number, estado?: string, tecnicoId?: number) {
    const db = await getDataSource();
    const repository = db.getRepository(OrdenTrabajo);
    
    const queryBuilder = repository.createQueryBuilder('orden')
      .leftJoinAndSelect('orden.maquina', 'maquina')
      .leftJoinAndSelect('orden.tecnico', 'tecnico');
    
    if (id) {
      queryBuilder.andWhere('orden.id = :id', { id });
    }
    
    if (estado) {
      queryBuilder.andWhere('orden.estado = :estado', { estado });
    }
    
    if (tecnicoId) {
      queryBuilder.andWhere('orden.tecnicoId = :tecnicoId', { tecnicoId });
    }
    
    queryBuilder.orderBy('orden.fechaCreacion', 'DESC');
    
    const ordenes = await queryBuilder.getMany();
    
    // Obtener información de reportes manualmente si es necesario
    for (const orden of ordenes) {
      if (orden.reporteClienteId) {
        const reporteRepository = db.getRepository(ReporteCliente);
        const reporte = await reporteRepository.findOne({
          where: { id: orden.reporteClienteId },
          relations: ['cliente']
        });
        if (reporte) {
          (orden as any).reporteCliente = reporte;
        }
      }
    }
    
    return ordenes;
  },

  async create(data: OrdenTrabajoData) {
    const db = await getDataSource();
    const repository = db.getRepository(OrdenTrabajo);
    
    // Validar que el técnico existe y tiene rol de técnico
    if (data.tecnicoId) {
      // Primero verificar si el usuario existe
      const usuarioExists = await db.query(
        'SELECT id, nombre, rol FROM usuarios WHERE id = @0',
        [data.tecnicoId]
      );
      
      if (usuarioExists.length === 0) {
        throw new Error(`El usuario con ID ${data.tecnicoId} no existe`);
      }
      
      // Verificar si tiene rol de técnico
      if (usuarioExists[0].rol !== 'tecnico') {
        throw new Error(`El usuario ${usuarioExists[0].nombre} (ID: ${data.tecnicoId}) no es un técnico. Rol actual: ${usuarioExists[0].rol}`);
      }
      
      console.log(`✅ Técnico validado: ${usuarioExists[0].nombre} (ID: ${data.tecnicoId})`);
    }
    
    // Validar que la máquina existe
    if (data.maquinaId) {
      const maquinaExists = await db.query(
        'SELECT COUNT(*) as count FROM maquinas WHERE id = @0',
        [data.maquinaId]
      );
      
      if (maquinaExists[0].count === 0) {
        throw new Error(`La máquina con ID ${data.maquinaId} no existe`);
      }
    }
    
    const nuevaOrden = repository.create({
      codigo: data.codigo || 'TEMP',
      maquinaId: data.maquinaId,
      tecnicoId: data.tecnicoId,
      reporteClienteId: data.reporteClienteId,
      tipo: data.tipo || 'correctivo',
      prioridad: data.prioridad || 'media',
      estado: data.estado || 'pendiente',
      descripcion: data.descripcion || 'Sin descripción',
      fechaCreacion: data.fechaCreacion || new Date(),
      fechaAsignacion: data.fechaAsignacion || new Date(),
      tiempoEstimado: data.tiempoEstimado
    });
    
    const ordenGuardada = await repository.save(nuevaOrden);
    return ordenGuardada.id;
  },

  async update(data: Partial<OrdenTrabajoData> & { id: number }) {
    const db = await getDataSource();
    const repository = db.getRepository(OrdenTrabajo);
    
    const orden = await repository.findOne({ where: { id: data.id } });
    
    if (!orden) {
      throw new Error('Orden de trabajo no encontrada');
    }
    
    // Actualizar campos
    if (data.estado) orden.estado = data.estado;
    if (data.descripcion) orden.descripcion = data.descripcion;
    if (data.fechaInicio) orden.fecha_inicio = data.fechaInicio;
    if (data.fechaFinalizacion) orden.fecha_finalizacion = data.fechaFinalizacion;
    if (data.tiempoReal) orden.tiempo_real = data.tiempoReal;
    if (data.notasTecnico) orden.notas_tecnico = data.notasTecnico;
    if (data.calificacionServicio) orden.calificacion_servicio = data.calificacionServicio;
    if (data.comentariosCliente) orden.comentarios_cliente = data.comentariosCliente;
    
    await repository.save(orden);
    return true;
  },

  async delete(id: number) {
    const db = await getDataSource();
    const repository = db.getRepository(OrdenTrabajo);
    
    const result = await repository.delete(id);
    return result.affected! > 0;
  },

  async getReporteById(reporteId: number) {
    const db = await getDataSource();
    const repository = db.getRepository(ReporteCliente);
    
    return await repository.findOne({
      where: { id: reporteId },
      relations: ['maquina', 'cliente']
    });
  },

  async updateReporteOrdenTrabajo(reporteId: number, ordenTrabajoId: number, tecnicoId: number) {
    const db = await getDataSource();
    const repository = db.getRepository(ReporteCliente);
    
    const reporte = await repository.findOne({ where: { id: reporteId } });
    
    if (!reporte) {
      throw new Error('Reporte no encontrado');
    }
    
    reporte.ordenTrabajoId = ordenTrabajoId;
    reporte.tecnicoAsignadoId = tecnicoId;
    reporte.estadoReporte = 'procesado';
    reporte.fechaAsignacion = new Date();
    
    await repository.save(reporte);
    return true;
  },

  async getNextSecuencial(fecha: Date): Promise<number> {
    const db = await getDataSource();
    const repository = db.getRepository(OrdenTrabajo);
    
    const year = fecha.getFullYear().toString().slice(-2);
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    
    const prefijo = `OT${year}${month}${day}`;
    
    const ultimaOrden = await repository
      .createQueryBuilder('orden')
      .where('orden.codigo LIKE :prefijo', { prefijo: `${prefijo}%` })
      .orderBy('orden.codigo', 'DESC')
      .getOne();
    
    if (!ultimaOrden) {
      return 1;
    }
    
    // Extraer el número secuencial del código
    const partes = ultimaOrden.codigo.split('-');
    if (partes.length === 2) {
      const secuencial = parseInt(partes[1]);
      return secuencial + 1;
    }
    
    return 1;
  }
};