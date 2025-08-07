'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReportesClienteTable from '@/components/ReportesClienteTable';
import ReporteModal from '@/components/ReporteModal';
import AsignarTecnicoModal from '@/components/AsignarTecnicoModal';
import { ReporteCliente, Tecnico } from '@/types/reportes';

const API_URL = 'http://localhost:4000';

export default function ReportesClientePage() {
  const [reportes, setReportes] = useState<ReporteCliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  
  // Modales
  const [modalReporte, setModalReporte] = useState<{
    isOpen: boolean;
    reporte: ReporteCliente | null;
  }>({ isOpen: false, reporte: null });
  
  const [modalTecnico, setModalTecnico] = useState<{
    isOpen: boolean;
    reporte: ReporteCliente | null;
  }>({ isOpen: false, reporte: null });

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      cargarReportes(),
      cargarTecnicos()
    ]).finally(() => setLoading(false));
  }, []);

  // Cargar reportes
  const cargarReportes = async (estado?: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = estado 
        ? `${API_URL}/api/reportes-cliente?estado=${estado}`
        : `${API_URL}/api/reportes-cliente`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar reportes');
      }

      const data = await response.json();
      setReportes(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los reportes');
    }
  };

  // Cargar técnicos activos
  const cargarTecnicos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tecnicos?activo=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar técnicos');
      }

      const data = await response.json();
      setTecnicos(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los técnicos');
    }
  };

  // Filtrar reportes por estado
  const handleFiltroEstado = (estado: string) => {
    setFiltroEstado(estado);
    cargarReportes(estado || undefined);
  };

  // Ver detalles del reporte
  const verDetalles = (reporte: ReporteCliente) => {
    setModalReporte({ isOpen: true, reporte });
  };

  // Asignar técnico
  const asignarTecnico = (reporte: ReporteCliente) => {
    setModalTecnico({ isOpen: true, reporte });
  };

  // Crear orden de trabajo
  const crearOrdenTrabajo = async (reporteId: number, tecnicoId: number, tiempoEstimado?: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ordenes-trabajo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporteId,
          tecnicoId,
          tiempoEstimado: tiempoEstimado || 2
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear orden de trabajo');
      }

      const data = await response.json();
      toast.success('Orden de trabajo creada correctamente');
      
      // Recargar reportes
      cargarReportes(filtroEstado || undefined);
      
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la orden de trabajo');
      throw error;
    }
  };

  // Actualizar estado del reporte
  const actualizarReporte = async (id: number, datos: {
    estado?: string;
    observaciones_admin?: string;
  }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes-cliente`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...datos }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar reporte');
      }

      toast.success('Reporte actualizado correctamente');
      cargarReportes(filtroEstado || undefined);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el reporte');
    }
  };

  // Eliminar reporte
  const eliminarReporte = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes-cliente`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar reporte');
      }

      toast.success('Reporte eliminado correctamente');
      cargarReportes(filtroEstado || undefined);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el reporte');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Reportes de Cliente
        </h1>
        <p className="text-gray-600">
          Administra los reportes enviados por los clientes y asigna técnicos
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => handleFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesado">Procesado</option>
              <option value="resuelto">Resuelto</option>
            </select>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => cargarReportes(filtroEstado || undefined)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-blue-600">
            {reportes.length}
          </div>
          <div className="text-gray-600">Total Reportes</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {reportes.filter(r => r.estadoReporte === 'pendiente').length}
          </div>
          <div className="text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-orange-600">
            {reportes.filter(r => r.estadoReporte === 'procesado').length}
          </div>
          <div className="text-gray-600">En Proceso</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-green-600">
            {reportes.filter(r => r.estadoReporte === 'resuelto').length}
          </div>
          <div className="text-gray-600">Resueltos</div>
        </div>
      </div>

      {/* Tabla de reportes */}
      <ReportesClienteTable
        reportes={reportes}
        onVerDetalles={verDetalles}
        onAsignarTecnico={asignarTecnico}
        onActualizarEstado={actualizarReporte}
        onEliminar={eliminarReporte}
      />

      {/* Modal de detalles del reporte */}
      <ReporteModal
        isOpen={modalReporte.isOpen}
        reporte={modalReporte.reporte}
        onClose={() => setModalReporte({ isOpen: false, reporte: null })}
        onActualizar={actualizarReporte}
      />

      {/* Modal de asignación de técnico */}
      <AsignarTecnicoModal
        isOpen={modalTecnico.isOpen}
        reporte={modalTecnico.reporte}
        tecnicos={tecnicos}
        onClose={() => setModalTecnico({ isOpen: false, reporte: null })}
        onAsignar={crearOrdenTrabajo}
      />
    </div>
  );
}