"use client";
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

export default function OrdenesTrabajoAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      cargarDatos();
    }
  }, [status, session]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      
      // Cargar órdenes de trabajo
      const ordenesResponse = await fetch(`http://localhost:4000/api/ordenes-trabajo`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (ordenesResponse.ok) {
        const ordenesData = await ordenesResponse.json();
        setOrdenes(ordenesData);
      } else {
        throw new Error('Error al cargar órdenes de trabajo');
      }

      // Cargar técnicos
      const tecnicosResponse = await fetch(`http://localhost:4000/api/usuarios?rol=tecnico`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (tecnicosResponse.ok) {
        const tecnicosData = await tecnicosResponse.json();
        setTecnicos(tecnicosData);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar las órdenes de trabajo');
      setOrdenes([]);
      setTecnicos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstado = async (ordenId, nuevoEstado) => {
    try {
      const response = await fetch(`http://localhost:4000/api/ordenes-trabajo/${ordenId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      // Actualizar estado local
      setOrdenes(prev => prev.map(orden => 
        orden.id === ordenId 
          ? { ...orden, estado: nuevoEstado }
          : orden
      ));

      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado');
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
    const cumpleFiltroTipo = filtroTipo === 'todos' || orden.tipo?.toLowerCase() === filtroTipo;
    return cumpleFiltroEstado && cumpleFiltroPrioridad && cumpleFiltroTipo;
  });

  const contadores = {
    total: ordenes.length,
    pendientes: ordenes.filter(o => o.estado === 'pendiente').length,
    asignadas: ordenes.filter(o => o.estado === 'asignada').length,
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
          <h5 className="text-muted">Cargando órdenes de trabajo...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="h2 mb-1 text-dark">
              <i className="bi bi-clipboard-data me-2" style={{ color: '#6f42c1' }}></i>
              Gestión de Órdenes de Trabajo
            </h1>
            <p className="text-muted mb-0">Administra y supervisa todas las órdenes de trabajo del sistema</p>
          </div>
          <div className="col-auto">
            <button 
              className="btn btn-outline-primary"
              onClick={cargarDatos}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.total}</h3>
                <small className="opacity-75">Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.pendientes}</h3>
                <small className="opacity-75">Pendientes</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.asignadas}</h3>
                <small className="opacity-75">Asignadas</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.en_proceso}</h3>
                <small className="opacity-75">En Proceso</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.completadas}</h3>
                <small className="opacity-75">Completadas</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
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
                  <option value="cancelada">Canceladas</option>
                </select>
              </div>
              <div className="col-md-3">
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
              <div className="col-md-3">
                <label className="form-label">Filtrar por Tipo:</label>
                <select 
                  className="form-select"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                  <option value="emergencia">Emergencia</option>
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setFiltroEstado('todos');
                    setFiltroPrioridad('todos');
                    setFiltroTipo('todos');
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
              Órdenes de Trabajo ({ordenesFiltradas.length})
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
                      <th>Técnico Asignado</th>
                      <th>Fecha Creación</th>
                      <th>Tiempo Estimado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesFiltradas.map(orden => (
                      <tr key={orden.id}>
                        <td>
                          <span className="fw-bold text-primary">
                            {orden.codigo || `OT-${orden.id.toString().padStart(4, '0')}`}
                          </span>
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
                          <div className="dropdown">
                            <button 
                              className={`btn btn-sm btn-outline-${estadoColors[orden.estado]} dropdown-toggle`}
                              type="button" 
                              data-bs-toggle="dropdown"
                            >
                              <i className={`bi ${estadoIcons[orden.estado]} me-1`}></i>
                              {orden.estado?.replace('_', ' ') || 'N/A'}
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => handleCambiarEstado(orden.id, 'pendiente')}
                                >
                                  <i className="bi bi-clock me-2"></i>Pendiente
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => handleCambiarEstado(orden.id, 'asignada')}
                                >
                                  <i className="bi bi-person-check me-2"></i>Asignada
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => handleCambiarEstado(orden.id, 'en_proceso')}
                                >
                                  <i className="bi bi-gear me-2"></i>En Proceso
                                </button>
                              </li>
                              <li>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => handleCambiarEstado(orden.id, 'completada')}
                                >
                                  <i className="bi bi-check-circle me-2"></i>Completada
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button 
                                  className="dropdown-item text-danger"
                                  onClick={() => handleCambiarEstado(orden.id, 'cancelada')}
                                >
                                  <i className="bi bi-x-circle me-2"></i>Cancelar
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                        <td>
                          {orden.tecnico ? (
                            <div>
                              <div className="fw-semibold text-success">
                                <i className="bi bi-person-check me-1"></i>
                                {orden.tecnico.nombre}
                              </div>
                              <small className="text-muted">{orden.tecnico.email}</small>
                            </div>
                          ) : (
                            <span className="text-muted">
                              <i className="bi bi-person-x me-1"></i>
                              Sin asignar
                            </span>
                          )}
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatearFecha(orden.fechaCreacion)}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {orden.tiempoEstimado ? `${orden.tiempoEstimado}h` : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setOrdenSeleccionada(orden);
                                setShowDetalleModal(true);
                              }}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye"></i>
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
                <i className="bi bi-clipboard-x display-1 text-muted mb-3"></i>
                <h5 className="text-muted">No hay órdenes de trabajo</h5>
                <p className="text-muted">No se encontraron órdenes con los filtros aplicados</p>
              </div>
            )}
          </div>
        </div>

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
                      <label className="form-label fw-bold">Técnico Asignado:</label>
                      <p className="form-control-plaintext">
                        {ordenSeleccionada.tecnico ? (
                          <>
                            <i className="bi bi-person-check text-success me-1"></i>
                            {ordenSeleccionada.tecnico.nombre}
                            <br />
                            <small className="text-muted">{ordenSeleccionada.tecnico.email}</small>
                          </>
                        ) : (
                          <span className="text-muted">
                            <i className="bi bi-person-x me-1"></i>
                            Sin asignar
                          </span>
                        )}
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
                      <label className="form-label fw-bold">Descripción:</label>
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
                    {ordenSeleccionada.notasTecnico && (
                      <div className="col-12">
                        <label className="form-label fw-bold">Notas del Técnico:</label>
                        <p className="form-control-plaintext">
                          {ordenSeleccionada.notasTecnico}
                        </p>
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
