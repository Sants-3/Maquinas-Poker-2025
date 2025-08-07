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
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);
  const [tiempoEstimado, setTiempoEstimado] = useState(2);

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
      
      // Usar la nueva API de reportes de cliente
      const reportesClientes = await reporteService.obtenerReportesClientes(session.accessToken);
      console.log('Reportes obtenidos de la API:', reportesClientes);

      // Los reportes ya vienen con información completa desde la API
      const reportesEnriquecidos = reportesClientes.map(reporte => ({
        ...reporte,
        // Mapear campos para compatibilidad con la vista existente
        id: reporte.id,
        maquinaId: reporte.maquinaId,
        maquinaNombre: reporte.maquina?.nombre,
        maquinaSerie: reporte.maquina?.numero_serie,
        clienteNombre: reporte.cliente?.nombre,
        clienteEmail: reporte.cliente?.email,
        fecha: reporte.fechaReporte,
        fecha_programada: reporte.fechaReporte,
        estado: reporte.estadoReporte,
        resultado: reporte.estadoReporte !== 'pendiente',
        esReporte: reporte.tipo === 'reporte_problema',
        esConfirmacion: reporte.tipo === 'confirmacion_operativa',
        tipo: reporte.tipo === 'reporte_problema' ? 'Correctivo' : 'Preventivo',
        // Campos adicionales para la vista
        estadoAnterior: reporte.estadoAnterior,
        estadoNuevo: reporte.estadoNuevo,
        descripcion: reporte.descripcion,
        gravedad: reporte.gravedad
      }));

      setReportes(reportesEnriquecidos);
      
      // También cargar máquinas para otras funcionalidades
      const maquinasData = await reporteService.obtenerMaquinasCliente(session.accessToken);
      setMaquinas(maquinasData);
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los reportes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarEstadoReporte = async (reporteId, nuevoEstado, observaciones = '') => {
    try {
      await reporteService.actualizarReporte(session.accessToken, {
        id: reporteId,
        estado: nuevoEstado,
        observaciones_admin: observaciones,
        fecha_procesado: new Date()
      });
      
      // Recargar datos
      await cargarDatos();
      toast.success(`Reporte marcado como ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al actualizar reporte:', error);
      toast.error('Error al actualizar el reporte: ' + error.message);
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

      const response = await fetch(`http://localhost:4000/api/maquinas`, {
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

  // Función para eliminar reporte
  const eliminarReporte = async (reporteId) => {
    if (!confirm('¿Está seguro de que desea eliminar este reporte? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/reportes-cliente`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ id: reporteId })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar reporte');
      }

      await cargarDatos();
      toast.success('Reporte eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      toast.error('Error al eliminar el reporte: ' + error.message);
    }
  };

  // Función para cargar técnicos
  const cargarTecnicos = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/tecnicos?activo=true`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
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

  // Función para abrir modal de asignar técnico
  const abrirModalAsignar = (reporte) => {
    setReporteSeleccionado(reporte);
    setTecnicoSeleccionado(null);
    
    // Establecer tiempo estimado basado en gravedad
    if (reporte.gravedad === 'Crítica') {
        setTiempoEstimado(1);
    } else if (reporte.gravedad === 'Alta') {
        setTiempoEstimado(2);
    } else if (reporte.gravedad === 'Media') {
        setTiempoEstimado(4);
    } else {
        setTiempoEstimado(2);
    }
    setShowAsignarModal(true);
    
    // Cargar técnicos si no están cargados
    if (tecnicos.length === 0) {
      cargarTecnicos();
    }
  };

  // Función para asignar técnico
  const asignarTecnico = async () => {
    // Validaciones previas
    if (!reporteSeleccionado || !tecnicoSeleccionado) {
      toast.error('Debe seleccionar un técnico');
      return;
    }

    if (!tiempoEstimado || tiempoEstimado <= 0) {
      toast.error('Debe especificar un tiempo estimado válido');
      return;
    }

    // Validar que el técnico seleccionado existe en la lista
    const tecnicoValido = tecnicos.find(t => t.id === Number(tecnicoSeleccionado));
    if (!tecnicoValido) {
      toast.error('El técnico seleccionado no es válido');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/ordenes-trabajo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
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
      await cargarDatos();
      setShowAsignarModal(false);
      setTecnicoSeleccionado(null);
      setTiempoEstimado(2);
      toast.success(`Técnico ${tecnicoValido.nombre} asignado correctamente`);
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      
      // Manejo específico de errores
      if (error.message.includes('no existe')) {
        toast.error('El técnico seleccionado no existe en el sistema');
      } else if (error.message.includes('no es un técnico')) {
        toast.error('El usuario seleccionado no tiene permisos de técnico');
      } else {
        toast.error('Error al asignar el técnico: ' + error.message);
      }
    }
  };

  const reportesFiltrados = reportes.filter(reporte => {
    if (filtroTipo === 'todos') return true;
    if (filtroTipo === 'reportes') return reporte.tipo === 'reporte_problema';
    if (filtroTipo === 'confirmaciones') return reporte.tipo === 'confirmacion_operativa';
    if (filtroTipo === 'pendientes') return reporte.estadoReporte === 'pendiente';
    if (filtroTipo === 'procesados') return reporte.estadoReporte === 'procesado';
    if (filtroTipo === 'resueltos') return reporte.estadoReporte === 'resuelto';
    return reporte.tipo === filtroTipo;
  });

  const contadores = {
    total: reportes.length,
    reportes: reportes.filter(r => r.tipo === 'reporte_problema').length,
    confirmaciones: reportes.filter(r => r.tipo === 'confirmacion_operativa').length,
    pendientes: reportes.filter(r => r.estadoReporte === 'pendiente').length
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
                  <option value="pendientes">Pendientes</option>
                  <option value="procesados">Procesados</option>
                  <option value="resueltos">Resueltos</option>
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
                      <th>Cliente</th>
                      <th>Máquina</th>
                      <th>Gravedad</th>
                      <th>Estado Reporte</th>
                      <th>Descripción</th>
                      <th>Cambio de Estado</th>
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
                        onActualizarReporte={actualizarEstadoReporte}
                        onEliminarReporte={eliminarReporte}
                        onAsignarTecnico={abrirModalAsignar}
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
                      <p><strong>Cliente:</strong> {reporteSeleccionado.clienteNombre || reporteSeleccionado.cliente?.nombre}</p>
                      <p><strong>Gravedad:</strong> 
                        <span className={`badge ms-2 ${
                          reporteSeleccionado.gravedad === 'Crítica' ? 'bg-danger' :
                          reporteSeleccionado.gravedad === 'Alta' ? 'bg-warning' :
                          reporteSeleccionado.gravedad === 'Media' ? 'bg-info' :
                          'bg-secondary'
                        }`}>
                          {reporteSeleccionado.gravedad}
                        </span>
                      </p>
                      <p><strong>Fecha:</strong> {new Date(reporteSeleccionado.fecha_programada).toLocaleString()}</p>
                      <p><strong>Estado del Reporte:</strong> 
                        <span className={`badge ms-2 ${
                          reporteSeleccionado.estadoReporte === 'pendiente' ? 'bg-warning' :
                          reporteSeleccionado.estadoReporte === 'procesado' ? 'bg-info' :
                          reporteSeleccionado.estadoReporte === 'resuelto' ? 'bg-success' :
                          'bg-secondary'
                        }`}>
                          {reporteSeleccionado.estadoReporte || reporteSeleccionado.estado}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6>Información de la Máquina</h6>
                      <p><strong>Nombre:</strong> {reporteSeleccionado.maquinaNombre || reporteSeleccionado.maquina?.nombre}</p>
                      <p><strong>Serie:</strong> {reporteSeleccionado.maquinaSerie || reporteSeleccionado.maquina?.numero_serie}</p>
                      <p><strong>Cambio de Estado:</strong></p>
                      <small>
                        <strong>De:</strong> {reporteSeleccionado.estadoAnterior}<br/>
                        <strong>A:</strong> {reporteSeleccionado.estadoNuevo}
                      </small>
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

        {/* Modal para Asignar Técnico */}
        {showAsignarModal && reporteSeleccionado && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
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
                  {/* Información del Reporte */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Información del Reporte</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <p><strong>ID:</strong> #{reporteSeleccionado.id}</p>
                          <p><strong>Cliente:</strong> {reporteSeleccionado.clienteNombre}</p>
                          <p><strong>Máquina:</strong> {reporteSeleccionado.maquinaNombre}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Gravedad:</strong> 
                            <span className={`badge ms-2 bg-${reporteSeleccionado.gravedad === 'Crítica' ? 'danger' : reporteSeleccionado.gravedad === 'Alta' ? 'warning' : 'info'}`}>
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
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Asignación de Técnico</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-8">
                          <label className="form-label">Seleccionar Técnico</label>
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
                          <label className="form-label">Tiempo Estimado (horas)</label>
                          <input 
                            type="number"
                            className="form-control"
                            min="1"
                            max="24"
                            value={tiempoEstimado}
                            onChange={(e) => setTiempoEstimado(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      {tecnicoSeleccionado && (
                        <div className="mt-3 p-3 bg-light rounded">
                          <h6>Técnico Seleccionado:</h6>
                          {tecnicos.find(t => t.id == tecnicoSeleccionado) && (
                            <div>
                              <p><strong>Nombre:</strong> {tecnicos.find(t => t.id == tecnicoSeleccionado).nombre}</p>
                              <p><strong>Teléfono:</strong> {tecnicos.find(t => t.id == tecnicoSeleccionado).telefono || 'N/A'}</p>
                              <p><strong>Email:</strong> {tecnicos.find(t => t.id == tecnicoSeleccionado).email}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
                    <i className="bi bi-person-plus me-2"></i>
                    Asignar Técnico
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

function ReporteRow({ reporte, onVerDetalle, onCambiarEstado, onActualizarReporte, onEliminarReporte, onAsignarTecnico }) {
  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-warning';
      case 'procesado': return 'bg-info';
      case 'resuelto': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  return (
    <tr>
      <td>{reporte.clienteNombre || reporte.cliente?.nombre}</td>
      <td>{reporte.maquinaNombre || reporte.maquina?.nombre}</td>
      <td>{reporte.gravedad}</td>
      <td>
        <span className={`badge ${getEstadoBadgeClass(reporte.estadoReporte || reporte.estado)}`}>
          {reporte.estadoReporte || reporte.estado}
        </span>
      </td>
      <td>{reporte.descripcion}</td>
      <td>
        <small>
          <strong>De:</strong> {reporte.estadoAnterior}<br/>
          <strong>A:</strong> {reporte.estadoNuevo}
        </small>
      </td>
      <td>
        <div className="btn-group-vertical btn-group-sm">
          <button 
            className="btn btn-outline-info btn-sm mb-1"
            onClick={() => onVerDetalle(reporte)}
          >
            <i className="bi bi-eye me-1"></i>
            Ver Detalle
          </button>
          
          {/* Botón Asignar Técnico - solo para reportes pendientes sin técnico */}
          {reporte.estadoReporte === 'pendiente' && !reporte.tecnicoAsignadoId && (
            <button
              className="btn btn-primary btn-sm mb-1"
              onClick={() => onAsignarTecnico(reporte)}
            >
              <i className="bi bi-person-plus me-1"></i>
              Asignar Técnico
            </button>
          )}
          
          {reporte.estadoReporte === 'pendiente' && (
            <>
              <button
                className="btn btn-outline-info btn-sm mb-1"
                onClick={() => onActualizarReporte(reporte.id, 'procesado', 'Reporte revisado por el administrador')}
              >
                <i className="bi bi-check me-1"></i>
                Marcar Procesado
              </button>
              <button
                className="btn btn-outline-success btn-sm mb-1"
                onClick={() => onActualizarReporte(reporte.id, 'resuelto', 'Problema resuelto')}
              >
                <i className="bi bi-check-circle me-1"></i>
                Marcar Resuelto
              </button>
            </>
          )}
          
          {reporte.estadoReporte === 'procesado' && (
            <button
              className="btn btn-outline-success btn-sm mb-1"
              onClick={() => onActualizarReporte(reporte.id, 'resuelto', 'Problema resuelto')}
            >
              <i className="bi bi-check-circle me-1"></i>
              Marcar Resuelto
            </button>
          )}
          
          {/* Botón Eliminar - siempre visible */}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onEliminarReporte(reporte.id)}
            title="Eliminar reporte"
          >
            <i className="bi bi-trash me-1"></i>
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}