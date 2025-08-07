// Servicio para manejar reportes de máquinas
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const reporteService = {
  // Reportar problema en una máquina
  async reportarProblema(token, reporteData) {
    try {
      const { maquinaId, descripcion, gravedad } = reporteData;
      
      const requestBody = {
        maquina_id: maquinaId,
        descripcion: descripcion,
        gravedad: gravedad,
        tipo: 'reporte_problema',
        estado: 'pendiente'
      };
      
      console.log('Enviando POST a /api/reportes-cliente con:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/reportes-cliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el reporte');
      }

      const result = await response.json();
      console.log('Respuesta del backend:', result);
      
      return {
        success: true,
        message: result.message || 'Reporte enviado correctamente',
        estado_anterior: result.estado_anterior || result.estadoAnterior,
        nuevoEstado: result.nuevo_estado || result.nuevoEstado || result.estadoNuevo,
        nuevo_estado: result.nuevo_estado || result.nuevoEstado || result.estadoNuevo
      };
    } catch (error) {
      console.error('Error en reportarProblema:', error);
      throw error;
    }
  },

  // Marcar máquina como operativa (crear reporte de confirmación)
  async marcarComoOperativa(token, maquinaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reportes-cliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          maquina_id: maquinaId,
          descripcion: 'Cliente confirma que la máquina funciona correctamente',
          gravedad: 'Baja',
          tipo: 'confirmacion_operativa',
          estado: 'pendiente'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la confirmación');
      }

      const result = await response.json();
      return {
        success: true,
        message: result.message || 'Confirmación enviada correctamente'
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
  async obtenerReportesClientes(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reportes-cliente`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error en obtenerReportesClientes:', error);
      throw error;
    }
  },

  // Obtener reportes por estado
  async obtenerReportesPorEstado(token, estado) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reportes-cliente?estado=${estado}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error en obtenerReportesPorEstado:', error);
      throw error;
    }
  },

  // Actualizar reporte
  async actualizarReporte(token, reporteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reportes-cliente`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reporteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el reporte');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en actualizarReporte:', error);
      throw error;
    }
  }
};