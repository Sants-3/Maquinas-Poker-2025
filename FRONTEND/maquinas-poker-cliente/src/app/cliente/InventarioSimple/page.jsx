"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function InventarioSimple() {
  const { data: session } = useSession();
  const [machines, setMachines] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    name: '',
    model: '',
    location: '',
    reason: ''
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

  const handleRequestSubmit = async () => {
    if (!requestData.name.trim() || !requestData.reason.trim()) {
      toast.warning('Por favor complete al menos el nombre y el motivo de la solicitud');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cliente/machines/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar solicitud');
      }

      toast.success('Solicitud enviada correctamente');
      setShowRequestModal(false);
      setRequestData({
        name: '',
        model: '',
        location: '',
        reason: ''
      });
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Inventario de Máquinas de Poker</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowRequestModal(true)}
          disabled={isLoading}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Solicitar Nueva Máquina
        </button>
      </div>

      {machines.length === 0 ? (
        <div className="alert alert-info">
          No hay máquinas registradas en su inventario
        </div>
      ) : (
        <div className="row g-3">
          {machines.map(machine => (
            <div key={machine.id} className="col-md-6 col-lg-4">
              <div className={`card h-100 border-${statusColors[machine.status]}`}>
                <div className={`card-header bg-${statusColors[machine.status]} text-white`}>
                  <h5 className="card-title mb-0">{machine.name}</h5>
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
                    <span className="text-muted">Estado:</span>
                    <span className={`badge bg-${statusColors[machine.status]}`}>
                      {machine.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted">Ubicación:</span>
                    <strong> {machine.location}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Tarifa por hora:</span>
                    <strong> ${machine.hourly_rate?.toFixed(2) || '0.00'}</strong>
                  </div>
                </div>
                <div className="card-footer bg-white small text-muted">
                  Último mantenimiento: {machine.last_maintenance || 'No registrado'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para solicitar nueva máquina */}
      {showRequestModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Solicitar Nueva Máquina de Poker</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => !isLoading && setShowRequestModal(false)}
                  disabled={isLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nombre de la máquina*
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Ej: Máquina de Poker Texas Hold'em"
                    value={requestData.name}
                    onChange={(e) => setRequestData({...requestData, name: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="model" className="form-label">
                    Modelo deseado
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="model"
                    placeholder="Ej: IGT Game King"
                    value={requestData.model}
                    onChange={(e) => setRequestData({...requestData, model: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="location" className="form-label">
                    Ubicación preferida
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    placeholder="Ej: Sala Principal, Bar, etc."
                    value={requestData.location}
                    onChange={(e) => setRequestData({...requestData, location: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="reason" className="form-label">
                    Motivo de la solicitud*
                  </label>
                  <textarea
                    className="form-control"
                    id="reason"
                    rows={4}
                    placeholder="Explique por qué necesita esta nueva máquina..."
                    value={requestData.reason}
                    onChange={(e) => setRequestData({...requestData, reason: e.target.value})}
                    required
                    disabled={isLoading}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => !isLoading && setShowRequestModal(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleRequestSubmit}
                  disabled={isLoading || !requestData.name.trim() || !requestData.reason.trim()}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Enviando...
                    </>
                  ) : 'Enviar Solicitud'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const statusColors = {
  'Operativa': 'success',
  'En mantenimiento': 'warning',
  'Fuera de servicio': 'danger'
};