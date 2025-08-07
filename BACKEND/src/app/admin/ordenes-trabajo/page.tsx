"use client";
import { useState, useEffect } from 'react';

interface OrdenTrabajo {
  id: number;
  codigo: string;
  maquinaId: number;
  tecnicoId: number;
  reporteClienteId?: number;
  tipo: string;
  prioridad: string;
  estado: string;
  descripcion: string;
  fechaCreacion: string;
  fechaAsignacion?: string;
  fechaInicio?: string;
  fechaFinalizacion?: string;
  tiempoEstimado?: number;
  tiempoReal?: number;
  clienteNotificado?: boolean;
  firmaCliente?: string;
  fotoFinalizacion?: string;
  calificacionServicio?: number;
  comentariosCliente?: string;
  notasTecnico?: string;
  creadoEn: string;
  actualizadoEn: string;
  maquina: {
    id: number;
    nombre: string;
    numero_serie: string;
    modelo: string;
    estado: string;
  };
  tecnico: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    rol: string;
    activo: boolean;
  };
  reporteCliente?: {
    id: number;
    descripcion: string;
    gravedad: string;
    cliente: {
      id: number;
      nombre: string;
      email: string;
    };
  };
}

export default function OrdenesTrabajoPage() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setError('No se encontró token de autenticación');
        return;
      }

      const response = await fetch('http://localhost:4000/api/ordenes-trabajo', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setOrdenes(data);
    } catch (error) {
      console.error('Error al cargar órdenes de trabajo:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarEstadoOrden = async (id: number, nuevoEstado: string, notas?: string) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const updateData: any = {
        id,
        estado: nuevoEstado
      };

      if (notas) {
        updateData.notasTecnico = notas;
      }

      if (nuevoEstado === 'en_progreso') {
        updateData.fechaInicio = new Date();
      } else if (nuevoEstado === 'completada') {
        updateData.fechaFinalizacion = new Date();
      }
      
      const response = await fetch('http://localhost:4000/api/ordenes-trabajo', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la orden de trabajo');
      }

      await cargarOrdenes();
      alert('Orden de trabajo actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      alert('Error al actualizar la orden de trabajo');
    }
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || orden.estado === filtroEstado;
    const cumpleFiltroPrioridad = filtroPrioridad === 'todos' || orden.prioridad === filtroPrioridad;
    return cumpleFiltroEstado && cumpleFiltroPrioridad;
  });

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-warning text-dark';
      case 'en_progreso': return 'bg-info';
      case 'completada': return 'bg-success';
      case 'cancelada': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getPrioridadBadgeClass = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-danger';
      case 'media': return 'bg-warning text-dark';
      case 'baja': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando órdenes de trabajo...</p>
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
          <button className="btn btn-outline-danger" onClick={cargarOrdenes}>
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
            <i className="bi bi-clipboard-check me-2 text-primary"></i>
            Órdenes de Trabajo
          </h1>
          <p className="text-muted">Gestiona las órdenes de trabajo asignadas a los técnicos</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={cargarOrdenes}>
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
              <h3 className="mb-1">{ordenes.length}</h3>
              <small>Total Órdenes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h3 className="mb-1">{ordenes.filter(o => o.estado === 'pendiente').length}</h3>
              <small>Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{ordenes.filter(o => o.estado === 'en_progreso').length}</h3>
              <small>En Progreso</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h3 className="mb-1">{ordenes.filter(o => o.estado === 'completada').length}</h3>
              <small>Completadas</small>
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
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
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
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
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
                    <th>Fecha Creación</th>
                    <th>Técnico</th>
                    <th>Máquina</th>
                    <th>Cliente</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Tiempo Est.</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesFiltradas.map(orden => (
                    <tr key={orden.id}>
                      <td>
                        <strong>{orden.codigo}</strong>
                        {orden.reporteClienteId && (
                          <br />
                          <small className="text-muted">
                            Reporte #{orden.reporteClienteId}
                          </small>
                        )}
                      </td>
                      <td>{formatearFecha(orden.fechaCreacion)}</td>
                      <td>
                        <div>
                          <strong>{orden.tecnico.nombre}</strong>
                          <br />
                          <small className="text-muted">{orden.tecnico.email}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{orden.maquina.nombre}</strong>
                          <br />
                          <small className="text-muted">Serie: {orden.maquina.numero_serie}</small>
                        </div>
                      </td>
                      <td>
                        {orden.reporteCliente ? (
                          <div>
                            <strong>{orden.reporteCliente.cliente.nombre}</strong>
                            <br />
                            <small className="text-muted">{orden.reporteCliente.cliente.email}</small>
                          </div>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getPrioridadBadgeClass(orden.prioridad)}`}>
                          {orden.prioridad.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoBadgeClass(orden.estado)}`}>
                          {orden.estado.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {orden.tiempoEstimado ? `${orden.tiempoEstimado}h` : 'N/A'}
                        {orden.tiempoReal && (
                          <>
                            <br />
                            <small className="text-success">Real: {orden.tiempoReal}h</small>
                          </>
                        )}
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {orden.descripcion}
                        </div>
                      </td>
                      <td>
                        <div className="btn-group-vertical btn-group-sm">
                          {orden.estado === 'pendiente' && (
                            <button
                              className="btn btn-outline-info btn-sm mb-1"
                              onClick={() => actualizarEstadoOrden(orden.id, 'en_progreso', 'Trabajo iniciado')}
                            >
                              <i className="bi bi-play me-1"></i>
                              Iniciar
                            </button>
                          )}
                          {orden.estado === 'en_progreso' && (
                            <button
                              className="btn btn-outline-success btn-sm mb-1"
                              onClick={() => actualizarEstadoOrden(orden.id, 'completada', 'Trabajo completado')}
                            >
                              <i className="bi bi-check-lg me-1"></i>
                              Completar
                            </button>
                          )}
                          {(orden.estado === 'pendiente' || orden.estado === 'en_progreso') && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => actualizarEstadoOrden(orden.id, 'cancelada', 'Orden cancelada')}
                            >
                              <i className="bi bi-x-lg me-1"></i>
                              Cancelar
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
              <p className="text-muted">No se encontraron órdenes con los filtros aplicados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}