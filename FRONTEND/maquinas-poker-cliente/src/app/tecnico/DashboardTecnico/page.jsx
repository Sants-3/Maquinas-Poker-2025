'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const estadoColors = {
  'pendiente': 'warning',
  'asignada': 'info',
  'en_proceso': 'primary',
  'completada': 'success',
  'cancelada': 'danger'
};

const estadoIcons = {
  'pendiente': 'bi-clock',
  'asignada': 'bi-person-check',
  'en_proceso': 'bi-gear',
  'completada': 'bi-check-circle',
  'cancelada': 'bi-x-circle'
};

const prioridadColors = {
  'baja': 'success',
  'media': 'warning',
  'alta': 'danger',
  'critica': 'dark'
};

const tipoColors = {
  'preventivo': 'info',
  'correctivo': 'warning',
  'emergencia': 'danger'
};

export default function DashboardTecnico() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletarModal, setShowCompletarModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [notasTecnico, setNotasTecnico] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'tecnico') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && session?.user?.id) {
      cargarOrdenes();
    }
  }, [status, session]);

  const cargarOrdenes = async () => {
    try {
      setIsLoading(true);
      
      // Usar el endpoint correcto con el parámetro tecnicoId
      const response = await fetch(`http://localhost:4000/api/ordenes-trabajo?tecnicoId=${session.user.id}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const ordenesData = await response.json();
        setOrdenes(ordenesData || []);
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      toast.error('Error al cargar las órdenes de trabajo: ' + error.message);
      setOrdenes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstado = async (ordenId, nuevoEstado, notas = '') => {
    try {
      const response = await fetch(`http://localhost:4000/api/ordenes-trabajo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: ordenId,
          estado: nuevoEstado,
          notasTecnico: notas,
          fechaCompletado: nuevoEstado === 'completada' ? new Date().toISOString() : null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Actualizar estado local
      setOrdenes(prev => prev.map(orden => 
        orden.id === ordenId 
          ? { 
              ...orden, 
              estado: nuevoEstado,
              notasTecnico: notas,
              fechaCompletado: nuevoEstado === 'completada' ? new Date().toISOString() : orden.fechaCompletado
            }
          : orden
      ));

      const estadoTexto = nuevoEstado === 'en_proceso' ? 'En Proceso' : 
                         nuevoEstado === 'completada' ? 'Completada' : nuevoEstado;
      
      toast.success(`Orden marcada como ${estadoTexto}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al actualizar el estado: ' + error.message);
    }
  };

  const handleCompletarOrden = async () => {
    if (!ordenSeleccionada) return;

    try {
      await handleCambiarEstado(ordenSeleccionada.id, 'completada', notasTecnico);
      
      // Si la orden tiene un reporte asociado, marcarlo como resuelto
      if (ordenSeleccionada.reporteClienteId) {
        await marcarReporteResuelto(ordenSeleccionada.reporteClienteId);
      }
      
      setShowCompletarModal(false);
      setNotasTecnico('');
      setOrdenSeleccionada(null);
    } catch (error) {
      console.error('Error al completar orden:', error);
    }
  };

  // Nueva función para marcar reporte como resuelto (igual que el admin)
  const marcarReporteResuelto = async (reporteId, observaciones = 'Problema resuelto por el técnico') => {
    try {
      const response = await fetch(`http://localhost:4000/api/reportes-cliente`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: reporteId,
          estado: 'resuelto',
          observaciones_admin: observaciones,
          fecha_procesado: new Date()
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el reporte');
      }

      toast.success('Reporte marcado como resuelto');
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      toast.error('Error al actualizar el reporte: ' + error.message);
    }
  };

  // Función para marcar reporte como resuelto directamente desde la tabla
  const handleMarcarReporteResuelto = async (orden) => {
    if (!orden.reporteClienteId) {
      toast.warning('Esta orden no tiene un reporte asociado');
      return;
    }

    if (confirm('¿Está seguro de que desea marcar el reporte como resuelto?')) {
      await marcarReporteResuelto(orden.reporteClienteId, `Problema resuelto por el técnico ${session.user.name}`);
      // Recargar órdenes para reflejar cambios
      await cargarOrdenes();
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || orden.estado === filtroEstado;
    const cumpleFiltroPrioridad = filtroPrioridad === 'todos' || orden.prioridad?.toLowerCase() === filtroPrioridad;
    return cumpleFiltroEstado && cumpleFiltroPrioridad;
  });

  const contadores = {
    total: ordenes.length,
    pendientes: ordenes.filter(o => o.estado === 'pendiente' || o.estado === 'asignada').length,
    en_proceso: ordenes.filter(o => o.estado === 'en_proceso').length,
    completadas: ordenes.filter(o => o.estado === 'completada').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando dashboard...</h5>
        </div>
      </div>
    );
  }

  // DEBUG TEMPORAL
  console.log('Órdenes cargadas:', ordenes.map(o => ({
    id: o.id,
    reporteClienteId: o.reporteClienteId,
    estado: o.estado
  })));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="h2 mb-1 text-dark">
              <i className="bi bi-tools me-2" style={{ color: '#6f42c1' }}></i>
              Dashboard del Técnico
            </h1>
            <p className="text-muted mb-0">
              Bienvenido, {session?.user?.name}. Gestiona tus órdenes de trabajo asignadas
            </p>
          </div>
          <div className="col-auto">
            <button 
              className="btn btn-outline-primary"
              onClick={cargarOrdenes}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Pendientes</h6>
                  <i className="bi bi-clock-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{contadores.pendientes}</h2>
                <small className="opacity-75">Órdenes por atender</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">En Proceso</h6>
                  <i className="bi bi-gear-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{contadores.en_proceso}</h2>
                <small className="opacity-75">Trabajos activos</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Completadas</h6>
                  <i className="bi bi-check-circle-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{contadores.completadas}</h2>
                <small className="opacity-75">Trabajos finalizados</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <div className="card-body text-dark">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Total</h6>
                  <i className="bi bi-list-task fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{contadores.total}</h2>
                <small className="opacity-75">Órdenes asignadas</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card border-0 shadow-sm mb-4">
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
                  <option value="asignada">Asignadas</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completada">Completadas</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Filtrar por Prioridad:</label>
                <select 
                  className="form-select"
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                >
                  <option value="todos">Todas las prioridades</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setFiltroEstado('todos');
                    setFiltroPrioridad('todos');
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-list-task me-2"></i>
              Mis Órdenes de Trabajo ({ordenesFiltradas.length})
            </h5>
          </div>
          <div className="card-body p-0">
            {ordenesFiltradas.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Máquina</th>
                      <th>Descripción</th>
                      <th>Tipo</th>
                      <th>Prioridad</th>
                      <th>Estado</th>
                      <th>Fecha Asignación</th>
                      <th>Tiempo Estimado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesFiltradas.map(orden => (
                      <tr key={orden.id}>
                       <td>
                            <div>
                              <span className="fw-bold text-primary">
                                {orden.codigo || `OT-${orden.id.toString().padStart(4, '0')}`}
                              </span>
                              {orden.reporteClienteId && (
                                <div>
                                  <small className="text-muted">
                                    <i className="bi bi-chat-square-text me-1"></i>
                                    Con reporte
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                        <td>
                          <div>
                            <div className="fw-semibold">{orden.maquina?.nombre || 'N/A'}</div>
                            <small className="text-muted">
                              Serie: {orden.maquina?.numero_serie || 'N/A'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '200px' }}>
                            <span className="text-truncate d-block" title={orden.descripcion}>
                              {orden.descripcion || 'Sin descripción'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${tipoColors[orden.tipo?.toLowerCase()] || 'secondary'}`}>
                            {orden.tipo || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${prioridadColors[orden.prioridad?.toLowerCase()] || 'secondary'}`}>
                            {orden.prioridad || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${estadoColors[orden.estado]}`}>
                            <i className={`bi ${estadoIcons[orden.estado]} me-1`}></i>
                            {orden.estado?.replace('_', ' ') || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatearFecha(orden.fechaAsignacion)}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {orden.tiempoEstimado ? `${orden.tiempoEstimado}h` : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group-vertical" role="group">
                            <button 
                              className="btn btn-sm btn-outline-primary mb-1"
                              onClick={() => {
                                setOrdenSeleccionada(orden);
                                setShowDetalleModal(true);
                              }}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye me-1"></i>
                              Ver
                            </button>
                            
                            {orden.estado === 'asignada' && (
                              <button 
                                className="btn btn-sm btn-outline-info mb-1"
                                onClick={() => handleCambiarEstado(orden.id, 'en_proceso')}
                                title="Iniciar trabajo"
                              >
                                <i className="bi bi-play me-1"></i>
                                Iniciar
                              </button>
                            )}
                            
                            {(orden.estado === 'en_proceso' || orden.estado === 'asignada') && (
                              <button 
                                className="btn btn-sm btn-outline-success mb-1"
                                onClick={() => {
                                  setOrdenSeleccionada(orden);
                                  setShowCompletarModal(true);
                                }}
                                title="Completar orden"
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Completar
                              </button>
                            )}

                            {/* Botón Marcar Resuelto - SIEMPRE VISIBLE si tiene reporte */}
                            {orden.reporteClienteId && (
                              <button 
                                className="btn btn-sm btn-warning mb-1"
                                onClick={() => handleMarcarReporteResuelto(orden)}
                                title="Marcar reporte como resuelto"
                              >
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Marcar Resuelto
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-clipboard-check display-1 text-muted mb-3"></i>
                <h5 className="text-muted">No hay órdenes de trabajo</h5>
                <p className="text-muted">No tienes órdenes asignadas con los filtros aplicados</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Completar Orden */}
        {showCompletarModal && ordenSeleccionada && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-check-circle me-2"></i>
                    Completar Orden de Trabajo
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => {
                      setShowCompletarModal(false);
                      setNotasTecnico('');
                      setOrdenSeleccionada(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <p><strong>Orden:</strong> {ordenSeleccionada.codigo || `OT-${ordenSeleccionada.id.toString().padStart(4, '0')}`}</p>
                    <p><strong>Máquina:</strong> {ordenSeleccionada.maquina?.nombre}</p>
                    <p><strong>Descripción:</strong> {ordenSeleccionada.descripcion}</p>
                    {ordenSeleccionada.reporteClienteId && (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Esta orden tiene un reporte de cliente asociado. Al completarla, también se marcará el reporte como resuelto.
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Notas del trabajo realizado:</label>
                    <textarea 
                      className="form-control"
                      rows="4"
                      value={notasTecnico}
                      onChange={(e) => setNotasTecnico(e.target.value)}
                      placeholder="Describe el trabajo realizado, repuestos utilizados, observaciones, etc."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCompletarModal(false);
                      setNotasTecnico('');
                      setOrdenSeleccionada(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handleCompletarOrden}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    Completar Orden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle de Orden */}
        {showDetalleModal && ordenSeleccionada && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Detalle de Orden de Trabajo
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowDetalleModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Código:</label>
                      <p className="form-control-plaintext">
                        {ordenSeleccionada.codigo || `OT-${ordenSeleccionada.id.toString().padStart(4, '0')}`}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Estado:</label>
                      <p className="form-control-plaintext">
                        <span className={`badge bg-${estadoColors[ordenSeleccionada.estado]}`}>
                          <i className={`bi ${estadoIcons[ordenSeleccionada.estado]} me-1`}></i>
                          {ordenSeleccionada.estado?.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Máquina:</label>
                      <p className="form-control-plaintext">
                        {ordenSeleccionada.maquina?.nombre || 'N/A'}
                        <br />
                        <small className="text-muted">
                          Serie: {ordenSeleccionada.maquina?.numero_serie || 'N/A'}
                        </small>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Cliente:</label>
                      <p className="form-control-plaintext">
                        {ordenSeleccionada.reporteCliente?.cliente?.nombre || 'N/A'}
                        <br />
                        <small className="text-muted">
                          {ordenSeleccionada.reporteCliente?.cliente?.email || ''}
                        </small>
                      </p>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Tipo:</label>
                      <p className="form-control-plaintext">
                        <span className={`badge bg-${tipoColors[ordenSeleccionada.tipo?.toLowerCase()] || 'secondary'}`}>
                          {ordenSeleccionada.tipo || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Prioridad:</label>
                      <p className="form-control-plaintext">
                        <span className={`badge bg-${prioridadColors[ordenSeleccionada.prioridad?.toLowerCase()] || 'secondary'}`}>
                          {ordenSeleccionada.prioridad || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Tiempo Estimado:</label>
                      <p className="form-control-plaintext">
                        <span className="badge bg-info">
                          {ordenSeleccionada.tiempoEstimado ? `${ordenSeleccionada.tiempoEstimado} horas` : 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Descripción del Problema:</label>
                      <p className="form-control-plaintext">
                        {ordenSeleccionada.descripcion || 'Sin descripción'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Fecha de Creación:</label>
                      <p className="form-control-plaintext">
                        {formatearFecha(ordenSeleccionada.fechaCreacion)}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Fecha de Asignación:</label>
                      <p className="form-control-plaintext">
                        {formatearFecha(ordenSeleccionada.fechaAsignacion)}
                      </p>
                    </div>
                    {ordenSeleccionada.fechaCompletado && (
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Fecha de Completado:</label>
                        <p className="form-control-plaintext">
                          {formatearFecha(ordenSeleccionada.fechaCompletado)}
                        </p>
                      </div>
                    )}
                    {ordenSeleccionada.notasTecnico && (
                      <div className="col-12">
                        <label className="form-label fw-bold">Notas del Técnico:</label>
                        <p className="form-control-plaintext">
                          {ordenSeleccionada.notasTecnico}
                        </p>
                      </div>
                    )}
                    {ordenSeleccionada.reporteClienteId && (
                      <div className="col-12">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          <strong>Reporte de Cliente Asociado:</strong> Esta orden está vinculada a un reporte del cliente.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowDetalleModal(false)}
                  >
                    Cerrar
                  </button>
                  {(ordenSeleccionada.estado === 'en_proceso' || ordenSeleccionada.estado === 'asignada') && (
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={() => {
                        setShowDetalleModal(false);
                        setShowCompletarModal(true);
                      }}
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Completar Orden
                    </button>
                  )}
                  {ordenSeleccionada.reporteClienteId && ordenSeleccionada.estado === 'completada' && (
                    <button 
                      type="button" 
                      className="btn btn-warning"
                      onClick={() => {
                        setShowDetalleModal(false);
                        handleMarcarReporteResuelto(ordenSeleccionada);
                      }}
                    >
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Marcar Reporte Resuelto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
