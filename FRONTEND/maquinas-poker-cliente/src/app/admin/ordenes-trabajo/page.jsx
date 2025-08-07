"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const estadoColors = {
  'pendiente': 'warning',
  'asignada': 'info',
  'en_proceso': 'primary',
  'completada': 'success',
  'cancelada': 'danger'
};

const estadoIcons = {
  'pendiente': 'bi-clock',
  'asignada': 'bi-person-check',
  'en_proceso': 'bi-gear',
  'completada': 'bi-check-circle',
  'cancelada': 'bi-x-circle'
};

const prioridadColors = {
  'Baja': 'success',
  'Media': 'warning',
  'Alta': 'danger',
  'Crítica': 'dark'
};

export default function OrdenesTrabajoAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState('');

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
      
      // Cargar mantenimientos desde la API
      const mantenimientosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mantenimiento`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });

      let mantenimientos = [];
      if (mantenimientosResponse.ok) {
        mantenimientos = await mantenimientosResponse.json();
      }

      // Transformar mantenimientos a formato de órdenes de trabajo
      const ordenesTransformadas = mantenimientos.map(mant => ({
        id: mant.id,
        codigo: `MT-${mant.id.toString().padStart(3, '0')}`,
        maquina: mant.ordenTrabajo?.maquina || { 
          id: 0, 
          nombre: 'Máquina no especificada', 
          numero_serie: 'N/A' 
        },
        descripcion: mant.descripcion || 'Sin descripción',
        prioridad: mant.tipo === 'Correctivo' ? 'Alta' : 'Media',
        estado: mant.resultado ? 'completada' : 'pendiente',
        fecha_creacion: new Date(mant.fecha_programada || Date.now()),
        cliente_comentarios: mant.observaciones || '',
        tecnico_asignado: mant.tecnico ? {
          id: mant.tecnico.id,
          nombre: mant.tecnico.nombre || 'Técnico asignado'
        } : null
      }));

      // Simular datos de técnicos (en producción vendrían de la API)
      const tecnicosSimulados = [
        { id: 1, nombre: 'Juan Pérez', especialidad: 'Electrónica' },
        { id: 2, nombre: 'María García', especialidad: 'Software' },
        { id: 3, nombre: 'Carlos López', especialidad: 'Mecánica' }
      ];

      setOrdenes(ordenesTransformadas);
      setTecnicos(tecnicosSimulados);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar las órdenes de trabajo');
      
      // Datos de fallback en caso de error
      setOrdenes([]);
      setTecnicos([
        { id: 1, nombre: 'Juan Pérez', especialidad: 'Electrónica' },
        { id: 2, nombre: 'María García', especialidad: 'Software' },
        { id: 3, nombre: 'Carlos López', especialidad: 'Mecánica' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsignarTecnico = async () => {
    if (!tecnicoSeleccionado || !ordenSeleccionada) {
      toast.warning('Seleccione un técnico');
      return;
    }

    try {
      // Simular asignación (en producción sería una llamada a la API)
      const tecnico = tecnicos.find(t => t.id === parseInt(tecnicoSeleccionado));
      
      setOrdenes(prev => prev.map(orden => 
        orden.id === ordenSeleccionada.id 
          ? { ...orden, estado: 'asignada', tecnico_asignado: tecnico }
          : orden
      ));

      setShowAsignarModal(false);
      setTecnicoSeleccionado('');
      setOrdenSeleccionada(null);
      toast.success(`Orden asignada a ${tecnico.nombre}`);
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      toast.error('Error al asignar técnico');
    }
  };

  const handleCambiarEstado = async (ordenId, nuevoEstado) => {
    try {
      setOrdenes(prev => prev.map(orden => 
        orden.id === ordenId 
          ? { ...orden, estado: nuevoEstado }
          : orden
      ));

      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || orden.estado === filtroEstado;
    const cumpleFiltroPrioridad = filtroPrioridad === 'todos' || orden.prioridad === filtroPrioridad;
    return cumpleFiltroEstado && cumpleFiltroPrioridad;
  });

  const contadores = {
    total: ordenes.length,
    pendientes: ordenes.filter(o => o.estado === 'pendiente').length,
    asignadas: ordenes.filter(o => o.estado === 'asignada').length,
    en_proceso: ordenes.filter(o => o.estado === 'en_proceso').length,
    completadas: ordenes.filter(o => o.estado === 'completada').length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: '#6f42c1' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando órdenes de trabajo...</h5>
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
              <i className="bi bi-clipboard-data me-2" style={{ color: '#6f42c1' }}></i>
              Gestión de Órdenes de Trabajo
            </h1>
            <p className="text-muted mb-0">Administra y asigna las órdenes de trabajo reportadas por los clientes</p>
          </div>
        </div>

        {/* Métricas */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.total}</h3>
                <small className="opacity-75">Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.pendientes}</h3>
                <small className="opacity-75">Pendientes</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.asignadas}</h3>
                <small className="opacity-75">Asignadas</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.en_proceso}</h3>
                <small className="opacity-75">En Proceso</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="card-body text-white text-center">
                <h3 className="mb-1 fw-bold">{contadores.completadas}</h3>
                <small className="opacity-75">Completadas</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card border-0 shadow-sm mb-4">
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
                  <option value="asignada">Asignadas</option>
                  <option value="en_proceso">En Proceso</option>
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
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFiltroEstado('todos');
                    setFiltroPrioridad('todos');
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-list-task me-2"></i>
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
                      <th>Máquina</th>
                      <th>Descripción</th>
                      <th>Prioridad</th>
                      <th>Estado</th>
                      <th>Técnico</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesFiltradas.map(orden => (
                      <OrdenTrabajoRow 
                        key={orden.id}
                        orden={orden}
                        onAsignarTecnico={(orden) => {
                          setOrdenSeleccionada(orden);
                          setShowAsignarModal(true);
                        }}
                        onCambiarEstado={handleCambiarEstado}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-clipboard-x display-1 text-muted mb-3"></i>
                <h5 className="text-muted">No hay órdenes de trabajo</h5>
                <p className="text-muted">No se encontraron órdenes con los filtros aplicados</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Asignar Técnico */}
        {showAsignarModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Asignar Técnico</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowAsignarModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <h6>Orden de Trabajo</h6>
                    <p className="text-muted mb-1">
                      <strong>{ordenSeleccionada?.codigo}</strong> - {ordenSeleccionada?.maquina?.nombre}
                    </p>
                    <p className="small text-muted">{ordenSeleccionada?.descripcion}</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Seleccionar Técnico:</label>
                    <select 
                      className="form-select"
                      value={tecnicoSeleccionado}
                      onChange={(e) => setTecnicoSeleccionado(e.target.value)}
                    >
                      <option value="">Seleccione un técnico...</option>
                      {tecnicos.map(tecnico => (
                        <option key={tecnico.id} value={tecnico.id}>
                          {tecnico.nombre} - {tecnico.especialidad}
                        </option>
                      ))}
                    </select>
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
                    onClick={handleAsignarTecnico}
                    disabled={!tecnicoSeleccionado}
                  >
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

function OrdenTrabajoRow({ orden, onAsignarTecnico, onCambiarEstado }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <tr>
      <td>
        <strong className="text-primary">{orden.codigo}</strong>
      </td>
      <td>
        <div>
          <strong>{orden.maquina.nombre}</strong>
          <br />
          <small className="text-muted">Serie: {orden.maquina.numero_serie}</small>
        </div>
      </td>
      <td>
        <div style={{ maxWidth: '200px' }}>
          <p className="mb-1 small">{orden.descripcion}</p>
          {orden.cliente_comentarios && (
            <small className="text-muted">
              <i className="bi bi-chat-quote me-1"></i>
              {orden.cliente_comentarios}
            </small>
          )}
        </div>
      </td>
      <td>
        <span className={`badge bg-${prioridadColors[orden.prioridad]}`}>
          {orden.prioridad}
        </span>
      </td>
      <td>
        <span className={`badge bg-${estadoColors[orden.estado]}`}>
          <i className={`bi ${estadoIcons[orden.estado]} me-1`}></i>
          {orden.estado.replace('_', ' ').toUpperCase()}
        </span>
      </td>
      <td>
        {orden.tecnico_asignado ? (
          <div>
            <strong>{orden.tecnico_asignado.nombre}</strong>
            <br />
            <small className="text-muted">{orden.tecnico_asignado.especialidad}</small>
          </div>
        ) : (
          <span className="text-muted">Sin asignar</span>
        )}
      </td>
      <td>
        <small>{formatDate(orden.fecha_creacion)}</small>
      </td>
      <td>
        <div className="btn-group-vertical btn-group-sm">
          {orden.estado === 'pendiente' && (
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => onAsignarTecnico(orden)}
            >
              <i className="bi bi-person-plus me-1"></i>
              Asignar
            </button>
          )}
          
          {orden.estado === 'asignada' && (
            <button 
              className="btn btn-outline-info btn-sm"
              onClick={() => onCambiarEstado(orden.id, 'en_proceso')}
            >
              <i className="bi bi-play me-1"></i>
              Iniciar
            </button>
          )}
          
          {orden.estado === 'en_proceso' && (
            <button 
              className="btn btn-outline-success btn-sm"
              onClick={() => onCambiarEstado(orden.id, 'completada')}
            >
              <i className="bi bi-check me-1"></i>
              Completar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}