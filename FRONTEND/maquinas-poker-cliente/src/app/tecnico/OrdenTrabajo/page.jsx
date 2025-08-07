'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

export default function OrdenesTecnico() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pendiente');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (sessionStatus === 'authenticated' && session.user.role === 'tecnico') {
      fetchOrders();
    }
  }, [sessionStatus, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular datos de órdenes de trabajo
      const mockOrders = [
        {
          id: 1,
          titulo: 'Mantenimiento preventivo - Máquina #001',
          descripcion: 'Realizar mantenimiento preventivo completo',
          estado: 'Pendiente',
          prioridad: 'Alta',
          fechaCreacion: '2024-01-15',
          fechaVencimiento: '2024-01-20',
          maquina: { 
            id: 1,
            nombre: 'Máquina Poker #001', 
            numero_serie: 'MP001',
            ubicacion: { nombre: 'Casino Central' }
          },
          cliente: { nombre: 'Casino Central S.A.' }
        },
        {
          id: 2,
          titulo: 'Reparación de pantalla - Máquina #005',
          descripcion: 'La pantalla táctil no responde correctamente',
          estado: 'En progreso',
          prioridad: 'Crítica',
          fechaCreacion: '2024-01-14',
          fechaVencimiento: '2024-01-16',
          maquina: { 
            id: 5,
            nombre: 'Máquina Poker #005', 
            numero_serie: 'MP005',
            ubicacion: { nombre: 'Sucursal Norte' }
          },
          cliente: { nombre: 'Norte Gaming Ltd.' }
        },
        {
          id: 3,
          titulo: 'Cambio de componentes - Máquina #003',
          descripcion: 'Reemplazar componentes defectuosos del sistema de pago',
          estado: 'Completada',
          prioridad: 'Media',
          fechaCreacion: '2024-01-13',
          fechaVencimiento: '2024-01-18',
          maquina: { 
            id: 3,
            nombre: 'Máquina Poker #003', 
            numero_serie: 'MP003',
            ubicacion: { nombre: 'Casino Sur' }
          },
          cliente: { nombre: 'Sur Entertainment' }
        }
      ];

      // Filtrar por estado
      const filteredOrders = mockOrders.filter(order => order.estado === filter);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setError(error.message);
      setOrders([]);
      toast.error('Error al cargar las órdenes de trabajo');
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando...</h5>
        </div>
      </div>
    );
  }

  if (session?.user.role !== 'tecnico') {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container py-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-shield-exclamation display-1 text-danger mb-3"></i>
              <h4 className="text-danger mb-2">Acceso Denegado</h4>
              <p className="text-muted">No tienes permisos para ver esta página</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
      case 'Asignada': return 'info';
      case 'En progreso': return 'primary';
      case 'Completada': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="h2 mb-1 text-dark">
              <i className="bi bi-list-check me-2" style={{ color: '#6f42c1' }}></i>
              Mis Órdenes de Trabajo
            </h1>
            <p className="text-muted mb-0">Gestiona y actualiza el estado de tus órdenes asignadas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="row mb-4">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-3">
                  <i className="bi bi-funnel me-2"></i>
                  Filtrar por Estado
                </h6>
                <div className="btn-group" role="group">
                  {['Pendiente', 'Asignada', 'En progreso', 'Completada'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilter(status)}
                      className={`btn ${
                        filter === status 
                          ? `btn-${getStatusColor(status)}` 
                          : 'btn-outline-secondary'
                      }`}
                    >
                      <i className={`bi ${
                        status === 'Pendiente' ? 'bi-clock' :
                        status === 'Asignada' ? 'bi-person-check' :
                        status === 'En progreso' ? 'bi-gear' :
                        'bi-check-circle'
                      } me-1`}></i>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="row mb-4">
            <div className="col">
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Listado de órdenes */}
        <div className="row">
          <div className="col">
            <div className="card border-0 shadow-sm">
              <div className="card-header" style={{ backgroundColor: '#6f42c1', background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)' }}>
                <h3 className="h5 mb-0 text-white">
                  <i className="bi bi-clipboard-check me-2"></i>
                  Órdenes {filter} ({orders.length})
                </h3>
              </div>
              <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border mb-3" role="status" style={{ color: '#6f42c1' }}>
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <h5 className="text-muted">Cargando órdenes...</h5>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-clipboard-x display-1 text-muted mb-3"></i>
                    <h5 className="text-muted">No hay órdenes {filter.toLowerCase()}</h5>
                    <p className="text-muted">No tienes órdenes con estado "{filter}" en este momento.</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {orders.map((order) => (
                      <div key={order.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm hover-shadow">
                          <div className="card-header d-flex justify-content-between align-items-center" 
                               style={{ backgroundColor: '#f8f9fa' }}>
                            <h6 className="card-title mb-0 fw-bold">Orden #{order.id}</h6>
                            <span className={`badge bg-${getPriorityColor(order.prioridad)}`}>
                              {order.prioridad}
                            </span>
                          </div>
                          <div className="card-body">
                            <h6 className="card-title text-primary">{order.titulo}</h6>
                            <p className="card-text text-muted small mb-2">{order.descripcion}</p>
                            
                            <div className="mb-2">
                              <small className="text-muted">Máquina:</small>
                              <div className="fw-semibold">{order.maquina.nombre}</div>
                              <small className="text-muted">
                                <i className="bi bi-geo-alt me-1"></i>
                                {order.maquina.ubicacion.nombre}
                              </small>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted">Cliente:</small>
                              <div className="fw-semibold">{order.cliente.nombre}</div>
                            </div>

                            <div className="mb-3">
                              <small className="text-muted">Estado:</small>
                              <div>
                                <span className={`badge bg-${getStatusColor(order.estado)}`}>
                                  <i className={`bi ${
                                    order.estado === 'Pendiente' ? 'bi-clock' :
                                    order.estado === 'Asignada' ? 'bi-person-check' :
                                    order.estado === 'En progreso' ? 'bi-gear' :
                                    'bi-check-circle'
                                  } me-1`}></i>
                                  {order.estado}
                                </span>
                              </div>
                            </div>

                            <div className="row text-center">
                              <div className="col-6">
                                <small className="text-muted d-block">Creada</small>
                                <small className="fw-semibold">
                                  {new Date(order.fechaCreacion).toLocaleDateString('es-ES')}
                                </small>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Vencimiento</small>
                                <small className="fw-semibold text-danger">
                                  {new Date(order.fechaVencimiento).toLocaleDateString('es-ES')}
                                </small>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer bg-white border-0">
                            <div className="d-grid">
                              <Link 
                                href={`/tecnico/OrdenTrabajo/${order.id}`}
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Ver Detalles
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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