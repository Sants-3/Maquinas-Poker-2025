"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const statusColors = {
  'Operativa': 'success',
  'En mantenimiento': 'warning',
  'Fuera de servicio': 'danger'
};

const statusIcons = {
  'Operativa': 'bi-check-circle-fill',
  'En mantenimiento': 'bi-tools',
  'Fuera de servicio': 'bi-exclamation-triangle-fill'
};

export default function ReporteInventario() {
  const { data: session } = useSession();
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
    if (!session) return;

    const fetchMachines = async () => {
      try {
        const response = await fetch('/api/cliente/machines', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        setMachines(data);
      } catch (err) {
        console.error('Error al cargar máquinas:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, [session]);

  const handleReportSubmit = async () => {
    if (!selectedMachine || !reportData.description.trim()) {
      toast.warning('Por favor complete la descripción del problema');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cliente/machines/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          machineId: selectedMachine.id,
          description: reportData.description,
          severity: reportData.severity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar reporte');
      }

      // Actualizar estado local
      const updatedResponse = await fetch('/api/cliente/machines', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });
      const updatedData = await updatedResponse.json();
      setMachines(updatedData);

      setShowReportModal(false);
      setReportData({ description: '', severity: 'Media' });
      toast.success('Reporte enviado correctamente');
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
      const response = await fetch(`/api/cliente/machines/${machineId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ status: 'Operativa' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar estado');
      }

      // Actualizar estado local
      setMachines(prev => prev.map(m => 
        m.id === machineId ? { ...m, status: 'Operativa' } : m
      ));
      toast.success('Máquina marcada como operativa');
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando inventario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h5 className="alert-heading">Error al cargar el inventario</h5>
          <p>{error}</p>
          <button 
            className="btn btn-danger"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const filteredMachines = {
    operational: machines.filter(m => m.status === 'Operativa'),
    maintenance: machines.filter(m => m.status === 'En mantenimiento'),
    outOfService: machines.filter(m => m.status === 'Fuera de servicio')
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Inventario de Máquinas de Poker</h1>
      
      {/* Máquinas Operativas */}
      <div className="mb-5">
        <h2 className="text-success mb-3">
          <i className={`bi ${statusIcons['Operativa']} me-2`}></i>
          Máquinas Operativas ({filteredMachines.operational.length})
        </h2>
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
          <div className="alert alert-info">
            No hay máquinas operativas registradas
          </div>
        )}
      </div>

      {/* Máquinas en Mantenimiento */}
      <div className="mb-5">
        <h2 className="text-warning mb-3">
          <i className={`bi ${statusIcons['En mantenimiento']} me-2`}></i>
          Máquinas en Mantenimiento ({filteredMachines.maintenance.length})
        </h2>
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
          <div className="alert alert-info">
            No hay máquinas en mantenimiento
          </div>
        )}
      </div>

      {/* Máquinas Fuera de Servicio */}
      <div className="mb-5">
        <h2 className="text-danger mb-3">
          <i className={`bi ${statusIcons['Fuera de servicio']} me-2`}></i>
          Máquinas Fuera de Servicio ({filteredMachines.outOfService.length})
        </h2>
        {filteredMachines.outOfService.length > 0 ? (
          <div className="row g-3">
            {filteredMachines.outOfService.map(machine => (
              <MachineCard 
                key={machine.id}
                machine={machine}
                disabled={isLoading}
              />
            ))}
          </div>
        ) : (
          <div className="alert alert-info">
            No hay máquinas fuera de servicio
          </div>
        )}
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
                    <span className="text-muted">Modelo:</span>
                    <strong> {selectedMachine?.model}</strong>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Ubicación:</span>
                    <strong> {selectedMachine?.location}</strong>
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
  );
}

function MachineCard({ machine, onReport, onRepair, showRepairButton = false, disabled }) {
  return (
    <div className="col-md-6 col-lg-4">
      <div className={`card h-100 border-${statusColors[machine.status]}`}>
        <div className={`card-header bg-${statusColors[machine.status]} text-white d-flex justify-content-between`}>
          <h5 className="card-title mb-0">{machine.name}</h5>
          <span className="badge bg-light text-dark">{machine.status}</span>
        </div>
        <div className="card-body">
          <div className="mb-2">
            <span className="text-muted">ID:</span>
            <strong> {machine.id}</strong>
          </div>
          <div className="mb-2">
            <span className="text-muted">Modelo:</span>
            <strong> {machine.model}</strong>
          </div>
          <div className="mb-2">
            <span className="text-muted">Ubicación:</span>
            <strong> {machine.location}</strong>
          </div>
          <div className="mb-2">
            <span className="text-muted">Tarifa por hora:</span>
            <strong> ${machine.hourly_rate?.toFixed(2) || '0.00'}</strong>
          </div>
          <div>
            <span className="text-muted">Último mantenimiento:</span>
            <strong> {machine.last_maintenance || 'No registrado'}</strong>
          </div>
        </div>
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between">
            {machine.status === 'Operativa' && (
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={onReport}
                disabled={disabled}
              >
                <i className="bi bi-exclamation-triangle me-1"></i>
                Reportar Falla
              </button>
            )}
            
            {showRepairButton && (
              <button 
                className="btn btn-sm btn-success"
                onClick={onRepair}
                disabled={disabled}
              >
                <i className="bi bi-check-circle me-1"></i>
                Marcar como Reparada
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}