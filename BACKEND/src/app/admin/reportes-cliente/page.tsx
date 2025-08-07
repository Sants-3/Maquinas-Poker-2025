"use client";
import { useState, useEffect } from 'react';

interface ReporteCliente {
  id: number;
  maquinaId: number;
  clienteId: number;
  descripcion: string;
  gravedad: string;
  estadoAnterior: string;
  estadoNuevo: string;
  estadoReporte: string;
  fechaReporte: string;
  fechaAsignacion?: string;
  tecnicoAsignadoId?: number;
  ordenTrabajoId?: number;
  notasAdmin?: string;
  creadoEn: string;
  actualizadoEn: string;
  maquina: {
    id: number;
    nombre: string;
    numero_serie: string;
    modelo: string;
    estado: string;
    notas: string;
  };
  cliente: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
  };
}

interface Tecnico {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
}

export default function ReportesClientePage() {
  const [reportes, setReportes] = useState<ReporteCliente[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReporteCliente | null>(null);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<number | null>(null);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(2);

  useEffect(() => {
    cargarReportes();
    cargarTecnicos();
  }, []);

  const cargarReportes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener token del localStorage (ajustar según tu implementación de auth)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('No se encontró token de autenticación');
        return;
      }

      const response = await fetch('http://localhost:4000/api/reportes-cliente', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Reportes cargados:', data);
      setReportes(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarTecnicos = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/tecnicos?activo=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTecnicos(data);
      }
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
    }
  };

  const actualizarEstadoReporte = async (id: number, nuevoEstado: string, notas?: string) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/reportes-cliente', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          estado: nuevoEstado,
          observaciones_admin: notas,
          fecha_procesado: new Date()
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el reporte');
      }

      // Recargar reportes
      await cargarReportes();
      
      const result = await response.json();
      alert(result.message || 'Reporte actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      alert('Error al actualizar el reporte');
    }
  };

  const abrirModalAsignar = (reporte: ReporteCliente) => {
    setReporteSeleccionado(reporte);
    setTecnicoSeleccionado(null);
    // Estimar tiempo basado en gravedad
    switch (reporte.gravedad) {
      case 'Crítica':
        setTiempoEstimado(4);
        break;
      case 'Alta':
        setTiempoEstimado(3);
        break;
      case 'Media':
        setTiempoEstimado(2);
        break;
      case 'Baja':
        setTiempoEstimado(1);
        break;
      default:
        setTiempoEstimado(2);
    }
    setShowAsignarModal(true);
  };

  const asignarTecnico = async () => {
    // Validaciones previas
    if (!reporteSeleccionado || !tecnicoSeleccionado) {
      alert('Debe seleccionar un técnico');
      return;
    }

    if (!tiempoEstimado || tiempoEstimado <= 0) {
      alert('Debe especificar un tiempo estimado válido');
      return;
    }

    // Validar que el técnico seleccionado existe en la lista
    const tecnicoValido = tecnicos.find(t => t.id === Number(tecnicoSeleccionado));
    if (!tecnicoValido) {
      alert('El técnico seleccionado no es válido');
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/ordenes-trabajo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reporteId: reporteSeleccionado.id,
          tecnicoId: Number(tecnicoSeleccionado),
          tiempoEstimado
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Error al crear la orden de trabajo';
        throw new Error(errorMessage);
      }

      // Recargar reportes
      await cargarReportes();
      setShowAsignarModal(false);
      setTecnicoSeleccionado(null);
      setTiempoEstimado(0);
      alert(`Técnico ${tecnicoValido.nombre} asignado correctamente`);
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      
      // Manejo específico de errores
      if (error.message.includes('no existe')) {
        alert('El técnico seleccionado no existe en el sistema');
      } else if (error.message.includes('no es un técnico')) {
        alert('El usuario seleccionado no tiene permisos de técnico');
      } else {
        alert('Error al asignar el técnico: ' + error.message);
      }
    }
  };

  const eliminarReporte = async (reporteId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este reporte? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/reportes-cliente', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: reporteId })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar reporte');
      }

      await cargarReportes();
      alert('Reporte eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      alert('Error al eliminar el reporte');
    }
  };

  const reportesFiltrados = reportes.filter(reporte => {
    if (filtroEstado === 'todos') return true;
    return reporte.estadoReporte === filtroEstado;
  });

  console.log('Reportes filtrados para mostrar:', reportesFiltrados);
  console.log('Filtro actual:', filtroEstado);

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-warning text-dark';
      case 'procesado': return 'bg-info';
      case 'resuelto': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getGravedadBadgeClass = (gravedad: string) => {
    switch (gravedad) {
      case 'Crítica': return 'bg-danger';
      case 'Alta': return 'bg-warning text-dark';
      case 'Media': return 'bg-info';
      case 'Baja': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getMaquinaEstadoBadgeClass = (estado: string) => {
    const estadoLower = estado?.toLowerCase() || '';
    switch (estadoLower) {
      case 'operativo': 
      case 'operativa': return 'bg-success';
      case 'mantenimiento': return 'bg-warning text-dark';
      case 'fuera de servicio': 
      case 'fuera_de_servicio': return 'bg-danger';
      case 'en reparacion':
      case 'en_reparacion': return 'bg-info';
      case 'inactiva':
      case 'inactivo': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando reportes de clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={cargarReportes}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-1">
            <i className="bi bi-chat-square-text me-2 text-primary"></i>
            Reportes de Clientes
          </h1>
          <p className="text-muted">Gestiona los reportes enviados por los clientes</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={cargarReportes}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Actualizar
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{reportes.length}</h3>
              <small>Total Reportes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h3 className="mb-1">{reportes.filter(r => r.estadoReporte === 'pendiente').length}</h3>
              <small>Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{reportes.filter(r => r.estadoReporte === 'procesado').length}</h3>
              <small>Procesados</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{reportes.filter(r => r.estadoReporte === 'resuelto').length}</h3>
              <small>Resueltos</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Filtrar por Estado:</label>
              <select 
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="procesado">Procesados</option>
                <option value="resuelto">Resueltos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Reportes */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            Reportes de Clientes ({reportesFiltrados.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {reportesFiltrados.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Máquina</th>
                    <th>Estado Actual</th>
                    <th>Gravedad</th>
                    <th>Estado</th>
                    <th>Descripción</th>
                    <th>Cambio de Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reportesFiltrados.map(reporte => (
                    <tr key={reporte.id}>
                      <td>#{reporte.id}</td>
                      <td>
                        {new Date(reporte.fechaReporte).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <div>
                          <strong>{reporte.cliente.nombre}</strong>
                          <br />
                          <small className="text-muted">{reporte.cliente.email}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{reporte.maquina.nombre}</strong>
                          <br />
                          <small className="text-muted">Serie: {reporte.maquina.numero_serie}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getMaquinaEstadoBadgeClass(reporte.maquina.estado)}`}>
                          {reporte.maquina.estado}
                        </span>
                        {reporte.estadoReporte === 'resuelto' && (reporte.maquina.estado?.toLowerCase() === 'operativo' || reporte.maquina.estado?.toLowerCase() === 'operativa') && (
                          <div className="mt-1">
                            <small className="text-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Restaurada
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getGravedadBadgeClass(reporte.gravedad)}`}>
                          {reporte.gravedad}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoBadgeClass(reporte.estadoReporte)}`}>
                          {reporte.estadoReporte}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {reporte.descripcion}
                        </div>
                      </td>
                      <td>
                        <small>
                          <strong>De:</strong> {reporte.estadoAnterior}
                          <br />
                          <strong>A:</strong> {reporte.estadoNuevo}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group-vertical btn-group-sm">
                          {/* Botones según el estado del reporte */}
                          {reporte.estadoReporte === 'pendiente' && !reporte.tecnicoAsignadoId && (
                            <>
                              <button
                                className="btn btn-primary btn-sm mb-1"
                                onClick={() => abrirModalAsignar(reporte)}
                              >
                                <i className="bi bi-person-plus me-1"></i>
                                Asignar Técnico
                              </button>
                              <button
                                className="btn btn-outline-info btn-sm mb-1"
                                onClick={() => actualizarEstadoReporte(reporte.id, 'procesado', 'Reporte revisado por el administrador')}
                              >
                                <i className="bi bi-eye me-1"></i>
                                Marcar Procesado
                              </button>
                              <button
                                className="btn btn-outline-success btn-sm mb-1"
                                onClick={() => actualizarEstadoReporte(reporte.id, 'resuelto', 'Problema resuelto')}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Marcar Resuelto
                              </button>
                            </>
                          )}
                          
                          {reporte.estadoReporte === 'pendiente' && reporte.tecnicoAsignadoId && (
                            <>
                              <div className="text-center mb-2">
                                <small className="text-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Técnico Asignado
                                </small>
                                <br />
                                <small className="text-muted">
                                  Orden #{reporte.ordenTrabajoId}
                                </small>
                              </div>
                              <button
                                className="btn btn-outline-success btn-sm mb-1"
                                onClick={() => actualizarEstadoReporte(reporte.id, 'resuelto', 'Problema resuelto')}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Marcar Resuelto
                              </button>
                            </>
                          )}
                          
                          {reporte.estadoReporte === 'procesado' && (
                            <button
                              className="btn btn-outline-success btn-sm mb-1"
                              onClick={() => actualizarEstadoReporte(reporte.id, 'resuelto', 'Problema resuelto')}
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Marcar Resuelto
                            </button>
                          )}
                          
                          {reporte.estadoReporte === 'resuelto' && (
                            <div className="text-center mb-2">
                              <small className="text-success">
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Resuelto
                              </small>
                            </div>
                          )}
                          
                          {/* Botón de eliminar - siempre visible */}
                          <button
                            className="btn btn-danger btn-sm mt-2"
                            onClick={() => eliminarReporte(reporte.id)}
                            title="Eliminar reporte"
                          >
                            <i className="bi bi-trash me-1"></i>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-chat-square-text display-1 text-muted mb-3"></i>
              <h5 className="text-muted">No hay reportes</h5>
              <p className="text-muted">No se encontraron reportes con los filtros aplicados</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Asignar Técnico */}
      {showAsignarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>
                  Asignar Técnico al Reporte
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAsignarModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {reporteSeleccionado && (
                  <>
                    {/* Información del Reporte */}
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Información del Reporte</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>ID:</strong> #{reporteSeleccionado.id}</p>
                            <p><strong>Cliente:</strong> {reporteSeleccionado.cliente.nombre}</p>
                            <p><strong>Máquina:</strong> {reporteSeleccionado.maquina.nombre}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Gravedad:</strong> 
                              <span className={`badge ms-2 ${getGravedadBadgeClass(reporteSeleccionado.gravedad)}`}>
                                {reporteSeleccionado.gravedad}
                              </span>
                            </p>
                            <p><strong>Estado Anterior:</strong> {reporteSeleccionado.estadoAnterior}</p>
                            <p><strong>Estado Nuevo:</strong> {reporteSeleccionado.estadoNuevo}</p>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-12">
                            <p><strong>Descripción:</strong></p>
                            <p className="text-muted">{reporteSeleccionado.descripcion}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selección de Técnico */}
                    <div className="row">
                      <div className="col-md-8">
                        <label className="form-label">Seleccionar Técnico:</label>
                        <select 
                          className="form-select"
                          value={tecnicoSeleccionado || ''}
                          onChange={(e) => setTecnicoSeleccionado(Number(e.target.value))}
                        >
                          <option value="">Seleccione un técnico...</option>
                          {tecnicos.map(tecnico => (
                            <option key={tecnico.id} value={tecnico.id}>
                              {tecnico.nombre} - {tecnico.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Tiempo Estimado (horas):</label>
                        <input
                          type="number"
                          className="form-control"
                          value={tiempoEstimado}
                          onChange={(e) => setTiempoEstimado(Number(e.target.value))}
                          min="0.5"
                          max="24"
                          step="0.5"
                        />
                      </div>
                    </div>

                    {tecnicoSeleccionado && (
                      <div className="alert alert-info mt-3">
                        <h6>Se creará una orden de trabajo con:</h6>
                        <ul className="mb-0">
                          <li>Técnico asignado: {tecnicos.find(t => t.id === tecnicoSeleccionado)?.nombre}</li>
                          <li>Tiempo estimado: {tiempoEstimado} horas</li>
                          <li>Prioridad: {reporteSeleccionado.gravedad === 'Crítica' || reporteSeleccionado.gravedad === 'Alta' ? 'Alta' : reporteSeleccionado.gravedad === 'Media' ? 'Media' : 'Baja'}</li>
                          <li>El reporte pasará a estado "Procesado"</li>
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAsignarModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={asignarTecnico}
                  disabled={!tecnicoSeleccionado}
                >
                  <i className="bi bi-check-lg me-1"></i>
                  Asignar y Crear Orden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}