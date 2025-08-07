"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { reporteService } from '@/services/reporteService';

export default function InventarioClientePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      cargarMaquinas();
    }
  }, [status, session]);

  const cargarMaquinas = async () => {
    try {
      setIsLoading(true);
      const maquinas = await reporteService.obtenerMaquinasCliente(session.accessToken);
      setMachines(maquinas);
    } catch (error) {
      console.error('Error al cargar máquinas:', error);
      toast.error('Error al cargar las máquinas');
    } finally {
      setIsLoading(false);
    }
  };

  const maquinasFiltradas = machines.filter(machine => {
    const coincideBusqueda = machine.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            machine.numero_serie.toLowerCase().includes(busqueda.toLowerCase()) ||
                            machine.modelo.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = filtroEstado === 'todos' || machine.estado === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  const contadores = {
    total: machines.length,
    operativo: machines.filter(m => m.estado === 'Operativo').length,
    mantenimiento: machines.filter(m => m.estado === 'En Mantenimiento').length,
    error: machines.filter(m => m.estado === 'Error' || m.estado === 'Fuera de Servicio').length,
    advertencia: machines.filter(m => m.estado === 'Advertencia').length
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Operativo': return 'bg-success';
      case 'En Mantenimiento': return 'bg-warning text-dark';
      case 'Advertencia': return 'bg-info';
      case 'Error': return 'bg-danger';
      case 'Fuera de Servicio': return 'bg-dark';
      default: return 'bg-secondary';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Operativo': return 'bi-check-circle-fill';
      case 'En Mantenimiento': return 'bi-tools';
      case 'Advertencia': return 'bi-exclamation-triangle-fill';
      case 'Error': return 'bi-x-circle-fill';
      case 'Fuera de Servicio': return 'bi-power';
      default: return 'bi-question-circle';
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando inventario...</h5>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-1 text-dark">
            <i className="bi bi-boxes me-2" style={{ color: '#6f42c1' }}></i>
            Inventario de Máquinas
          </h1>
          <p className="text-muted mb-0">Consulta el estado y detalles de todas tus máquinas</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white text-center">
              <i className="bi bi-boxes display-4 mb-2 opacity-75"></i>
              <h3 className="mb-1 fw-bold">{contadores.total}</h3>
              <small className="opacity-75">Total Máquinas</small>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <div className="card-body text-white text-center">
              <i className="bi bi-check-circle-fill display-4 mb-2 opacity-75"></i>
              <h3 className="mb-1 fw-bold">{contadores.operativo}</h3>
              <small className="opacity-75">Operativas</small>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
            <div className="card-body text-white text-center">
              <i className="bi bi-tools display-4 mb-2 opacity-75"></i>
              <h3 className="mb-1 fw-bold">{contadores.mantenimiento}</h3>
              <small className="opacity-75">En Mantenimiento</small>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="card-body text-white text-center">
              <i className="bi bi-exclamation-triangle-fill display-4 mb-2 opacity-75"></i>
              <h3 className="mb-1 fw-bold">{contadores.error + contadores.advertencia}</h3>
              <small className="opacity-75">Con Problemas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="bi bi-search me-1"></i>
                Buscar máquinas:
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, serie o modelo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                <i className="bi bi-funnel me-1"></i>
                Filtrar por estado:
              </label>
              <select 
                className="form-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="Operativo">Operativo</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Advertencia">Advertencia</option>
                <option value="Error">Error</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setBusqueda('');
                  setFiltroEstado('todos');
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de máquinas */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Máquinas ({maquinasFiltradas.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {maquinasFiltradas.length > 0 ? (
            <div className="row g-0">
              {maquinasFiltradas.map(machine => (
                <div key={machine.id} className="col-12">
                  <div className="border-bottom p-4 hover-bg-light">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3 p-3 rounded-circle bg-light">
                            <i className={`bi ${getEstadoIcon(machine.estado)} fs-4`} style={{ color: '#6f42c1' }}></i>
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold">{machine.nombre}</h6>
                            <small className="text-muted">Serie: {machine.numero_serie}</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted d-block">Modelo</small>
                        <span className="fw-semibold">{machine.modelo}</span>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted d-block">Estado</small>
                        <span className={`badge ${getEstadoBadgeClass(machine.estado)} px-3 py-2`}>
                          <i className={`bi ${getEstadoIcon(machine.estado)} me-1`}></i>
                          {machine.estado}
                        </span>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted d-block">Ubicación</small>
                        <span className="fw-semibold">{machine.ubicacion?.nombre || 'No asignada'}</span>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted d-block">Instalación</small>
                        <span className="fw-semibold">
                          {machine.fecha_instalacion ? 
                            new Date(machine.fecha_instalacion).toLocaleDateString('es-ES') : 
                            'No registrada'
                          }
                        </span>
                      </div>
                      <div className="col-md-1 text-end">
                        <div className="dropdown">
                          <button 
                            className="btn btn-outline-secondary btn-sm dropdown-toggle"
                            type="button" 
                            data-bs-toggle="dropdown"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <button 
                                className="dropdown-item"
                                onClick={() => router.push(`/cliente/ReporteInventario?maquina=${machine.id}`)}
                              >
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                Reportar Problema
                              </button>
                            </li>
                            {machine.estado !== 'Operativo' && (
                              <li>
                                <button 
                                  className="dropdown-item text-success"
                                  onClick={() => router.push(`/cliente/ReporteInventario?confirmar=${machine.id}`)}
                                >
                                  <i className="bi bi-check-circle me-2"></i>
                                  Confirmar Operativa
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {machine.notas && (
                      <div className="mt-3 pt-3 border-top">
                        <small className="text-muted d-block mb-1">Notas:</small>
                        <small className="text-muted">{machine.notas}</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted mb-3"></i>
              <h5 className="text-muted">No se encontraron máquinas</h5>
              <p className="text-muted">
                {busqueda || filtroEstado !== 'todos' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'No tienes máquinas asignadas'
                }
              </p>
              {(busqueda || filtroEstado !== 'todos') && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEstado('todos');
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa !important;
          transition: background-color 0.2s ease;
        }
        
        .dropdown-item:hover {
          background-color: #e9ecef;
          transform: translateX(2px);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}