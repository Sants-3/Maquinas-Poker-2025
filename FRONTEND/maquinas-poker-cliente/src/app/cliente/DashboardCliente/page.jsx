"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Funciones auxiliares
const getActivityIcon = (type) => {
  const icons = {
    maintenance: 'bi-tools',
    repair: 'bi-wrench',
    financial: 'bi-cash-stack',
    alert: 'bi-exclamation-triangle'
  };
  return icons[type] || 'bi-info-circle';
};

const getActivityColor = (type) => {
  const colors = {
    alert: 'danger',
    financial: 'success',
    maintenance: 'warning'
  };
  return colors[type] || 'primary';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function DashboardCliente() {
  const [machineStats, setMachineStats] = useState({
    operational: 0,
    maintenance: 0,
    outOfService: 0,
    loading: true
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar autenticación y rol
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=' + encodeURIComponent('/cliente/dashboard'));
    } else if (status === 'authenticated' && session?.user?.role !== 'cliente') {
      router.push('/no-autorizado');
    }
  }, [status, session, router]);

  // Cargar datos del dashboard
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'cliente') return;

    const fetchDashboardData = async () => {
      try {
        setMachineStats(prev => ({ ...prev, loading: true }));
        
        // 1. Obtener estadísticas de máquinas
        const statsResponse = await fetch(`/api/cliente/machines/stats?clientId=${session.user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          }
        });

        if (!statsResponse.ok) {
          throw new Error('Error al cargar estadísticas de máquinas');
        }

        const statsData = await statsResponse.json();
        
        // 2. Obtener actividad reciente
        const activityResponse = await fetch(`/api/cliente/activity?clientId=${session.user.id}&limit=5`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          }
        });

        if (!activityResponse.ok) {
          throw new Error('Error al cargar actividad reciente');
        }

        const activityData = await activityResponse.json();

        // Actualizar estado
        setMachineStats({
          operational: statsData.operational || 0,
          maintenance: statsData.maintenance || 0,
          outOfService: statsData.outOfService || 0,
          loading: false
        });

        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setMachineStats(prev => ({
          ...prev,
          loading: false
        }));
        toast.error(error.message || 'Error al cargar datos del dashboard');
      }
    };

    fetchDashboardData();
  }, [status, session]);

  if (status === 'loading' || machineStats.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando dashboard...</p>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'cliente') {
    return null;
  }

  return (
    <div className="container-fluid p-0 min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/cliente/dashboard">
            <i className="bi bi-cpu me-2"></i>
            Dashboard Cliente - {session.user.name}
          </Link>
          <div className="d-flex align-items-center">
            <Link href="/cliente/inventario" className="btn btn-sm btn-outline-light me-2">
              <i className="bi bi-list-check me-1"></i> Ver Inventario
            </Link>
            <Link href="#" onClick={signOut} className="btn btn-sm btn-light">
              <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="container py-4">
        <h1 className="mb-4">
          <i className="bi bi-speedometer2 me-2"></i>
          Panel de Control
        </h1>
        
        {/* Tarjetas de estado */}
        <div className="row mb-4 g-3">
          <div className="col-md-4">
            <div className="card text-white bg-success h-100 shadow-sm">
              <div className="card-body text-center py-4">
                <h5 className="card-title">
                  <i className="bi bi-check-circle me-2"></i>
                  Máquinas Operativas
                </h5>
                <h2 className="display-4 my-3">{machineStats.operational}</h2>
                <Link href="/cliente/inventario?status=Operativa" className="btn btn-outline-light">
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card text-white bg-warning h-100 shadow-sm">
              <div className="card-body text-center py-4">
                <h5 className="card-title">
                  <i className="bi bi-tools me-2"></i>
                  En Mantenimiento
                </h5>
                <h2 className="display-4 my-3">{machineStats.maintenance}</h2>
                <Link href="/cliente/inventario?status=En mantenimiento" className="btn btn-outline-light">
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card text-white bg-danger h-100 shadow-sm">
              <div className="card-body text-center py-4">
                <h5 className="card-title">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Fuera de Servicio
                </h5>
                <h2 className="display-4 my-3">{machineStats.outOfService}</h2>
                <Link href="/cliente/inventario?status=Fuera de servicio" className="btn btn-outline-light">
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-clock-history text-primary me-2"></i>
                Actividad Reciente
              </h5>
              <Link href="/cliente/actividad" className="btn btn-sm btn-outline-primary">
                Ver todo
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentActivity.length > 0 ? (
              <div className="list-group list-group-flush">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <i className={`bi ${getActivityIcon(activity.type)} me-2 text-${getActivityColor(activity.type)}`}></i>
                        <span>{activity.description}</span>
                      </div>
                      <small className="text-muted">{formatDate(activity.date)}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-muted">
                No hay actividad reciente para mostrar
              </div>
            )}
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle text-info me-2"></i>
                  Resumen Rápido
                </h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Total máquinas asignadas</span>
                    <span className="badge bg-primary rounded-pill">
                      {machineStats.operational + machineStats.maintenance + machineStats.outOfService}
                    </span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Porcentaje operativas</span>
                    <span className="badge bg-success rounded-pill">
                      {Math.round((machineStats.operational / (machineStats.operational + machineStats.maintenance + machineStats.outOfService || 1))) * 100}%
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0">
                  <i className="bi bi-lightning-charge text-warning me-2"></i>
                  Acciones Rápidas
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link href="/cliente/inventario" className="btn btn-outline-primary">
                    <i className="bi bi-list-check me-2"></i> Ver Inventario Completo
                  </Link>
                  <Link href="/cliente/reportes/nuevo" className="btn btn-outline-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i> Reportar Problema
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-0">
                <i className="bi bi-c-circle"></i> {new Date().getFullYear()} Poker Machines Manager
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0">
                Versión 1.0.0 | Área de Cliente
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}