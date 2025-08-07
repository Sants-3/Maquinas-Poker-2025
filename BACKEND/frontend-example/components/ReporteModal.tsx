import { useState } from 'react';
import { ReporteCliente } from '@/types/reportes';

interface Props {
  isOpen: boolean;
  reporte: ReporteCliente | null;
  onClose: () => void;
  onActualizar: (id: number, datos: { estado?: string; observaciones_admin?: string }) => void;
}

export default function ReporteModal({ isOpen, reporte, onClose, onActualizar }: Props) {
  const [observaciones, setObservaciones] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');

  if (!isOpen || !reporte) return null;

  const handleActualizar = () => {
    const datos: { estado?: string; observaciones_admin?: string } = {};
    
    if (nuevoEstado) datos.estado = nuevoEstado;
    if (observaciones.trim()) datos.observaciones_admin = observaciones.trim();
    
    if (Object.keys(datos).length > 0) {
      onActualizar(reporte.id, datos);
      onClose();
      setObservaciones('');
      setNuevoEstado('');
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES');
  };

  const getGravedadColor = (gravedad: string) => {
    const colors = {
      'Baja': 'text-green-600',
      'Media': 'text-yellow-600',
      'Alta': 'text-orange-600',
      'Crítica': 'text-red-600'
    };
    return colors[gravedad as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Detalles del Reporte #{reporte.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Información del reporte */}
          <div className="space-y-6">
            {/* Cliente y Máquina */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Cliente</h3>
                <div className="space-y-1">
                  <p><strong>Nombre:</strong> {reporte.cliente?.nombre || 'N/A'}</p>
                  <p><strong>Email:</strong> {reporte.cliente?.email || 'N/A'}</p>
                  <p><strong>Teléfono:</strong> {reporte.cliente?.telefono || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Máquina</h3>
                <div className="space-y-1">
                  <p><strong>Código:</strong> {reporte.maquina?.codigo || 'N/A'}</p>
                  <p><strong>Modelo:</strong> {reporte.maquina?.modelo || 'N/A'}</p>
                  <p><strong>Ubicación:</strong> {reporte.maquina?.ubicacion?.nombre || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Detalles del reporte */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Detalles del Reporte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Gravedad:</strong> 
                    <span className={`ml-2 font-semibold ${getGravedadColor(reporte.gravedad)}`}>
                      {reporte.gravedad}
                    </span>
                  </p>
                  <p><strong>Estado:</strong> 
                    <span className="ml-2 capitalize">{reporte.estadoReporte}</span>
                  </p>
                  <p><strong>Fecha del reporte:</strong> {formatFecha(reporte.fechaReporte)}</p>
                  {reporte.fechaAsignacion && (
                    <p><strong>Fecha de asignación:</strong> {formatFecha(reporte.fechaAsignacion)}</p>
                  )}
                </div>
                <div>
                  <p><strong>Estado anterior:</strong> {reporte.estadoAnterior}</p>
                  <p><strong>Estado nuevo:</strong> {reporte.estadoNuevo}</p>
                  {reporte.ordenTrabajoId && (
                    <p><strong>Orden de trabajo:</strong> #{reporte.ordenTrabajoId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Descripción del Problema</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{reporte.descripcion}</p>
            </div>

            {/* Técnico asignado */}
            {reporte.tecnicoAsignado && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Técnico Asignado</h3>
                <div className="space-y-1">
                  <p><strong>Nombre:</strong> {reporte.tecnicoAsignado.nombre}</p>
                  <p><strong>Email:</strong> {reporte.tecnicoAsignado.email}</p>
                  <p><strong>Teléfono:</strong> {reporte.tecnicoAsignado.telefono || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Notas del administrador */}
            {reporte.notasAdmin && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Notas del Administrador</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{reporte.notasAdmin}</p>
              </div>
            )}

            {/* Formulario de actualización */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actualizar Reporte</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cambiar estado:
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Mantener estado actual</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="procesado">Procesado</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones del administrador:
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Agregar observaciones..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleActualizar}
              disabled={!nuevoEstado && !observaciones.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}