import { getDataSource } from '@/lib/data-source';
import { ReporteCliente } from '@/entity/ReporteCliente';
import { Maquina } from '@/entity/Maquina';
import { User } from '@/entity/User';
import { ReporteClienteData } from '@/services/reportes-cliente.service';

export const ReporteClienteRepository = {
  async findAll(id?: number, estado?: string) {
    const db = await getDataSource();
    const repository = db.getRepository(ReporteCliente);
    
    const queryBuilder = repository.createQueryBuilder('reporte')
      .leftJoinAndSelect('reporte.maquina', 'maquina')
      .leftJoinAndSelect('reporte.cliente', 'cliente');
    
    if (id) {
      queryBuilder.andWhere('reporte.id = :id', { id });
    }
    
    if (estado) {
      queryBuilder.andWhere('reporte.estadoReporte = :estado', { estado });
    }
    
    queryBuilder.orderBy('reporte.fechaReporte', 'DESC');
    
    const reportes = await queryBuilder.getMany();
    
    // Obtener información adicional manualmente si es necesario
    for (const reporte of reportes) {
      // Si hay técnico asignado, obtener su información
      if (reporte.tecnicoAsignadoId) {
        const userRepository = db.getRepository(User);
        const tecnico = await userRepository.findOne({
          where: { id: reporte.tecnicoAsignadoId, rol: 'tecnico' }
        });
        if (tecnico) {
          (reporte as any).tecnicoAsignado = tecnico;
        }
      }
      
      // Si hay orden de trabajo, obtener su información básica
      if (reporte.ordenTrabajoId) {
        // Solo agregamos el ID por ahora, la información completa se obtiene en el endpoint de órdenes
        (reporte as any).ordenTrabajo = { id: reporte.ordenTrabajoId };
      }
    }
    
    return reportes;
  },

  async create(data: ReporteClienteData) {
    const db = await getDataSource();
    const repository = db.getRepository(ReporteCliente);
    
    const nuevoReporte = repository.create({
      maquinaId: data.maquina_id,
      clienteId: data.usuario_id,
      descripcion: data.descripcion,
      gravedad: data.gravedad,
      estadoAnterior: data.estado_anterior || 'Desconocido',
      estadoNuevo: data.nuevo_estado_sugerido || 'Fuera de Servicio',
      estadoReporte: data.estado || 'pendiente',
      fechaReporte: new Date()
    });
    
    const reporteGuardado = await repository.save(nuevoReporte);
    
    return reporteGuardado.id;
  },

  async update(data: { id: number; estado?: string; observaciones_admin?: string; fecha_procesado?: Date }) {
    const db = await getDataSource();
    const repository = db.getRepository(ReporteCliente);
    
    const reporte = await repository.findOne({ 
      where: { id: data.id },
      relations: ['maquina']
    });
    
    if (!reporte) {
      throw new Error('Reporte no encontrado');
    }
    
    if (data.estado) {
      reporte.estadoReporte = data.estado;
      
      // Si el reporte se marca como resuelto, actualizar el estado de la máquina a operativa
      if (data.estado === 'resuelto') {
        const maquinaRepository = db.getRepository(Maquina);
        const maquina = await maquinaRepository.findOne({ where: { id: reporte.maquinaId } });
        
        if (maquina) {
          maquina.estado = 'Operativo';
          maquina.notas = `Problema resuelto - Reporte #${reporte.id} completado el ${new Date().toLocaleDateString('es-ES')}`;
          await maquinaRepository.save(maquina);
        }
      }
    }
    
    if (data.observaciones_admin) {
      reporte.notasAdmin = data.observaciones_admin;
    }
    
    if (data.fecha_procesado) {
      reporte.fechaAsignacion = data.fecha_procesado;
    } else if (data.estado === 'procesado') {
      reporte.fechaAsignacion = new Date();
    }
    
    await repository.save(reporte);
    return true;
  },

  async delete(id: number) {
    const db = await getDataSource();
    const repository = db.getRepository(ReporteCliente);
    
    const result = await repository.delete(id);
    return result.affected! > 0;
  }
};