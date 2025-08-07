"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { reporteService } from '@/services/reporteService';
import ClienteNavbar from '@/components/ClienteNavbar';
import Link from 'next/link';

const statusColors = {
  'Operativo': 'success',
  'En Mantenimiento': 'warning',
  'Advertencia': 'warning',
  'Error': 'danger',
  'Fuera de Servicio': 'danger'
};

const statusIcons = {
  'Operativo': 'bi-check-circle-fill',
  'En Mantenimiento': 'bi-tools',
  'Advertencia': 'bi-exclamation-triangle-fill',
  'Error': 'bi-x-octagon-fill',
  'Fuera de Servicio': 'bi-x-octagon-fill'
};

export default function ReporteInventario() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [machines, setMachines] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [reportData, setReportData] = useState({
    description: '',
    severity: 'Media'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'cliente') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken) return;

    const fetchMachines = async () => {
      try {
        const machines = await reporteService.obtenerMaquinasCliente(session.accessToken);
        setMachines(machines);
      } catch (err) {
        console.error('Error al cargar máquinas:', err);
        setError(err.message);
        toast.error(err.message);
        setMachines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, [status, session]);

  const handleReportSubmit = async () => {
    if (!selectedMachine || !reportData.description.trim()) {
      toast.warning('Por favor complete la descripción del problema');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Enviando reporte con datos:', {
        maquinaId: selectedMachine.id,
        descripcion: reportData.description,
        gravedad: reportData.severity
      });

      const resultado = await reporteService.reportarProblema(session.accessToken, {
        maquinaId: selectedMachine.id,
        descripcion: reportData.description,
        gravedad: reportData.severity
      });

      console.log('Resultado del reporte:', resultado);

      // Recargar las máquinas para ver el cambio de estado
      const updatedMachines = await reporteService.obtenerMaquinasCliente(session.accessToken);
      setMachines(updatedMachines);

      setShowReportModal(false);
      setReportData({ description: '', severity: 'Media' });
      
      // Mostrar mensaje de éxito
      toast.success(resultado.message || 'Reporte enviado correctamente');
      
      // Mostrar información sobre el cambio de estado
      if (resultado.estado_anterior && resultado.nuevoEstado) {
        toast.info(`Estado cambiado de "${resultado.estado_anterior}" a "${resultado.nuevoEstado}"`, {
          autoClose: 5000
        });
      } else if (resultado.nuevo_estado) {
        toast.info(`Máquina marcada como "${resultado.nuevo_estado}"`, {
          autoClose: 5000
        });
      } else {
        toast.info('Reporte procesado. El estado de la máquina será actualizado.', {
          autoClose: 5000
        });
      }
    } catch (err) {
      console.error('Error al enviar reporte:', err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsOperational = async (machineId) => {
    if (!confirm('¿Está seguro que desea marcar esta máquina como operativa?')) return;

    setIsLoading(true);
    try {
      const resultado = await reporteService.marcarComoOperativa(session.accessToken, machineId);

      // Recargar las máquinas
      const updatedMachines = await reporteService.obtenerMaquinasCliente(session.accessToken);
      setMachines(updatedMachines);

      toast.success(resultado.message);
      toast.info('Su confirmación ha sido enviada al administrador.', {
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportProblem = (machine) => {
    setSelectedMachine(machine);
    setShowReportModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando máquinas...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container py-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5" style={{ backgroundColor: '#ffffff' }}>
              <i className="bi bi-exclamation-triangle display-1 text-danger mb-3"></i>
              <h4 className="text-danger mb-2">Error al cargar las máquinas</h4>
              <p className="text-muted mb-3">{error}</p>
              <button 
                className="btn btn-danger"
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredMachines = {
    operational: machines.filter(m => m.estado === 'Operativo'),
    maintenance: machines.filter(m => m.estado === 'En Mantenimiento'),
    warning: machines.filter(m => m.estado === 'Advertencia'),
    outOfService: machines.filter(m => m.estado === 'Error' || m.estado === 'Fuera de Servicio')
  };

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
                  <i className="bi bi-clipboard-check me-2" style={{ color: '#6f42c1' }}></i>
                  Reporte de Estado de Máquinas
                </h1>
                <p className="text-muted mb-0">Reporta problemas o confirma el buen funcionamiento de tus máquinas</p>
              </div>
              
              {/* Botones de navegación */}
              <div className="d-flex gap-2 flex-wrap">
                <Link href="/cliente/DashboardCliente" className="btn btn-outline-primary">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>
                <Link href="/cliente/InventarioSimple" className="btn btn-outline-primary">
                  <i className="bi bi-boxes me-2"></i>
                  Inventario
                </Link>
                <button className="btn btn-primary active" disabled>
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Reportes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de estados */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Operativas</h6>
                  <i className="bi bi-check-circle-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{filteredMachines.operational.length}</h2>
                <small className="opacity-75">Funcionando correctamente</small>
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
                <h2 className="mb-1 fw-bold">{filteredMachines.maintenance.length}</h2>
                <small className="opacity-75">Requieren servicio</small>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="card-title mb-0 fw-semibold opacity-75">Con Advertencias</h6>
                  <i className="bi bi-exclamation-triangle-fill fs-4 opacity-75"></i>
                </div>
                <h2 className="mb-1 fw-bold">{filteredMachines.warning.length}</h2>
                <small className="opacity-75">Requieren atención</small>
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
                <h2 className="mb-1 fw-bold">{filteredMachines.outOfService.length}</h2>
                <small className="opacity-75">Máquinas no operativas</small>
              </div>
            </div>
          </div>
        </div>
      
        {/* Máquinas Operativas */}
        <div className="mb-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#43e97b', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <h3 className="h5 mb-0 text-white">
                <i className={`bi ${statusIcons['Operativo']} me-2`}></i>
                Máquinas Operativas ({filteredMachines.operational.length})
              </h3>
            </div>
            <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
              {filteredMachines.operational.length > 0 ? (
                <div className="row g-3">
                  {filteredMachines.operational.map(machine => (
                    <MachineCard 
                      key={machine.id}
                      machine={machine}
                      onReport={() => {
                        setSelectedMachine(machine);
                        setShowReportModal(true);
                      }}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle display-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No hay máquinas operativas registradas</h5>
                  <p className="text-muted">Todas tus máquinas pueden requerir atención</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Máquinas en Mantenimiento */}
        <div className="mb-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#ffeaa7', background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
              <h3 className="h5 mb-0 text-white">
                <i className={`bi ${statusIcons['En Mantenimiento']} me-2`}></i>
                Máquinas en Mantenimiento ({filteredMachines.maintenance.length})
              </h3>
            </div>
            <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
              {filteredMachines.maintenance.length > 0 ? (
                <div className="row g-3">
                  {filteredMachines.maintenance.map(machine => (
                    <MachineCard 
                      key={machine.id}
                      machine={machine}
                      onRepair={() => handleMarkAsOperational(machine.id)}
                      disabled={isLoading}
                      showRepairButton
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-tools display-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No hay máquinas en mantenimiento</h5>
                  <p className="text-muted">Todas tus máquinas están funcionando correctamente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Máquinas con Advertencias */}
        <div className="mb-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header" style={{ backgroundColor: '#4facfe', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <h3 className="h5 mb-0 text-white">
                <i className={`bi ${statusIcons['Advertencia']} me-2`}></i>
                Máquinas con Advertencias ({filteredMachines.warning.length})
              </h3>
            </div>
            <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
              {filteredMachines.warning.length > 0 ? (
                <div className="row g-3">
                  {filteredMachines.warning.map(machine => (
                    <MachineCard 
                      key={machine.id}
                      machine={machine}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-exclamation-triangle display-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No hay máquinas con advertencias</h5>
                  <p className="text-muted">Todas tus máquinas están en buen estado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Máquinas Fuera de Servicio */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-danger text-white py-3">
            <h5 className="mb-0">
              <i className="bi bi-x-octagon-fill me-2"></i>
              Máquinas Fuera de Servicio ({filteredMachines.outOfService.length})
            </h5>
          </div>
          <div className="card-body p-0">
            {filteredMachines.outOfService.length > 0 ? (
              <div className="table-responsive">
                {filteredMachines.outOfService.map(machine => (
                  <div key={machine.id} className="border-bottom p-3">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div className="d-flex align-items-center mb-2">
                          <span className={`badge bg-${statusColors[machine.estado]} me-2`}>
                            <i className={`${statusIcons[machine.estado]} me-1`}></i>
                            {machine.estado === 'Error' ? 'Fuera de Servicio' : machine.estado}
                          </span>
                          <h6 className="mb-0 fw-semibold">{machine.nombre}</h6>
                        </div>
                        <p className="text-muted mb-1">
                          <i className="bi bi-geo-alt me-1"></i>
                          {machine.ubicacion?.nombre || 'Sin ubicación'}
                        </p>
                        <p className="text-muted mb-0 small">
                          <i className="bi bi-hash me-1"></i>
                          Serie: {machine.numero_serie}
                        </p>
                      </div>
                      <div className="col-md-4 text-md-end">
                        {machine.estado === 'En Mantenimiento' ? (
                          <span className="badge bg-warning">En Mantenimiento - Contacte al administrador</span>
                        ) : machine.estado === 'Error' || machine.estado === 'Fuera de Servicio' ? (
                          <span className="badge bg-danger">Fuera de Servicio - Contacte al administrador</span>
                        ) : (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleReportProblem(machine)}
                            title="Reportar problema"
                          >
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Reportar Problema
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-check-circle text-success fs-1 mb-3"></i>
                <h5 className="text-muted">¡Excelente!</h5>
                <p className="text-muted mb-0">No hay máquinas fuera de servicio</p>
              </div>
            )}
          </div>
        </div>

      {/* Modal para reportar fallas */}
      {showReportModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Reportar Problema en Máquina</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => !isLoading && setShowReportModal(false)}
                  disabled={isLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6>Detalles de la Máquina</h6>
                  <div className="mb-2">
                    <span className="text-muted">ID:</span>
                    <strong> {selectedMachine?.id}</strong>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Nombre:</span>
                    <strong> {selectedMachine?.nombre}</strong>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Modelo:</span>
                    <strong> {selectedMachine?.modelo}</strong>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Serie:</span>
                    <strong> {selectedMachine?.numero_serie}</strong>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Ubicación:</span>
                    <strong> {selectedMachine?.ubicacion?.nombre || 'No asignada'}</strong>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="severity" className="form-label">Gravedad del problema:</label>
                  <select
                    className="form-select"
                    id="severity"
                    value={reportData.severity}
                    onChange={(e) => setReportData({...reportData, severity: e.target.value})}
                    disabled={isLoading}
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Descripción detallada del problema:
                  </label>
                  <textarea 
                    className="form-control" 
                    id="description" 
                    rows={5}
                    placeholder="Describa el problema con todos los detalles..."
                    value={reportData.description}
                    onChange={(e) => setReportData({...reportData, description: e.target.value})}
                    required
                    disabled={isLoading}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => !isLoading && setShowReportModal(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleReportSubmit}
                  disabled={!reportData.description.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Enviando...
                    </>
                  ) : 'Enviar Reporte'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}

function MachineCard({ machine, onReport, onRepair, showRepairButton = false, disabled }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'No registrado';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
        <div className={`card-header d-flex justify-content-between align-items-center`} 
             style={{ backgroundColor: statusColors[machine.estado] === 'success' ? '#43e97b' : 
                                      statusColors[machine.estado] === 'warning' ? '#ffeaa7' : 
                                      statusColors[machine.estado] === 'danger' ? '#f093fb' : '#6c757d' }}>
          <h5 className="card-title mb-0 text-white fw-bold">{machine.nombre}</h5>
          <span className="badge bg-light text-dark fs-6">
            <i className={`bi ${statusIcons[machine.estado]} me-1`}></i>
            {machine.estado}
          </span>
        </div>
        <div className="card-body">
          <div className="mb-2">
            <span className="text-muted">ID:</span>
            <strong className="text-primary"> #{machine.id}</strong>
          </div>
          <div className="mb-2">
            <span className="text-muted">Serie:</span>
            <strong> {machine.numero_serie}</strong>
          </div>
          <div className="mb-2">
            <span className="text-muted">Modelo:</span>
            <strong> {machine.modelo}</strong>
          </div>
          <div className="mb-2">
            <span className="text-muted">Ubicación:</span>
            <strong> 
              <i className="bi bi-geo-alt me-1" style={{ color: '#6f42c1' }}></i>
              {machine.ubicacion?.nombre || 'No asignada'}
            </strong>
          </div>
          <div className="mb-2">
            <span className="text-muted">Instalación:</span>
            <strong> {formatDate(machine.fecha_instalacion)}</strong>
          </div>
          <div>
            <span className="text-muted">Último mantenimiento:</span>
            <strong> {formatDate(machine.ultimo_mantenimiento)}</strong>
          </div>
          
          {machine.notas && (
            <div className="mt-3 pt-3 border-top">
              <small className="text-muted d-block mb-1">Notas:</small>
              <p className="small text-dark mb-0" style={{ fontSize: '0.85rem', maxHeight: '60px', overflow: 'hidden' }}>
                {machine.notas}
              </p>
            </div>
          )}
        </div>
        <div className="card-footer bg-white border-0">
          <div className="d-flex justify-content-between gap-2">
            {machine.estado === 'Operativo' && (
              <button 
                className="btn btn-sm btn-outline-danger flex-fill"
                onClick={onReport}
                disabled={disabled}
              >
                <i className="bi bi-exclamation-triangle me-1"></i>
                Reportar Problema
              </button>
            )}
            
            {showRepairButton && (
              <button 
                className="btn btn-sm btn-success flex-fill"
                onClick={onRepair}
                disabled={disabled}
              >
                <i className="bi bi-check-circle me-1"></i>
                Marcar como Operativa
              </button>
            )}
            
            {machine.estado === 'Advertencia' && (
              <div className="text-center w-100">
                <small className="text-warning">
                  <i className="bi bi-tools me-1"></i>
                  Se está trabajando en el mantenimiento
                </small>
              </div>
            )}
            
            {machine.estado === 'Error' && (
              <div className="text-center w-100">
                <small className="text-danger">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Requiere atención técnica
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}