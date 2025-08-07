"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { reporteService } from '@/services/reporteService';

const tipoColors = {
  'Correctivo': 'danger',
  'Preventivo': 'success',
  'Predictivo': 'info'
};

const tipoIcons = {
  'Correctivo': 'bi-exclamation-triangle',
  'Preventivo': 'bi-shield-check',
  'Predictivo': 'bi-graph-up'
};

export default function ReportesClientePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportes, setReportes] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

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
      
      // Cargar reportes de clientes y máquinas
      const [reportesClientes, maquinasData] = await Promise.all([
        reporteService.obtenerReportesClientes(),
        reporteService.obtenerMaquinasCliente(session.accessToken)
      ]);

      // Enriquecer reportes con información de máquinas
      const reportesEnriquecidos = reportesClientes.map(reporte => {
        const maquina = maquinasData.find(m => m.id === reporte.maquinaId);
        return {
          ...reporte,
          maquina: maquina || { 
            id: reporte.maquinaId, 
            nombre: reporte.maquinaNombre || 'Máquina no encontrada', 
            numero_serie: reporte.maquinaSerie || 'N/A',
            estado: 'Desconocido'
          },
          esReporte: reporte.tipo === 'reporte_problema',
          esConfirmacion: reporte.tipo === 'confirmacion_operativa',
          tipo: reporte.tipo === 'reporte_problema' ? 'Correctivo' : 'Preventivo',
          fecha_programada: reporte.fecha
        };
      });

      setReportes(reportesEnriquecidos);
      setMaquinas(maquinasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los reportes de clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstadoMaquina = async (maquinaId, nuevoEstado) => {
    try {
      const maquina = maquinas.find(m => m.id === maquinaId);
      if (!maquina) {
        throw new Error('Máquina no encontrada');
      }

      const updateData = {
        id: maquina.id,
        numero_serie: maquina.numero_serie,
        nombre: maquina.nombre,
        modelo: maquina.modelo,
        fecha_adquisicion: maquina.fecha_adquisicion,
        fecha_instalacion: maquina.fecha_instalacion,
        estado: nuevoEstado,
        ultima_ubicacion_id: maquina.ubicacion?.id,
        proveedor_id: maquina.proveedor?.id,
        usuario_id: maquina.usuario?.id,
        ultimo_mantenimiento: nuevoEstado === 'Operativo' ? new Date().toISOString() : maquina.ultimo_mantenimiento,
        proximo_mantenimiento: maquina.proximo_mantenimiento,
        notas: `${maquina.notas || ''}\n[ADMIN - ${new Date().toLocaleString()}] Estado cambiado a: ${nuevoEstado}`
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/maquinas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la máquina');
      }

      // Recargar datos
      await cargarDatos();
      toast.success(`Estado de la máquina actualizado a: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error(error.message);
    }
  };

  const reportesFiltrados = reportes.filter(reporte => {
    if (filtroTipo === 'todos') return true;
    if (filtroTipo === 'reportes') return reporte.esReporte;
    if (filtroTipo === 'confirmaciones') return reporte.esConfirmacion;
    return reporte.tipo === filtroTipo;
  });

  const contadores = {
    total: reportes.length,
    reportes: reportes.filter(r => r.esReporte).length,
    confirmaciones: reportes.filter(r => r.esConfirmacion).length,
    pendientes: reportes.filter(r => !r.resultado).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando reportes de clientes...</h5>
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
              <i className="bi bi-chat-square-text me-2" style={{ color: '#6f42c1' }}></i>
              Reportes de Clientes
            </h1>
            <p className="text-muted mb-0">Gestiona los reportes y confirmaciones enviados por los clientes</p>
          </div>
        </div>

        {/* Métricas */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.total}</h3>
                <small className="opacity-75">Total Reportes</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.reportes}</h3>
                <small className="opacity-75">Reportes de Problemas</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.confirmaciones}</h3>
                <small className="opacity-75">Confirmaciones</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.pendientes}</h3>
                <small className="opacity-75">Pendientes</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Filtrar por Tipo:</label>
                <select 
                  className="form-select"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos los reportes</option>
                  <option value="reportes">Reportes de Problemas</option>
                  <option value="confirmaciones">Confirmaciones</option>
                  <option value="Correctivo">Correctivos</option>
                  <option value="Preventivo">Preventivos</option>
                </select>
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <button 
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setFiltroTipo('todos')}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Limpiar Filtros
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={cargarDatos}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Reportes */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Reportes de Clientes ({reportesFiltrados.length})
            </h5>
          </div>
          <div className="card-body p-0">
            {reportesFiltrados.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Máquina</th>
                      <th>Estado Actual</th>
                      <th>Descripción</th>
                      <th>Observaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportesFiltrados.map(reporte => (
                      <ReporteRow 
                        key={reporte.id}
                        reporte={reporte}
                        onVerDetalle={(reporte) => {
                          setReporteSeleccionado(reporte);
                          setShowDetalleModal(true);
                        }}
                        onCambiarEstado={handleCambiarEstadoMaquina}
                      />
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

        {/* Modal Detalle */}
        {showDetalleModal && reporteSeleccionado && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className={`bi ${tipoIcons[reporteSeleccionado.tipo]} me-2`}></i>
                    Detalle del Reporte
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
                      <h6>Información del Reporte</h6>
                      <p><strong>ID:</strong> {reporteSeleccionado.id}</p>
                      <p><strong>Tipo:</strong> 
                        <span className={`badge bg-${tipoColors[reporteSeleccionado.tipo]} ms-2`}>
                          {reporteSeleccionado.tipo}
                        </span>
                      </p>
                      <p><strong>Fecha:</strong> {new Date(reporteSeleccionado.fecha_programada).toLocaleString()}</p>
                      <p><strong>Estado:</strong> {reporteSeleccionado.resultado ? 'Procesado' : 'Pendiente'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Información de la Máquina</h6>
                      <p><strong>Nombre:</strong> {reporteSeleccionado.maquina.nombre}</p>
                      <p><strong>Serie:</strong> {reporteSeleccionado.maquina.numero_serie}</p>
                      <p><strong>Estado Actual:</strong> 
                        <span className={`badge ms-2 ${
                          reporteSeleccionado.maquina.estado === 'Operativo' ? 'bg-success' :
                          reporteSeleccionado.maquina.estado === 'En Mantenimiento' ? 'bg-warning' :
                          reporteSeleccionado.maquina.estado === 'Advertencia' ? 'bg-info' :
                          'bg-danger'
                        }`}>
                          {reporteSeleccionado.maquina.estado}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="mb-3">
                    <h6>Descripción</h6>
                    <p className="text-muted">{reporteSeleccionado.descripcion}</p>
                  </div>
                  
                  {reporteSeleccionado.observaciones && (
                    <div className="mb-3">
                      <h6>Observaciones</h6>
                      <p className="text-muted">{reporteSeleccionado.observaciones}</p>
                    </div>
                  )}
                  
                  {reporteSeleccionado.resultado && (
                    <div className="mb-3">
                      <h6>Resultado</h6>
                      <p className="text-success">{reporteSeleccionado.resultado}</p>
                    </div>
                  )}
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

function ReporteRow({ reporte, onVerDetalle, onCambiarEstado }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Operativo': return 'bg-success';
      case 'En Mantenimiento': return 'bg-warning';
      case 'Advertencia': return 'bg-info';
      case 'Error': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <tr>
      <td>
        <small>{formatDate(reporte.fecha_programada)}</small>
      </td>
      <td>
        <div className="d-flex align-items-center">
          <span className={`badge bg-${tipoColors[reporte.tipo]} me-2`}>
            <i className={`bi ${tipoIcons[reporte.tipo]} me-1`}></i>
            {reporte.tipo}
          </span>
          {reporte.esReporte && (
            <span className="badge bg-danger">Problema</span>
          )}
          {reporte.esConfirmacion && (
            <span className="badge bg-success">Confirmación</span>
          )}
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
        <span className={`badge ${getEstadoBadgeClass(reporte.maquina.estado)}`}>
          {reporte.maquina.estado}
        </span>
      </td>
      <td>
        <div style={{ maxWidth: '200px' }}>
          <p className="mb-0 small">{reporte.descripcion}</p>
        </div>
      </td>
      <td>
        <div style={{ maxWidth: '200px' }}>
          <small className="text-muted">{reporte.observaciones}</small>
        </div>
      </td>
      <td>
        <div className="btn-group-vertical btn-group-sm">
          <button 
            className="btn btn-outline-info btn-sm"
            onClick={() => onVerDetalle(reporte)}
          >
            <i className="bi bi-eye me-1"></i>
            Ver
          </button>
          
          {reporte.esReporte && reporte.maquina.estado !== 'Error' && (
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={() => onCambiarEstado(reporte.maquina.id, 'Error')}
            >
              <i className="bi bi-exclamation-triangle me-1"></i>
              Marcar Error
            </button>
          )}
          
          {reporte.maquina.estado !== 'Operativo' && (
            <button 
              className="btn btn-outline-success btn-sm"
              onClick={() => onCambiarEstado(reporte.maquina.id, 'Operativo')}
            >
              <i className="bi bi-check-circle me-1"></i>
              Marcar Operativo
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}