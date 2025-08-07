'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { reporteService } from '@/services/reporteService';

export default function DashboardAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMaquinas: 0,
    maquinasOperativas: 0,
    maquinasMantenimiento: 0,
    maquinasFueraServicio: 0,
    totalUsuarios: 0,
    reportesPendientes: 0,
    ordenesPendientes: 0,
    ingresosMes: 0
  });
  const [reportesRecientes, setReportesRecientes] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;
    
    // Cargar datos inicialmente
    fetchDashboardData();
    
    // Configurar actualización automática cada 30 segundos
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    // Limpiar interval al desmontar el componente
    return () => clearInterval(interval);
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos reales de máquinas
      const maquinasData = await reporteService.obtenerMaquinasCliente(session.accessToken);
      setMaquinas(maquinasData);
      
      // Calcular estadísticas reales de máquinas
      const totalMaquinas = maquinasData.length;
      const maquinasOperativas = maquinasData.filter(m => m.estado === 'Operativo').length;
      const maquinasMantenimiento = maquinasData.filter(m => m.estado === 'En Mantenimiento').length;
      const maquinasFueraServicio = maquinasData.filter(m => 
        m.estado === 'Fuera de Servicio' || m.estado === 'Error' || m.estado === 'Advertencia'
      ).length;
      
      // Obtener reportes reales de clientes
      const reportesData = await reporteService.obtenerReportesClientes(session.accessToken);
      
      // Procesar reportes para el dashboard
      const reportesPendientes = reportesData.filter(r => r.estadoReporte === 'pendiente').length;
      
      // Mapear reportes para la tabla (últimos 5)
      const reportesRecientesData = reportesData
        .sort((a, b) => new Date(b.fechaReporte) - new Date(a.fechaReporte))
        .slice(0, 5)
        .map(reporte => ({
          id: reporte.id,
          cliente: reporte.cliente?.nombre || 'Cliente no especificado',
          maquina: reporte.maquina?.nombre || reporte.maquina?.numero_serie || 'Máquina no especificada',
          problema: reporte.descripcion || 'Sin descripción',
          fecha: reporte.fechaReporte,
          estado: reporte.estadoReporte === 'pendiente' ? 'Pendiente' : 
                 reporte.estadoReporte === 'en_proceso' ? 'En Proceso' : 'Resuelto',
          prioridad: reporte.gravedad === 'critica' ? 'Crítica' :
                    reporte.gravedad === 'alta' ? 'Alta' :
                    reporte.gravedad === 'media' ? 'Media' : 'Baja',
          tipo: reporte.tipo === 'reporte_problema' ? 'Correctivo' : 'Preventivo'
        }));

      // Obtener usuarios (simulado por ahora, mantener en 0 como solicitaste)
      const totalUsuarios = 0;
      const ordenesPendientes = 0;
      const ingresosMes = 0;

      const statsReales = {
        totalMaquinas,
        maquinasOperativas,
        maquinasMantenimiento,
        maquinasFueraServicio,
        totalUsuarios,
        reportesPendientes,
        ordenesPendientes,
        ingresosMes
      };

      setStats(statsReales);
      setReportesRecientes(reportesRecientesData);
      setUltimaActualizacion(new Date());
      
      console.log('Estadísticas del dashboard:', statsReales);
      console.log('Reportes recientes:', reportesRecientesData);
      
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      toast.error('Error al cargar los datos del dashboard: ' + err.message);
      
      // En caso de error, mostrar datos vacíos
      setStats({
        totalMaquinas: 0,
        maquinasOperativas: 0,
        maquinasMantenimiento: 0,
        maquinasFueraServicio: 0,
        totalUsuarios: 0,
        reportesPendientes: 0,
        ordenesPendientes: 0,
        ingresosMes: 0
      });
      setReportesRecientes([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'Crítica': return 'danger';
      case 'Alta': return 'warning';
      case 'Media': return 'info';
      case 'Baja': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'En Proceso': return 'primary';
      case 'Resuelto': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1 text-dark">
                  <i className="bi bi-speedometer2 me-2" style={{ color: '#6f42c1' }}></i>
                  Dashboard del Administrador
                </h1>
                <p className="text-muted mb-0">Panel de control y gestión del sistema en tiempo real</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <button 
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="btn btn-outline-primary btn-sm"
                  title="Actualizar datos"
                >
                  <i className={`bi ${loading ? 'bi-arrow-clockwise' : 'bi-arrow-clockwise'} ${loading ? 'spin' : ''} me-1`}></i>
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
                {ultimaActualizacion && (
                  <div className="text-end">
                    <small className="text-muted d-block">
                      <i className="bi bi-clock me-1"></i>
                      Última actualización
                    </small>
                    <small className="text-success fw-semibold">
                      {ultimaActualizacion.toLocaleTimeString('es-ES')}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Máquinas Operativas</h6>
                  <i className="bi bi-check-circle-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{stats.maquinasOperativas}</h2>
                <small className="opacity-75">de {stats.totalMaquinas} total</small>
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
                <h2 className="mb-1 fw-bold">{stats.maquinasMantenimiento}</h2>
                <small className="opacity-75">Requieren servicio</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Fuera de Servicio</h6>
                  <i className="bi bi-x-octagon-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{stats.maquinasFueraServicio}</h2>
                <small className="opacity-75">Requieren atención</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Reportes Pendientes</h6>
                  <i className="bi bi-exclamation-triangle-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{stats.reportesPendientes}</h2>
                <small className="opacity-75">Por revisar</small>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas secundarias */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <div className="card-body text-dark">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Total Usuarios</h6>
                  <i className="bi bi-people-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">$0</h2>
                <small className="opacity-75">Módulo en desarrollo</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Órdenes Pendientes</h6>
                  <i className="bi bi-clipboard-check fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">$0</h2>
                <small className="opacity-75">Módulo en desarrollo</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-6">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Ingresos del Mes</h6>
                  <i className="bi bi-currency-dollar fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">$0</h2>
                <small className="opacity-75">Módulo en desarrollo</small>
              </div>
            </div>
          </div>
        </div>

        {/* Reportes recientes */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header" style={{ backgroundColor: '#6f42c1', background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="h5 mb-0 text-white">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Reportes de Clientes Recientes
                  </h3>
                  <Link href="/admin/reportes-cliente" className="btn btn-light btn-sm">
                    <i className="bi bi-eye me-1"></i>
                    Ver Todos
                  </Link>
                </div>
              </div>
              <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
                {reportesRecientes.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Reporte</th>
                          <th>Cliente</th>
                          <th>Máquina</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Prioridad</th>
                          <th>Fecha</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportesRecientes.map(reporte => (
                          <tr key={reporte.id}>
                            <td>
                              <div>
                                <strong>#{reporte.id}</strong>
                                <br />
                                <small className="text-muted" title={reporte.problema}>
                                  {reporte.problema.length > 50 
                                    ? reporte.problema.substring(0, 50) + '...' 
                                    : reporte.problema}
                                </small>
                              </div>
                            </td>
                            <td>
                              <strong>{reporte.cliente}</strong>
                            </td>
                            <td>
                              <strong>{reporte.maquina}</strong>
                            </td>
                            <td>
                              <span className={`badge ${reporte.tipo === 'Correctivo' ? 'bg-danger' : 'bg-success'}`}>
                                <i className={`bi ${reporte.tipo === 'Correctivo' ? 'bi-exclamation-triangle' : 'bi-shield-check'} me-1`}></i>
                                {reporte.tipo}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${getStatusColor(reporte.estado)}`}>
                                <i className={`bi ${
                                  reporte.estado === 'Pendiente' ? 'bi-clock' :
                                  reporte.estado === 'En Proceso' ? 'bi-gear' :
                                  'bi-check-circle'
                                } me-1`}></i>
                                {reporte.estado}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${getPriorityColor(reporte.prioridad)}`}>
                                <i className={`bi ${
                                  reporte.prioridad === 'Crítica' ? 'bi-exclamation-triangle-fill' :
                                  reporte.prioridad === 'Alta' ? 'bi-exclamation-circle' :
                                  reporte.prioridad === 'Media' ? 'bi-info-circle' :
                                  'bi-circle'
                                } me-1`}></i>
                                {reporte.prioridad}
                              </span>
                            </td>
                            <td>
                              <small>
                                {new Date(reporte.fecha).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                                <br />
                                <span className="text-muted">
                                  {new Date(reporte.fecha).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </small>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <Link 
                                  href="/admin/reportes-cliente" 
                                  className="btn btn-sm btn-outline-primary" 
                                  title="Ver en reportes"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                                {reporte.estado === 'Pendiente' && (
                                  <button 
                                    className="btn btn-sm btn-outline-success" 
                                    title="Marcar como resuelto"
                                    onClick={() => {
                                      toast.info('Redirigiendo a la vista de reportes para gestionar...');
                                      router.push('/admin/reportes-cliente');
                                    }}
                                  >
                                    <i className="bi bi-check"></i>
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
                  <div className="text-center py-4">
                    <i className="bi bi-clipboard-check display-1 text-muted mb-3"></i>
                    <h5 className="text-muted">No hay reportes recientes</h5>
                    <p className="text-muted">Los nuevos reportes aparecerán aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}