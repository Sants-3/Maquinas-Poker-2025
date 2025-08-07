// Servicio para manejar reportes de máquinas
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const reporteService = {
  // Reportar problema en una máquina
  async reportarProblema(token, reporteData) {
    try {
      const { maquinaId, descripcion, gravedad } = reporteData;
      
      // 1. Primero obtener los datos actuales de la máquina
      const maquinaResponse = await fetch(`${API_BASE_URL}/api/maquinas?id=${maquinaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!maquinaResponse.ok) {
        throw new Error('Error al obtener datos de la máquina');
      }

      const maquinas = await maquinaResponse.json();
      const maquina = Array.isArray(maquinas) ? maquinas.find(m => m.id === maquinaId) : maquinas;
      
      if (!maquina) {
        throw new Error('Máquina no encontrada');
      }

      // 2. Determinar el nuevo estado basado en la gravedad
      let nuevoEstado = maquina.estado;
      switch (gravedad) {
        case 'Crítica':
          nuevoEstado = 'Fuera de Servicio';
          break;
        case 'Alta':
          nuevoEstado = 'Error';
          break;
        case 'Media':
          nuevoEstado = 'Advertencia';
          break;
        case 'Baja':
          nuevoEstado = 'En Mantenimiento';
          break;
        default:
          nuevoEstado = 'En Mantenimiento';
      }

      // 3. Crear el texto del reporte para las notas
      const fechaReporte = new Date().toLocaleString('es-ES');
      const reporteTexto = `\n[REPORTE CLIENTE - ${fechaReporte}]\nGravedad: ${gravedad}\nDescripción: ${descripcion}\nEstado anterior: ${maquina.estado} -> Nuevo estado: ${nuevoEstado}\n---`;
      
      const notasActualizadas = `${maquina.notas || ''}${reporteTexto}`;

      // 4. Actualizar la máquina con el nuevo estado
      const updateMaquinaData = {
        id: maquina.id,
        estado: nuevoEstado,
        notas: notasActualizadas
      };

      const updateResponse = await fetch(`${API_BASE_URL}/api/maquinas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateMaquinaData)
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Error al actualizar máquina:', errorData);
        
        // Si falla la actualización, al menos guardar el reporte
        const reportesExistentes = JSON.parse(localStorage.getItem('reportes_clientes') || '[]');
        const nuevoReporte = {
          id: Date.now(),
          maquinaId: maquinaId,
          maquinaNombre: maquina.nombre,
          maquinaSerie: maquina.numero_serie,
          descripcion: descripcion,
          gravedad: gravedad,
          fecha: new Date().toISOString(),
          estado: 'pendiente',
          tipo: 'reporte_problema',
          estadoAnterior: maquina.estado,
          nuevoEstadoSugerido: nuevoEstado
        };
        
        reportesExistentes.push(nuevoReporte);
        localStorage.setItem('reportes_clientes', JSON.stringify(reportesExistentes));

        throw new Error(`No se pudo actualizar el estado de la máquina. ${errorData.error || 'Error desconocido'}. El reporte se ha guardado para revisión del administrador.`);
      }

      // 5. Si la actualización fue exitosa, también guardar el reporte
      const reportesExistentes = JSON.parse(localStorage.getItem('reportes_clientes') || '[]');
      const nuevoReporte = {
        id: Date.now(),
        maquinaId: maquinaId,
        maquinaNombre: maquina.nombre,
        maquinaSerie: maquina.numero_serie,
        descripcion: descripcion,
        gravedad: gravedad,
        fecha: new Date().toISOString(),
        estado: 'procesado',
        tipo: 'reporte_problema',
        estadoAnterior: maquina.estado,
        nuevoEstado: nuevoEstado
      };
      
      reportesExistentes.push(nuevoReporte);
      localStorage.setItem('reportes_clientes', JSON.stringify(reportesExistentes));

      return {
        success: true,
        message: `Reporte enviado correctamente. Estado cambiado de "${maquina.estado}" a "${nuevoEstado}".`,
        reporte: nuevoReporte,
        maquina: maquina,
        nuevoEstado: nuevoEstado
      };

    } catch (error) {
      console.error('Error en reportarProblema:', error);
      throw error;
    }
  },

  // Marcar máquina como operativa (crear reporte de confirmación)
  async marcarComoOperativa(token, maquinaId) {
    try {
      // 1. Obtener datos actuales de la máquina
      const maquinaResponse = await fetch(`${API_BASE_URL}/api/maquinas?id=${maquinaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!maquinaResponse.ok) {
        throw new Error('Error al obtener datos de la máquina');
      }

      const maquinas = await maquinaResponse.json();
      const maquina = Array.isArray(maquinas) ? maquinas.find(m => m.id === maquinaId) : maquinas;
      
      if (!maquina) {
        throw new Error('Máquina no encontrada');
      }

      // 2. Crear un registro de confirmación
      const fechaConfirmacion = new Date().toLocaleString('es-ES');
      const confirmacionTexto = `\n[CONFIRMACIÓN CLIENTE - ${fechaConfirmacion}]\nEl cliente confirma que la máquina está funcionando correctamente\nEstado actual: ${maquina.estado}\n---`;

      // 3. Simular el envío de la confirmación
      const reportesExistentes = JSON.parse(localStorage.getItem('reportes_clientes') || '[]');
      const nuevaConfirmacion = {
        id: Date.now(),
        maquinaId: maquinaId,
        maquinaNombre: maquina.nombre,
        maquinaSerie: maquina.numero_serie,
        descripcion: 'Cliente confirma que la máquina funciona correctamente',
        gravedad: 'Baja',
        fecha: new Date().toISOString(),
        estado: 'confirmado',
        tipo: 'confirmacion_operativa',
        estadoAnterior: maquina.estado
      };
      
      reportesExistentes.push(nuevaConfirmacion);
      localStorage.setItem('reportes_clientes', JSON.stringify(reportesExistentes));

      return {
        success: true,
        message: 'Confirmación enviada. El administrador podrá actualizar el estado de la máquina.',
        confirmacion: nuevaConfirmacion
      };

    } catch (error) {
      console.error('Error en marcarComoOperativa:', error);
      throw error;
    }
  },

  // Obtener máquinas del cliente
  async obtenerMaquinasCliente(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/maquinas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];

    } catch (error) {
      console.error('Error en obtenerMaquinasCliente:', error);
      throw error;
    }
  },

  // Obtener reportes de clientes (para el administrador)
  async obtenerReportesClientes() {
    try {
      const reportes = JSON.parse(localStorage.getItem('reportes_clientes') || '[]');
      return reportes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    } catch (error) {
      console.error('Error en obtenerReportesClientes:', error);
      return [];
    }
  },

  // Marcar reporte como procesado (para el administrador)
  async marcarReporteProcesado(reporteId) {
    try {
      const reportes = JSON.parse(localStorage.getItem('reportes_clientes') || '[]');
      const reporteIndex = reportes.findIndex(r => r.id === reporteId);
      
      if (reporteIndex !== -1) {
        reportes[reporteIndex].estado = 'procesado';
        reportes[reporteIndex].fechaProcesado = new Date().toISOString();
        localStorage.setItem('reportes_clientes', JSON.stringify(reportes));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error en marcarReporteProcesado:', error);
      throw error;
    }
  }
};