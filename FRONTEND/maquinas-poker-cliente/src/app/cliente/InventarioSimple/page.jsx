"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClienteNavbar from '@/components/ClienteNavbar';
import Link from 'next/link';

export default function InventarioSimple() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [maquinas, setMaquinas] = useState([]);
  const [filteredMaquinas, setFilteredMaquinas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Operativo', 'En Mantenimiento', etc.
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Función para calcular el resumen de máquinas
  const calculateResumen = (maquinasData) => {
    const total = maquinasData.length;
    const operativas = maquinasData.filter(m => m.estado === 'Operativo').length;
    const mantenimiento = maquinasData.filter(m => m.estado === 'En Mantenimiento').length;
    const advertencia = maquinasData.filter(m => m.estado === 'Advertencia').length;
    const error = maquinasData.filter(m => m.estado === 'Error').length;
    
    return {
      total,
      operativas,
      mantenimiento,
      advertencia,
      error,
      fueraServicio: error + advertencia
    };
  };

  const resumen = calculateResumen(maquinas);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'cliente') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;

    const fetchMaquinas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:4000/api/maquinas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar las máquinas');
        }

        const data = await response.json();
        setMaquinas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al cargar máquinas:', err);
        toast.error(err.message || 'Error al cargar las máquinas');
        setMaquinas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaquinas();
  }, [status, session]);

  // Filtrar máquinas basado en búsqueda y estado
  useEffect(() => {
    let filtered = maquinas;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(maquina =>
        maquina.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maquina.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maquina.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maquina.ubicacion?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(maquina => maquina.estado === filterStatus);
    }

    setFilteredMaquinas(filtered);
  }, [maquinas, searchTerm, filterStatus]);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Operativo': return 'success';
      case 'En Mantenimiento': return 'warning';
      case 'Advertencia': return 'warning';
      case 'Error': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'Operativo': return 'bi-check-circle-fill';
      case 'En Mantenimiento': return 'bi-tools';
      case 'Advertencia': return 'bi-exclamation-triangle-fill';
      case 'Error': return 'bi-x-circle-fill';
      default: return 'bi-question-circle-fill';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilMaintenance = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const maintenanceDate = new Date(dateString);
    const diffTime = maintenanceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando tus máquinas...</h5>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClienteNavbar />
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <div className="mb-3 mb-md-0">
                <h1 className="h2 mb-1 text-dark">
                  <i className="bi bi-cpu-fill me-2" style={{ color: '#6f42c1' }}></i>
                  Inventario de Mis Máquinas
                </h1>
                <p className="text-muted mb-0">Vista detallada de todas tus máquinas de póker asignadas</p>
              </div>
              
              {/* Botones de navegación */}
              <div className="d-flex gap-2 flex-wrap">
                <Link href="/cliente/DashboardCliente" className="btn btn-outline-primary">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>
                <button className="btn btn-primary active" disabled>
                  <i className="bi bi-boxes me-2"></i>
                  Inventario
                </button>
                <Link href="/cliente/ReporteInventario" className="btn btn-outline-primary">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Reportes
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Total de Máquinas</h6>
                  <i className="bi bi-collection fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{resumen.total}</h2>
                <small className="opacity-75">Máquinas asignadas</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Operativas</h6>
                  <i className="bi bi-check-circle-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{resumen.operativas}</h2>
                <small className="opacity-75">
                  {resumen.total > 0 ? ((resumen.operativas / resumen.total) * 100).toFixed(1) : 0}% del total
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">En Mantenimiento</h6>
                  <i className="bi bi-tools fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{resumen.mantenimiento}</h2>
                <small className="opacity-75">Requieren servicio</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Con Problemas</h6>
                  <i className="bi bi-exclamation-triangle-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{resumen.fueraServicio}</h2>
                <small className="opacity-75">Requieren atención</small>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de filtrado y vista */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text" style={{ backgroundColor: '#e3f2fd', border: '1px solid #bbdefb' }}>
                    <i className="bi bi-search" style={{ color: '#1976d2' }}></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    style={{ border: '1px solid #bbdefb' }}
                    placeholder="Buscar por nombre, serie, modelo o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  style={{ border: '1px solid #bbdefb' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="Operativo">Operativo</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                  <option value="Advertencia">Advertencia</option>
                  <option value="Error">Error</option>
                </select>
              </div>
              <div className="col-md-3">
                <small className="text-muted">
                  Mostrando {filteredMaquinas.length} de {maquinas.length} máquinas
                </small>
              </div>
              <div className="col-md-2">
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('cards')}
                    style={{ borderColor: '#6f42c1', backgroundColor: viewMode === 'cards' ? '#6f42c1' : 'transparent' }}
                  >
                    <i className="bi bi-grid-3x3-gap"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('table')}
                    style={{ borderColor: '#6f42c1', backgroundColor: viewMode === 'table' ? '#6f42c1' : 'transparent' }}
                  >
                    <i className="bi bi-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {filteredMaquinas.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5" style={{ backgroundColor: '#ffffff' }}>
              <i className="bi bi-cpu display-1 text-muted mb-3"></i>
              <h4 className="text-muted mb-2">
                {maquinas.length === 0 ? 'No tienes máquinas asignadas' : 'No se encontraron máquinas'}
              </h4>
              <p className="text-muted">
                {maquinas.length === 0 
                  ? 'Contacta con tu administrador para que te asigne máquinas.'
                  : 'Intenta ajustar los filtros de búsqueda.'
                }
              </p>
              {searchTerm || filterStatus !== 'all' ? (
                <button 
                  className="btn btn-outline-primary"
                  style={{ borderColor: '#6f42c1', color: '#6f42c1' }}
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Limpiar filtros
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              // Vista de tarjetas detallada
              <div className="row g-4">
                {filteredMaquinas.map((maquina) => {
                  const daysUntilMaintenance = getDaysUntilMaintenance(maquina.proximo_mantenimiento);
                  
                  return (
                    <div key={maquina.id} className="col-md-6 col-lg-4">
                      <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#ffffff' }}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="flex-grow-1">
                              <h5 className="card-title mb-1 fw-bold text-dark">
                                {maquina.nombre}
                              </h5>
                              <p className="text-muted small mb-0">
                                Serie: {maquina.numero_serie}
                              </p>
                            </div>
                            <span className={`badge bg-${getStatusColor(maquina.estado)} fs-6`}>
                              <i className={`bi ${getStatusIcon(maquina.estado)} me-1`}></i>
                              {maquina.estado}
                            </span>
                          </div>

                          <div className="mb-3">
                            <p className="text-muted small mb-2">Información General</p>
                            <div className="row g-2">
                              <div className="col-6">
                                <small className="text-muted d-block">Modelo</small>
                                <span className="fw-semibold">{maquina.modelo}</span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">ID Máquina</small>
                                <span className="fw-semibold text-primary">#{maquina.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="row g-2">
                              <div className="col-12">
                                <small className="text-muted d-block">Ubicación</small>
                                <span className="fw-semibold">
                                  <i className="bi bi-geo-alt me-1" style={{ color: '#6f42c1' }}></i>
                                  {maquina.ubicacion ? maquina.ubicacion.nombre : 'No asignada'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-muted small mb-2">Fechas Importantes</p>
                            <div className="row g-2">
                              <div className="col-6">
                                <small className="text-muted d-block">Instalación</small>
                                <span className="small">{formatDate(maquina.fecha_instalacion)}</span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Último Mant.</small>
                                <span className="small">{formatDate(maquina.ultimo_mantenimiento)}</span>
                              </div>
                            </div>
                          </div>

                          {daysUntilMaintenance !== null && (
                            <div className={`alert ${daysUntilMaintenance <= 7 ? 'alert-warning' : 'alert-info'} py-2 mb-3`}>
                              <small>
                                <i className="bi bi-calendar-event me-1"></i>
                                <strong>Próximo mantenimiento:</strong> {daysUntilMaintenance > 0 ? `${daysUntilMaintenance} días` : 'Vencido'}
                              </small>
                            </div>
                          )}

                          <div className="mb-3">
                            <p className="text-muted small mb-2">Detalles Técnicos</p>
                            <div className="row g-2">
                              <div className="col-6">
                                <small className="text-muted d-block">Fabricante</small>
                                <span className="small">{maquina.fabricante || 'No especificado'}</span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Año</small>
                                <span className="small">{maquina.año_fabricacion || 'No especificado'}</span>
                              </div>
                            </div>
                          </div>

                          {maquina.especificaciones_tecnicas && (
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Especificaciones</small>
                              <p className="small text-dark mb-0" style={{ fontSize: '0.85rem' }}>
                                {maquina.especificaciones_tecnicas}
                              </p>
                            </div>
                          )}

                          {maquina.notas && (
                            <div className="mt-3 pt-3 border-top">
                              <small className="text-muted d-block mb-1">Notas</small>
                              <p className="small text-dark mb-0" style={{ fontSize: '0.85rem' }}>
                                {maquina.notas}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Vista de tabla detallada
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0" style={{ backgroundColor: '#ffffff' }}>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th className="border-0 fw-semibold text-dark">Máquina</th>
                          <th className="border-0 fw-semibold text-dark">Estado</th>
                          <th className="border-0 fw-semibold text-dark">Modelo</th>
                          <th className="border-0 fw-semibold text-dark">Ubicación</th>
                          <th className="border-0 fw-semibold text-dark">Instalación</th>
                          <th className="border-0 fw-semibold text-dark">Último Mant.</th>
                          <th className="border-0 fw-semibold text-dark">Próximo Mant.</th>
                          <th className="border-0 fw-semibold text-dark">Fabricante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaquinas.map((maquina) => {
                          const daysUntilMaintenance = getDaysUntilMaintenance(maquina.proximo_mantenimiento);
                          
                          return (
                            <tr key={maquina.id}>
                              <td>
                                <div>
                                  <div className="fw-semibold text-dark">{maquina.nombre}</div>
                                  <small className="text-muted">
                                    Serie: {maquina.numero_serie} | ID: #{maquina.id}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <span className={`badge bg-${getStatusColor(maquina.estado)}`}>
                                  <i className={`bi ${getStatusIcon(maquina.estado)} me-1`}></i>
                                  {maquina.estado}
                                </span>
                              </td>
                              <td>
                                <div className="fw-semibold">{maquina.modelo}</div>
                                {maquina.año_fabricacion && (
                                  <small className="text-muted">Año: {maquina.año_fabricacion}</small>
                                )}
                              </td>
                              <td>
                                <i className="bi bi-geo-alt me-1" style={{ color: '#6f42c1' }}></i>
                                {maquina.ubicacion ? maquina.ubicacion.nombre : 'No asignada'}
                              </td>
                              <td>
                                <small>{formatDate(maquina.fecha_instalacion)}</small>
                              </td>
                              <td>
                                <small>{formatDate(maquina.ultimo_mantenimiento)}</small>
                              </td>
                              <td>
                                {daysUntilMaintenance !== null ? (
                                  <span className={`badge ${daysUntilMaintenance <= 7 ? 'bg-warning' : 'bg-info'}`}>
                                    {daysUntilMaintenance > 0 ? `${daysUntilMaintenance} días` : 'Vencido'}
                                  </span>
                                ) : (
                                  <small className="text-muted">No programado</small>
                                )}
                              </td>
                              <td>
                                <small>{maquina.fabricante || 'No especificado'}</small>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </>
  );
}